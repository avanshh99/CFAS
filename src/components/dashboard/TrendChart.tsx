// ============================================================
// TrendChart — 7-day emission trend line chart
// ============================================================

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { IDailyTrendItem } from '@/types';

/** Props interface for TrendChart component */
export interface ITrendChartProps {
  data: IDailyTrendItem[];
  className?: string;
}

interface ITooltipPayloadItem {
  value: number;
  payload: IDailyTrendItem;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ITooltipPayloadItem[];
}): React.JSX.Element | null => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  if (!item) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 px-3 py-2">
      <p className="text-xs text-gray-500">{item.payload.date}</p>
      <p className="text-sm font-semibold text-gray-900">
        {item.value.toFixed(1)} kg CO₂e
      </p>
    </div>
  );
};

/**
 * TrendChart component renders an area chart showing daily emission totals.
 */
const TrendChart: React.FC<ITrendChartProps> = ({ data, className }) => {
  const chartData = useMemo(() => data, [data]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>7-Day Trend</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 && chartData.some((d) => d.total > 0) ? (
          <div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                role="img"
                aria-labelledby="chart-title-trend chart-desc-trend"
                data={chartData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <title id="chart-title-trend">Weekly CO₂ trend showing decline from 12kg Monday to 6kg Sunday</title>
                <desc id="chart-desc-trend">Line chart with 7 data points representing daily emissions in kg CO₂e</desc>
                <defs>
                  <linearGradient id="colorCO2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="dayLabel"
                  tick={{ fontSize: 12, fill: '#374151' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#374151' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  fill="url(#colorCO2)"
                  dot={{ r: 4, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[220px] text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 font-medium">No data yet</p>
            <p className="text-xs text-gray-400 mt-1">Start logging activities to see trends</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrendChart;
