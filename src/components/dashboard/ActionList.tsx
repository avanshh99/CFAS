// ============================================================
// ActionList — Recommended actions with CO₂ savings
// ============================================================

import React from 'react';
import {
  Car,
  Zap,
  UtensilsCrossed,
  ShoppingBag,
  Trash2,
  Check,
  Clock,
  X as XIcon,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { SuggestedAction, ActivityCategory } from '../../types';

interface ActionListProps {
  actions: SuggestedAction[];
  onUpdateStatus: (id: string, status: SuggestedAction['status']) => void;
  className?: string;
}

const categoryIcons: Record<ActivityCategory, React.ReactNode> = {
  transport: <Car className="h-4 w-4" />,
  energy: <Zap className="h-4 w-4" />,
  food: <UtensilsCrossed className="h-4 w-4" />,
  shopping: <ShoppingBag className="h-4 w-4" />,
  waste: <Trash2 className="h-4 w-4" />,
};

const difficultyColors: Record<string, 'default' | 'warning' | 'destructive'> = {
  Easy: 'default',
  Medium: 'warning',
  Hard: 'destructive',
};

const ActionList: React.FC<ActionListProps> = ({ actions, onUpdateStatus, className }) => {
  const activeActions = actions.filter((a) => a.status !== 'skipped');

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recommended Actions</span>
          <Badge variant="secondary">{activeActions.length} active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeActions.length > 0 ? (
          <div className="space-y-3">
            {activeActions.map((action) => (
              <div
                key={action.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${
                  action.status === 'done'
                    ? 'bg-green-50/50 border-green-200'
                    : action.status === 'committed'
                    ? 'bg-blue-50/50 border-blue-200'
                    : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    action.status === 'done'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {categoryIcons[action.category]}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    action.status === 'done' ? 'text-green-700 line-through' : 'text-gray-900'
                  }`}>
                    {action.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant={difficultyColors[action.difficulty]}>
                      {action.difficulty}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      saves ~{action.monthlySavingKg} kg/month
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {action.status === 'suggested' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateStatus(action.id, 'committed')}
                        aria-label={`Commit to: ${action.description}`}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Clock className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateStatus(action.id, 'done')}
                        aria-label={`Mark done: ${action.description}`}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateStatus(action.id, 'skipped')}
                        aria-label={`Skip: ${action.description}`}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                  {action.status === 'committed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUpdateStatus(action.id, 'done')}
                      aria-label={`Mark done: ${action.description}`}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Done
                    </Button>
                  )}
                  {action.status === 'done' && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-3">
              <ChevronRight className="h-8 w-8 text-green-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No actions yet</p>
            <p className="text-xs text-gray-400 mt-1">Log some activities and check Insights for personalized suggestions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActionList;
