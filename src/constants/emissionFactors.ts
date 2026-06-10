// ============================================================
// IPCC AR6 + DEFRA 2023 + CEA 2023 Emission Factors
// ============================================================

import type { EmissionFactorKey, ActivityCategory } from '../types';

export const EMISSION_FACTORS: Record<EmissionFactorKey, number> = {
  // Transport (kg CO₂e per km)
  car_petrol_per_km: 0.192,
  car_diesel_per_km: 0.171,
  car_electric_per_km: 0.053,
  motorcycle_per_km: 0.113,
  bus_per_km: 0.089,
  metro_per_km: 0.031,
  auto_rickshaw_per_km: 0.096,
  flight_domestic_per_km: 0.255,
  flight_short_per_km: 0.156,
  flight_long_per_km: 0.195,
  train_per_km: 0.041,

  // Energy
  electricity_india_per_kwh: 0.716,
  electricity_renewable_per_kwh: 0.02,
  lpg_per_kg: 2.983,
  png_per_cubic_meter: 2.037,
  coal_per_kg: 2.42,

  // Food (kg CO₂e per kg of food)
  beef_per_kg: 27.0,
  lamb_per_kg: 39.2,
  pork_per_kg: 12.1,
  chicken_per_kg: 6.9,
  fish_per_kg: 6.1,
  eggs_per_kg: 4.8,
  dairy_per_kg: 3.2,
  vegetables_per_kg: 2.0,
  rice_per_kg: 2.7,
  wheat_per_kg: 1.4,
  lentils_per_kg: 0.9,

  // Shopping
  clothing_per_item: 10.0,
  electronics_per_100_usd: 70.0,
  general_goods_per_100_usd: 28.0,

  // Waste (kg CO₂e per kg of waste)
  landfill_per_kg: 0.572,
  recycled_per_kg: 0.021,
  composted_per_kg: 0.018,
};

/** Map emission factor keys to their parent category */
export const FACTOR_CATEGORY_MAP: Record<EmissionFactorKey, ActivityCategory> = {
  car_petrol_per_km: 'transport',
  car_diesel_per_km: 'transport',
  car_electric_per_km: 'transport',
  motorcycle_per_km: 'transport',
  bus_per_km: 'transport',
  metro_per_km: 'transport',
  auto_rickshaw_per_km: 'transport',
  flight_domestic_per_km: 'transport',
  flight_short_per_km: 'transport',
  flight_long_per_km: 'transport',
  train_per_km: 'transport',

  electricity_india_per_kwh: 'energy',
  electricity_renewable_per_kwh: 'energy',
  lpg_per_kg: 'energy',
  png_per_cubic_meter: 'energy',
  coal_per_kg: 'energy',

  beef_per_kg: 'food',
  lamb_per_kg: 'food',
  pork_per_kg: 'food',
  chicken_per_kg: 'food',
  fish_per_kg: 'food',
  eggs_per_kg: 'food',
  dairy_per_kg: 'food',
  vegetables_per_kg: 'food',
  rice_per_kg: 'food',
  wheat_per_kg: 'food',
  lentils_per_kg: 'food',

  clothing_per_item: 'shopping',
  electronics_per_100_usd: 'shopping',
  general_goods_per_100_usd: 'shopping',

  landfill_per_kg: 'waste',
  recycled_per_kg: 'waste',
  composted_per_kg: 'waste',
};

/** Human-readable labels for emission factor keys */
export const FACTOR_LABELS: Record<EmissionFactorKey, string> = {
  car_petrol_per_km: 'Car (Petrol)',
  car_diesel_per_km: 'Car (Diesel)',
  car_electric_per_km: 'Car (Electric)',
  motorcycle_per_km: 'Motorcycle',
  bus_per_km: 'Bus',
  metro_per_km: 'Metro',
  auto_rickshaw_per_km: 'Auto Rickshaw',
  flight_domestic_per_km: 'Domestic Flight',
  flight_short_per_km: 'Short-haul Flight',
  flight_long_per_km: 'Long-haul Flight',
  train_per_km: 'Train',

  electricity_india_per_kwh: 'Electricity (Grid)',
  electricity_renewable_per_kwh: 'Electricity (Renewable)',
  lpg_per_kg: 'LPG',
  png_per_cubic_meter: 'PNG (Piped Gas)',
  coal_per_kg: 'Coal',

  beef_per_kg: 'Beef',
  lamb_per_kg: 'Lamb',
  pork_per_kg: 'Pork',
  chicken_per_kg: 'Chicken',
  fish_per_kg: 'Fish',
  eggs_per_kg: 'Eggs',
  dairy_per_kg: 'Dairy',
  vegetables_per_kg: 'Vegetables',
  rice_per_kg: 'Rice',
  wheat_per_kg: 'Wheat / Flour',
  lentils_per_kg: 'Lentils / Dal',

  clothing_per_item: 'Clothing',
  electronics_per_100_usd: 'Electronics',
  general_goods_per_100_usd: 'General Goods',

  landfill_per_kg: 'Landfill Waste',
  recycled_per_kg: 'Recycled Waste',
  composted_per_kg: 'Composted Waste',
};

