// ============================================================
// Carbon Calculator — CO₂e emission calculation engine
// ============================================================

import type { EmissionFactorKey, Activity, ActivityCategory, DashboardStats, CategoryBreakdownItem, DailyTrendItem } from '../types';
import { EMISSION_FACTORS, FACTOR_CATEGORY_MAP, CATEGORY_COLORS } from '../constants/emissionFactors';

/**
 * Calculate CO₂e emissions for a given emission factor key and value.
 * @throws {Error} if value is negative
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
 * Calculate weekly total CO₂e from an array of activities.
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
 */
function getPreviousWeekStart(date: Date): Date {
  const weekStart = getWeekStart(date);
  weekStart.setDate(weekStart.getDate() - 7);
  return weekStart;
}

/**
 * Compute full dashboard statistics from activities.
 */
export function computeDashboardStats(activities: Activity[]): DashboardStats {
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
    categoryTotals[a.category] += a.co2e;
  });

  const totalForBreakdown = Object.values(categoryTotals).reduce((s, v) => s + v, 0);

  const categoryBreakdown: CategoryBreakdownItem[] = (Object.keys(categoryTotals) as ActivityCategory[])
    .map((category) => ({
      category,
      total: Math.round(categoryTotals[category] * 100) / 100,
      percent: totalForBreakdown > 0
        ? Math.round((categoryTotals[category] / totalForBreakdown) * 100)
        : 0,
      color: CATEGORY_COLORS[category],
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);

  // Top category
  const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0].category : null;

  // Daily trend for past 7 days
  const dailyTrend: DailyTrendItem[] = [];
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

    dailyTrend.push({
      date: d.toISOString().split('T')[0],
      dayLabel: dayNames[d.getDay()],
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
 */
export function getCategoryForFactor(key: EmissionFactorKey): ActivityCategory {
  return FACTOR_CATEGORY_MAP[key];
}
