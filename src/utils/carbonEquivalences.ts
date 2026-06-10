// ============================================================
// Carbon Equivalences — translate kg CO₂e to vivid comparisons
// ============================================================

import {
  KG_PER_TREE_PER_YEAR,
  INR_PER_KG_OFFSET,
  USD_PER_KG_OFFSET,
  SOLAR_PANELS_YEARLY_OFFSET,
} from '@/constants';

export interface IEquivalence {
  emoji: string;
  label: string;     // e.g. "km driven in a petrol car"
  factorPerKg: number; // how many units per kg CO₂e
  thresholdKg?: number; // minimum kg before this makes sense
}

// 1 unit of the thing = factorPerKg kg CO₂e
// So X kg CO₂e = X * factorPerKg "units"
export const EQUIVALENCES: IEquivalence[] = [
  { emoji: '🚗', label: 'km driven in a petrol car',      factorPerKg: 1 / 0.192,  thresholdKg: 0.5  },
  { emoji: '✈️', label: 'km of domestic flight',          factorPerKg: 1 / 0.255,  thresholdKg: 5    },
  { emoji: '🌳', label: 'days of tree carbon absorption', factorPerKg: 365 / KG_PER_TREE_PER_YEAR,   thresholdKg: 0.1  },
  { emoji: '💡', label: 'hours of a 60W bulb on coal',    factorPerKg: 1 / 0.072,  thresholdKg: 0.1  },
  { emoji: '📱', label: 'smartphone charges',             factorPerKg: 1 / 0.0084, thresholdKg: 0.05 },
  { emoji: '🍔', label: 'beef burger equivalents',        factorPerKg: 1 / 2.5,    thresholdKg: 1    },
  { emoji: '☕', label: 'cups of coffee (with milk)',     factorPerKg: 1 / 0.21,   thresholdKg: 0.5  },
  { emoji: '🚿', label: 'hot showers (8 min)',            factorPerKg: 1 / 0.5,    thresholdKg: 0.2  },
];

export interface IParsedEquivalence {
  emoji: string;
  label: string;
  amount: string;
  sentence: string;
}

/**
 * Translate a carbon amount in kg into various parsed equivalence comparisons.
 * @param kg Carbon footprint in kg CO₂e
 * @returns Array of parsed equivalence comparisons
 */
export function getEquivalences(kg: number): IParsedEquivalence[] {
  if (kg <= 0) return [];
  return EQUIVALENCES
    .filter((e) => !e.thresholdKg || kg >= e.thresholdKg)
    .map((e) => {
      const amount = kg * e.factorPerKg;
      const formatted = amount >= 1000
        ? `${(amount / 1000).toFixed(1)}k`
        : amount >= 10
          ? Math.round(amount).toLocaleString()
          : amount.toFixed(1);
      return {
        emoji: e.emoji,
        label: e.label,
        amount: formatted,
        sentence: `${formatted} ${e.label}`,
      };
    });
}

// ── Offset Calculator ─────────────────────────────────────────

export interface IOffsetResult {
  trees: number;
  creditCost: string;
  solarPanels: number;
}

/**
 * Calculate the offsets needed (in trees, offset cost, and solar panels) for a given carbon footprint.
 * @param yearlyKg Footprint in kg CO₂e per year
 * @param currency Currency to display ('INR' | 'USD')
 * @returns Object with offset metrics
 */
export function calcOffset(yearlyKg: number, currency: 'INR' | 'USD' = 'INR'): IOffsetResult {
  const trees = Math.ceil(yearlyKg / KG_PER_TREE_PER_YEAR);
  const creditCost = yearlyKg * (currency === 'INR' ? INR_PER_KG_OFFSET : USD_PER_KG_OFFSET);
  const symbol = currency === 'INR' ? '₹' : '$';
  return {
    trees,
    creditCost: `${symbol}${Math.ceil(creditCost).toLocaleString()}`,
    solarPanels: Math.ceil(yearlyKg / SOLAR_PANELS_YEARLY_OFFSET),
  };
}
