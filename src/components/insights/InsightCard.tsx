// ============================================================
// InsightCard — Individual AI-generated insight display
// ============================================================

import React from 'react';
import { Lightbulb, TrendingUp, Compass } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { Insight } from '../../types';

interface InsightCardProps {
  insight: Insight;
  className?: string;
}

const typeConfig = {
  pattern: {
    icon: <TrendingUp className="h-5 w-5 text-amber-600" />,
    badgeText: 'Pattern',
    badgeVariant: 'warning' as const,
    bgClass: 'from-amber-50/50 to-orange-50/20 border-amber-100',
  },
  comparison: {
    icon: <Compass className="h-5 w-5 text-blue-600" />,
    badgeText: 'Comparison',
    badgeVariant: 'info' as const,
    bgClass: 'from-blue-50/50 to-indigo-50/20 border-blue-100',
  },
  actionable: {
    icon: <Lightbulb className="h-5 w-5 text-green-600" />,
    badgeText: 'Actionable',
    badgeVariant: 'default' as const,
    bgClass: 'from-green-50/50 to-emerald-50/20 border-green-100',
  },
};

const InsightCard: React.FC<InsightCardProps> = ({ insight, className }) => {
  const config = typeConfig[insight.type] || typeConfig.actionable;

  return (
    <Card className={`overflow-hidden bg-gradient-to-br border transition-all duration-300 ${config.bgClass} ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2.5 rounded-xl bg-white shadow-sm border border-gray-100">
            {config.icon}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Badge variant={config.badgeVariant}>{config.badgeText}</Badge>
              <span className="text-[10px] text-gray-400 font-medium">
                {new Date(insight.generatedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <h4 className="text-base font-bold text-gray-900 leading-tight">
              {insight.title}
            </h4>

            <p className="text-sm text-gray-600 leading-relaxed">
              {insight.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightCard;
export { typeConfig };
