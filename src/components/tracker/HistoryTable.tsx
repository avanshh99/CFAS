// ============================================================
// HistoryTable — History table of logged activities
// ============================================================

import React from 'react';
import { Trash2, Calendar, Car, Zap, UtensilsCrossed, ShoppingBag, Trash2 as TrashIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { IActivity, ActivityCategory } from '@/types';

/** Props interface for HistoryTable component */
export interface IHistoryTableProps {
  activities: IActivity[];
  onDelete: (id: string) => void;
  className?: string;
}

const categoryIcons: Record<ActivityCategory, React.ReactNode> = {
  transport: <Car className="h-4 w-4" />,
  energy: <Zap className="h-4 w-4" />,
  food: <UtensilsCrossed className="h-4 w-4" />,
  shopping: <ShoppingBag className="h-4 w-4" />,
  waste: <TrashIcon className="h-4 w-4" />,
};

const categoryBadgeVariants: Record<ActivityCategory, 'info' | 'warning' | 'destructive' | 'outline' | 'secondary'> = {
  transport: 'info',
  energy: 'warning',
  food: 'destructive',
  shopping: 'outline',
  waste: 'secondary',
};

/**
 * HistoryTable displays a detailed list of previously logged activities with options to delete.
 */
const HistoryTable: React.FC<IHistoryTableProps> = ({ activities, onDelete, className }) => {
  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Activity History</span>
          <span className="text-xs font-normal text-gray-500">
            Showing last {activities.length} entries
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        {activities.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse" aria-label="Carbon footprint activity history">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wider bg-gray-50/50 sm:bg-transparent">
                  <th className="py-3 px-4 font-semibold">Activity</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold text-right">Value</th>
                  <th className="py-3 px-4 font-semibold text-right">CO₂ Impact</th>
                  <th className="py-3 px-4 font-semibold">Logged At</th>
                  <th className="py-3 px-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {activities.map((activity) => {
                  const badgeVariant = categoryBadgeVariants[activity.category];
                  const categoryIcon = categoryIcons[activity.category];

                  return (
                    <tr
                      key={activity.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-medium text-gray-950">
                        {activity.label}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={badgeVariant}
                          className="capitalize gap-1 flex-shrink-0"
                        >
                          <span className="opacity-70">{categoryIcon}</span>
                          <span>{activity.category}</span>
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right text-gray-600">
                        {activity.value.toFixed(1)} {activity.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-red-600">
                        {activity.co2e.toFixed(2)} kg
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(activity.date)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-600"
                          onClick={() => onDelete(activity.id)}
                          aria-label={`Delete ${activity.label} activity log`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 font-medium">No activity history</p>
            <p className="text-xs text-gray-400 mt-1">Activities you log will show up here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryTable;
