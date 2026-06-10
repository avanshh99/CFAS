// OffsetCalculator — trees / solar panels / credits needed to go neutral
import React from 'react';
import { calcOffset } from '@/utils/carbonEquivalences';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

/** Props interface for OffsetCalculator component */
export interface IOffsetCalculatorProps {
  yearlyKg: number;
  currency?: 'INR' | 'USD';
  className?: string;
}

/**
 * OffsetCalculator component displays actionable offset comparisons like tree planting or credits.
 */
const OffsetCalculator: React.FC<IOffsetCalculatorProps> = ({
  yearlyKg,
  currency = 'INR',
  className,
}) => {
  const { trees, creditCost, solarPanels } = calcOffset(yearlyKg, currency);

  const items = [
    { emoji: '🌳', label: 'Trees to plant', value: trees.toLocaleString(), sublabel: 'absorb 21 kg CO₂/yr each' },
    { emoji: '☀️', label: 'Solar panels', value: solarPanels.toLocaleString(), sublabel: 'save ~200 kg CO₂/yr each' },
    { emoji: '💳', label: 'Offset credits', value: creditCost, sublabel: 'at market rate' },
  ];

  if (yearlyKg <= 0) return null;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <span>🌿</span>
          Carbon Offset Calculator
        </CardTitle>
        <CardDescription>
          What it takes to neutralize your projected {(yearlyKg / 1000).toFixed(1)} t/year footprint.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50 border border-gray-100"
            >
              <span className="text-2xl mb-1">{item.emoji}</span>
              <p className="text-lg font-extrabold text-gray-900 leading-tight">{item.value}</p>
              <p className="text-[10px] font-semibold text-gray-700 mt-0.5">{item.label}</p>
              <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">{item.sublabel}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-3 text-center leading-relaxed">
          Reduce first, offset what remains. Offsets are a last resort, not a substitute for lifestyle changes.
        </p>
      </CardContent>
    </Card>
  );
};

export default OffsetCalculator;