/** Unit labels for each factor */
export const FACTOR_UNITS: Record<EmissionFactorKey, string> = {
  car_petrol_per_km: 'km',
  car_diesel_per_km: 'km',
  car_electric_per_km: 'km',
  motorcycle_per_km: 'km',
  bus_per_km: 'km',
  metro_per_km: 'km',
  auto_rickshaw_per_km: 'km',
  flight_domestic_per_km: 'km',
  flight_short_per_km: 'km',
  flight_long_per_km: 'km',
  train_per_km: 'km',

  electricity_india_per_kwh: 'kWh',
  electricity_renewable_per_kwh: 'kWh',
  lpg_per_kg: 'kg',
  png_per_cubic_meter: 'm³',
  coal_per_kg: 'kg',

  beef_per_kg: 'kg',
  lamb_per_kg: 'kg',
  pork_per_kg: 'kg',
  chicken_per_kg: 'kg',
  fish_per_kg: 'kg',
  eggs_per_kg: 'kg',
  dairy_per_kg: 'kg',
  vegetables_per_kg: 'kg',
  rice_per_kg: 'kg',
  wheat_per_kg: 'kg',
  lentils_per_kg: 'kg',

  clothing_per_item: 'items',
  electronics_per_100_usd: '$ (×100)',
  general_goods_per_100_usd: '$ (×100)',

  landfill_per_kg: 'kg',
  recycled_per_kg: 'kg',
  composted_per_kg: 'kg',
};

/** Category colors for charts */
export const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  transport: '#3b82f6',
  energy: '#f59e0b',
  food: '#ef4444',
  shopping: '#8b5cf6',
  waste: '#6b7280',
};

/** Category icons (Lucide icon names) */
export const CATEGORY_ICONS: Record<ActivityCategory, string> = {
  transport: 'Car',
  energy: 'Zap',
  food: 'UtensilsCrossed',
  shopping: 'ShoppingBag',
  waste: 'Trash2',
};

/** Grouped activity options per category for the form */
export const CATEGORY_OPTIONS: Record<ActivityCategory, EmissionFactorKey[]> = {
  transport: [
    'car_petrol_per_km', 'car_diesel_per_km', 'car_electric_per_km',
    'motorcycle_per_km', 'bus_per_km', 'metro_per_km',
    'auto_rickshaw_per_km', 'flight_domestic_per_km',
    'flight_short_per_km', 'flight_long_per_km', 'train_per_km',
  ],
  energy: [
    'electricity_india_per_kwh', 'electricity_renewable_per_kwh',
    'lpg_per_kg', 'png_per_cubic_meter', 'coal_per_kg',
  ],
  food: [
    'beef_per_kg', 'lamb_per_kg', 'pork_per_kg', 'chicken_per_kg',
    'fish_per_kg', 'eggs_per_kg', 'dairy_per_kg',
    'vegetables_per_kg', 'rice_per_kg', 'wheat_per_kg', 'lentils_per_kg',
  ],
  shopping: [
    'clothing_per_item', 'electronics_per_100_usd', 'general_goods_per_100_usd',
  ],
  waste: [
    'landfill_per_kg', 'recycled_per_kg', 'composted_per_kg',
  ],
};

/** Average values for comparison */
export const COMPARISON_VALUES = {
  indiaAvgTonnesPerYear: 1.8,
  worldAvgTonnesPerYear: 4.8,
  parisGoalTonnesPerYear: 2.0,
};
