// ============================================================
// ActivityLogger — Activity list + quick log buttons
// ============================================================

import React from 'react';
import { Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import type { EmissionFactorKey } from '../../types';
import { FACTOR_LABELS } from '../../constants/emissionFactors';

interface QuickLogItem {
  type: EmissionFactorKey;
  value: number;
  label: string;
  emoji: string;
}

const quickLogs: QuickLogItem[] = [
  { type: 'car_petrol_per_km', value: 10, label: '10 km drive', emoji: '🚗' },
  { type: 'bus_per_km', value: 15, label: '15 km bus ride', emoji: '🚌' },
  { type: 'metro_per_km', value: 20, label: '20 km metro', emoji: '🚇' },
  { type: 'electricity_india_per_kwh', value: 5, label: '5 kWh electricity', emoji: '⚡' },
  { type: 'chicken_per_kg', value: 0.3, label: 'Chicken meal', emoji: '🍗' },
  { type: 'rice_per_kg', value: 0.5, label: 'Rice (500g)', emoji: '🍚' },
  { type: 'vegetables_per_kg', value: 0.5, label: 'Veggies (500g)', emoji: '🥗' },
  { type: 'lentils_per_kg', value: 0.3, label: 'Dal (300g)', emoji: '🫘' },
];

interface ActivityLoggerProps {
  onQuickLog: (type: EmissionFactorKey, value: number) => void;
  className?: string;
}

const ActivityLogger: React.FC<ActivityLoggerProps> = ({ onQuickLog, className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-600" />
          Quick Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          Tap a common activity to log it instantly:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {quickLogs.map((item) => (
            <Button
              key={`${item.type}-${item.value}`}
              variant="outline"
              className="justify-start h-auto py-2.5 px-3 text-left"
              onClick={() => onQuickLog(item.type, item.value)}
              aria-label={`Log ${item.label} (${FACTOR_LABELS[item.type]})`}
            >
              <span className="text-base mr-2">{item.emoji}</span>
              <span className="text-xs text-gray-700 truncate">{item.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityLogger;
