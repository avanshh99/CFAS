// ============================================================
// Carbon Calculator — CO₂e emission calculation engine
// ============================================================

import type {
  EmissionFactorKey,
  IActivity,
  ActivityCategory,
  IDashboardStats,
  ICategoryBreakdownItem,
  IDailyTrendItem,
} from '@/types';
import { EMISSION_FACTORS, FACTOR_CATEGORY_MAP, CATEGORY_COLORS } from '@/constants/emissionFactors';

/**
 * Calculate CO₂e emissions for a given emission factor key and value.
 * @param type The emission factor key
 * @param value The logged numeric value (e.g. km traveled, kWh consumed)
 * @returns The calculated emission in kg CO₂e
 * @throws {Error} if value is negative
 * @example
 * const co2 = calculateEmission('car_petrol_per_km', 10);
 */
export function calculateEmission(type: EmissionFactorKey, value: number): number {
  if (value < 0) {
    throw new Error(`Value cannot be negative: ${value}`);
  }
  if (value === 0) return 0;

  const factor = EMISSION_FACTORS[type];
  if (factor === undefined) {
    throw new Error(`Unknown emission factor: ${type}`);
  }

  return Math.round(factor * value * 1000) / 1000;
}

/**
 * Calculate weekly total CO₂e from an array of activity inputs.
 * @param activities List of activity inputs with type and value
 * @returns The total weekly emissions in kg CO₂e
 * @example
 * const total = calculateWeeklyTotal([{ type: 'car_petrol_per_km', value: 15 }]);
 */
export function calculateWeeklyTotal(
  activities: Array<{ type: EmissionFactorKey; value: number }>
): number {
  return activities.reduce((total, activity) => {
    return total + calculateEmission(activity.type, activity.value);
  }, 0);
}

/**
 * Get the start of a week (Monday) for a given date.
 * @param date The baseline date
 * @returns A Date object set to Monday at 00:00:00.000
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the start of the previous week.
 * @param date The baseline date
 * @returns A Date object set to previous week's Monday at 00:00:00.000
 */
function getPreviousWeekStart(date: Date): Date {
  const weekStart = getWeekStart(date);
  weekStart.setDate(weekStart.getDate() - 7);
  return weekStart;
}

/**
 * Compute full dashboard statistics from logged activities.
 * @param activities List of all logged activities
 * @returns The dashboard statistics object
 * @example
 * const stats = computeDashboardStats(activities);
 */
export function computeDashboardStats(activities: IActivity[]): IDashboardStats {
  const now = new Date();
  const weekStart = getWeekStart(now);
  const prevWeekStart = getPreviousWeekStart(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Filter activities for this week
  const thisWeekActivities = activities.filter(
    (a) => new Date(a.date) >= weekStart
  );
  const prevWeekActivities = activities.filter(
    (a) => {
      const d = new Date(a.date);
      return d >= prevWeekStart && d < weekStart;
    }
  );
  const thisMonthActivities = activities.filter(
    (a) => new Date(a.date) >= monthStart
  );

  const weeklyTotal = thisWeekActivities.reduce((sum, a) => sum + a.co2e, 0);
  const previousWeekTotal = prevWeekActivities.reduce((sum, a) => sum + a.co2e, 0);
  const monthlyTotal = thisMonthActivities.reduce((sum, a) => sum + a.co2e, 0);

  const percentChange = previousWeekTotal > 0
    ? Math.round(((weeklyTotal - previousWeekTotal) / previousWeekTotal) * 100)
    : 0;

  const monthlyBudget = 200; // default monthly budget in kg CO₂e
  const budgetPercent = Math.min(100, Math.round((monthlyTotal / monthlyBudget) * 100));

  // Yearly projection based on monthly total
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const projectedMonthly = dayOfMonth > 0 ? (monthlyTotal / dayOfMonth) * daysInMonth : 0;
  const yearlyProjection = (projectedMonthly * 12) / 1000; // convert to tonnes

  // Category breakdown
  const categoryTotals: Record<ActivityCategory, number> = {
    transport: 0,
    energy: 0,
    food: 0,
    shopping: 0,
    waste: 0,
  };

  thisWeekActivities.forEach((a) => {
    const cat = a.category;
    categoryTotals[cat] = (categoryTotals[cat] ?? 0) + a.co2e;
  });

  const totalForBreakdown = Object.values(categoryTotals).reduce((s, v) => s + v, 0);

  const categoryBreakdown: ICategoryBreakdownItem[] = (Object.keys(categoryTotals) as ActivityCategory[])
    .map((category) => {
      const total = categoryTotals[category] ?? 0;
      return {
        category,
        total: Math.round(total * 100) / 100,
        percent: totalForBreakdown > 0 ? Math.round((total / totalForBreakdown) * 100) : 0,
        color: CATEGORY_COLORS[category],
      };
    })
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);

  // Top category
  const topCategory = categoryBreakdown[0] ? categoryBreakdown[0].category : null;

  // Daily trend for past 7 days
  const dailyTrend: IDailyTrendItem[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);

    const dayTotal = activities
      .filter((a) => {
        const ad = new Date(a.date);
        return ad >= d && ad < nextD;
      })
      .reduce((sum, a) => sum + a.co2e, 0);

    const dayIdx = d.getDay();
    const dayLabel = dayNames[dayIdx] ?? 'Day';

    dailyTrend.push({
      date: d.toISOString().split('T')[0] ?? '',
      dayLabel,
      total: Math.round(dayTotal * 100) / 100,
    });
  }

  return {
    weeklyTotal: Math.round(weeklyTotal * 100) / 100,
    previousWeekTotal: Math.round(previousWeekTotal * 100) / 100,
    percentChange,
    monthlyTotal: Math.round(monthlyTotal * 100) / 100,
    monthlyBudget,
    budgetPercent,
    yearlyProjection: Math.round(yearlyProjection * 10) / 10,
    topCategory,
    categoryBreakdown,
    dailyTrend,
  };
}

/**
 * Get the category for an emission factor key.
 * @param key The emission factor key
 * @returns The parent activity category
 */
export function getCategoryForFactor(key: EmissionFactorKey): ActivityCategory {
  return FACTOR_CATEGORY_MAP[key];
}
