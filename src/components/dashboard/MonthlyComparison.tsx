// MonthlyComparison — 3-month grouped bar chart by category
import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import type { IActivity, ActivityCategory } from '@/types';

/** Props interface for MonthlyComparison component */
export interface IMonthlyComparisonProps {
  activities: IActivity[];
  className?: string;
}

const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  transport: '#3b82f6',
  energy:    '#f59e0b',
  food:      '#ef4444',
  shopping:  '#8b5cf6',
  waste:     '#6b7280',
};

/**
 * MonthlyComparison displays a bar chart comparing category footprint totals
 * over the last 3 calendar months.
 */
const MonthlyComparison: React.FC<IMonthlyComparisonProps> = ({ activities, className }) => {
  const chartData = useMemo(() => {
    const months: { key: string; label: string }[] = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString(undefined, { month: 'short' });
      months.push({ key, label });
    }

    return months.map(({ key, label }) => {
      const row: Record<string, string | number> = { month: label };
      const monthActivities = activities.filter((a) => a.date.startsWith(key));
      const categories: ActivityCategory[] = ['transport','energy','food','shopping','waste'];
      for (const cat of categories) {
        row[cat] = +monthActivities
          .filter((a) => a.category === cat)
          .reduce((sum, a) => sum + a.co2e, 0)
          .toFixed(1);
      }
      return row;
    });
  }, [activities]);

  const hasData = activities.length > 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <span>📊</span>
          Monthly Breakdown
        </CardTitle>
        <CardDescription>kg CO₂e per category over the last 3 months</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-2xl mb-2">📊</p>
            <p className="text-sm text-gray-500">Log activities to see your monthly comparison</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} unit=" kg" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                formatter={(value: unknown) => [`${String(value)} kg`, '']}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              {(Object.keys(CATEGORY_COLORS) as ActivityCategory[]).map((cat) => {
                const color = CATEGORY_COLORS[cat];
                return (
                  <Bar
                    key={cat}
                    dataKey={cat}
                    fill={color}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={28}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyComparison;
