// ============================================================
// ComparisonBar — Comparison vs national / global averages
// ============================================================

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import type { IComparisonData } from '@/types';

/** Props interface for ComparisonBar component */
export interface IComparisonBarProps {
  userValueTonnes: number;
  className?: string;
}

/**
 * ComparisonBar component compares the user's projected carbon footprint
 * to regional averages and targets.
 */
const ComparisonBar: React.FC<IComparisonBarProps> = ({ userValueTonnes, className }) => {
  const comparisonItems: IComparisonData[] = [
    { label: 'You (Projected)', value: userValueTonnes, color: '#16a34a', maxValue: 8 },
    { label: 'India Average', value: 1.8, color: '#3b82f6', maxValue: 8 },
    { label: 'Paris Goal', value: 2.0, color: '#8b5cf6', maxValue: 8 },
    { label: 'World Average', value: 4.8, color: '#ef4444', maxValue: 8 },
  ];

  const maxVal = Math.max(...comparisonItems.map((item) => item.value), 6);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>How You Compare</CardTitle>
        <CardDescription>
          Your yearly projected footprint compared to national, global averages, and climate targets.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {comparisonItems.map((item) => {
          const isUser = item.label.includes('You');
          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className={`font-medium ${isUser ? 'text-green-700 font-bold' : 'text-gray-700'}`}>
                  {item.label}
                </span>
                <span className="font-semibold text-gray-950">
                  {item.value.toFixed(1)} t/year
                </span>
              </div>
              <Progress
                value={item.value}
                max={maxVal}
                color={item.color}
                size={isUser ? 'lg' : 'md'}
              />
            </div>
          );
        })}
        <div className="pt-2 text-[11px] text-gray-400 leading-relaxed">
          * Targets and averages are measured in metric tonnes of CO₂ equivalent per capita per year.
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonBar;
