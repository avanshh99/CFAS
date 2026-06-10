// ============================================================
// EcoSense — Global TypeScript Interfaces
// ============================================================

/** Supported activity categories */
export type ActivityCategory = 'transport' | 'energy' | 'food' | 'shopping' | 'waste';

/** All supported emission factor keys */
export type EmissionFactorKey =
  // Transport
  | 'car_petrol_per_km' | 'car_diesel_per_km' | 'car_electric_per_km'
  | 'motorcycle_per_km' | 'bus_per_km' | 'metro_per_km'
  | 'auto_rickshaw_per_km' | 'flight_domestic_per_km'
  | 'flight_short_per_km' | 'flight_long_per_km' | 'train_per_km'
  // Energy
  | 'electricity_india_per_kwh' | 'electricity_renewable_per_kwh'
  | 'lpg_per_kg' | 'png_per_cubic_meter' | 'coal_per_kg'
  // Food
  | 'beef_per_kg' | 'lamb_per_kg' | 'pork_per_kg' | 'chicken_per_kg'
  | 'fish_per_kg' | 'eggs_per_kg' | 'dairy_per_kg'
  | 'vegetables_per_kg' | 'rice_per_kg' | 'wheat_per_kg' | 'lentils_per_kg'
  // Shopping
  | 'clothing_per_item' | 'electronics_per_100_usd' | 'general_goods_per_100_usd'
  // Waste
  | 'landfill_per_kg' | 'recycled_per_kg' | 'composted_per_kg';

/** A single logged activity */
export interface IActivity {
  id: string;
  category: ActivityCategory;
  type: EmissionFactorKey;
  label: string;
  value: number;
  unit: string;
  co2e: number; // calculated kg CO₂e
  date: string; // ISO date string
  timestamp: number;
}

/** Chat message for AI assistant */
export interface IChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

/** AI-generated insight */
export interface IInsight {
  id: string;
  type: 'pattern' | 'comparison' | 'actionable';
  title: string;
  description: string;
  icon: string;
  generatedAt: number;
}

/** Suggested action for the user */
export interface ISuggestedAction {
  id: string;
  description: string;
  category: ActivityCategory;
  monthlySavingKg: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'suggested' | 'committed' | 'done' | 'skipped';
}

/** User settings / preferences */
export interface IUserSettings {
  name: string;
  region: string;
  monthlyBudgetKg: number;
  weeklyGoalKg: number;
  currency: 'INR' | 'USD';
}

/** Dashboard summary stats */
export interface IDashboardStats {
  weeklyTotal: number;
  previousWeekTotal: number;
  percentChange: number;
  monthlyTotal: number;
  monthlyBudget: number;
  budgetPercent: number;
  yearlyProjection: number;
  topCategory: ActivityCategory | null;
  categoryBreakdown: ICategoryBreakdownItem[];
  dailyTrend: IDailyTrendItem[];
}

export interface ICategoryBreakdownItem {
  category: ActivityCategory;
  total: number;
  percent: number;
  color: string;
}

export interface IDailyTrendItem {
  date: string;
  dayLabel: string;
  total: number;
}

/** Comparison bar data */
export interface IComparisonData {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

/** A saved conversation session (GPT-style history) */
export interface IChatSession {
  id: string;
  title: string;           // Auto-generated from first user message
  messages: IChatMessage[];
  createdAt: number;
  updatedAt: number;
}
