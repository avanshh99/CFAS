// ============================================================
// Carbon Equivalences — translate kg CO₂e to vivid comparisons
// ============================================================

export interface Equivalence {
  emoji: string;
  label: string;     // e.g. "km driven in a petrol car"
  factorPerKg: number; // how many units per kg CO₂e
  thresholdKg?: number; // minimum kg before this makes sense
}

// 1 unit of the thing = factorPerKg kg CO₂e
// So X kg CO₂e = X * factorPerKg "units"
export const EQUIVALENCES: Equivalence[] = [
  { emoji: '🚗', label: 'km driven in a petrol car',      factorPerKg: 1 / 0.192,  thresholdKg: 0.5  },
  { emoji: '✈️', label: 'km of domestic flight',          factorPerKg: 1 / 0.255,  thresholdKg: 5    },
  { emoji: '🌳', label: 'days of tree carbon absorption', factorPerKg: 365 / 21,   thresholdKg: 0.1  },
  { emoji: '💡', label: 'hours of a 60W bulb on coal',    factorPerKg: 1 / 0.072,  thresholdKg: 0.1  },
  { emoji: '📱', label: 'smartphone charges',             factorPerKg: 1 / 0.0084, thresholdKg: 0.05 },
  { emoji: '🍔', label: 'beef burger equivalents',        factorPerKg: 1 / 2.5,    thresholdKg: 1    },
  { emoji: '☕', label: 'cups of coffee (with milk)',     factorPerKg: 1 / 0.21,   thresholdKg: 0.5  },
  { emoji: '🚿', label: 'hot showers (8 min)',            factorPerKg: 1 / 0.5,    thresholdKg: 0.2  },
];

export interface ParsedEquivalence {
  emoji: string;
  label: string;
  amount: string;
  sentence: string;
}

export function getEquivalences(kg: number): ParsedEquivalence[] {
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
// 1 tree absorbs ~21 kg CO₂/year
export const KG_PER_TREE_PER_YEAR = 21;
// India carbon offset credit ≈ ₹500 per tonne = ₹0.5 per kg
export const INR_PER_KG_OFFSET = 0.5;
export const USD_PER_KG_OFFSET = 0.006;

export function calcOffset(yearlyKg: number, currency: 'INR' | 'USD' = 'INR') {
  const trees = Math.ceil(yearlyKg / KG_PER_TREE_PER_YEAR);
  const creditCost = yearlyKg * (currency === 'INR' ? INR_PER_KG_OFFSET : USD_PER_KG_OFFSET);
  const symbol = currency === 'INR' ? '₹' : '$';
  return {
    trees,
    creditCost: `${symbol}${Math.ceil(creditCost).toLocaleString()}`,
    solarPanels: Math.ceil(yearlyKg / 200), // avg 200 kg/year saved per panel
  };
}
