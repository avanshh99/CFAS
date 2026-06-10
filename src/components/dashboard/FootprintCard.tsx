// ============================================================
// FootprintCard — Main CO₂ summary card on dashboard
// ============================================================

import React from 'react';
import { TrendingDown, TrendingUp, Minus, Target } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';
import type { DashboardStats } from '../../types';

interface FootprintCardProps {
  stats: DashboardStats;
  className?: string;
}

const FootprintCard: React.FC<FootprintCardProps> = ({ stats, className }) => {
  const isDown = stats.percentChange < 0;
  const isUp = stats.percentChange > 0;
  const isFlat = stats.percentChange === 0;

  return (
    <Card className={className}>
      <CardContent className="p-6">
        {/* Main metric */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">This Week</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">
                {stats.weeklyTotal.toFixed(1)}
              </span>
              <span className="text-lg text-gray-500">kg CO₂e</span>
            </div>
          </div>

          {/* Trend badge */}
          <Badge
            variant={isDown ? 'default' : isUp ? 'destructive' : 'secondary'}
            className="flex items-center gap-1"
          >
            {isDown && <TrendingDown className="h-3 w-3" />}
            {isUp && <TrendingUp className="h-3 w-3" />}
            {isFlat && <Minus className="h-3 w-3" />}
            <span>
              {isDown ? '' : isUp ? '+' : ''}
              {stats.percentChange}% vs last week
            </span>
          </Badge>
        </div>

        {/* Monthly budget progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="font-medium text-gray-700">Monthly Budget</span>
            </div>
            <span className="text-gray-500">
              {stats.monthlyTotal.toFixed(1)} / {stats.monthlyBudget} kg
            </span>
          </div>
          <Progress
            value={stats.budgetPercent}
            size="md"
            color={
              stats.budgetPercent > 80
                ? '#dc2626'
                : stats.budgetPercent > 60
                ? '#d97706'
                : undefined
            }
          />
          <p className="text-xs text-gray-400 text-right">
            {stats.budgetPercent}% of monthly budget used
          </p>
        </div>

        {/* Yearly projection */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Projected yearly</span>
            <span className="text-lg font-semibold text-gray-900">
              {stats.yearlyProjection.toFixed(1)}{' '}
              <span className="text-sm font-normal text-gray-500">t/year</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FootprintCard;
