// ============================================================
// CategoryBreakdown — Donut chart for emission categories
// ============================================================

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import type { CategoryBreakdownItem } from '../../types';

interface CategoryBreakdownProps {
  data: CategoryBreakdownItem[];
  className?: string;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: CategoryBreakdownItem;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 px-3 py-2">
      <p className="text-sm font-semibold text-gray-900 capitalize">{item.name}</p>
      <p className="text-xs text-gray-500">
        {item.value.toFixed(1)} kg CO₂e ({item.payload.percent}%)
      </p>
    </div>
  );
};

const CATEGORY_LABELS: Record<string, string> = {
  transport: 'Transport',
  energy: 'Energy',
  food: 'Food',
  shopping: 'Shopping',
  waste: 'Waste',
};

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ data, className }) => {
  const chartData = useMemo(
    () => data.map((d) => ({ ...d, name: CATEGORY_LABELS[d.category] || d.category })),
    [data]
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div
            role="img"
            aria-label={`Donut chart showing emission breakdown: ${chartData
              .map((d) => `${d.name} accounts for ${d.percent}%`)
              .join(', ')}`}
          >
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="total"
                  nameKey="name"
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {chartData.map((item) => (
                <div key={item.category} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-600">
                    {item.name} {item.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[240px] text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 font-medium">No breakdown yet</p>
            <p className="text-xs text-gray-400 mt-1">Log activities to see your category split</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdown;
