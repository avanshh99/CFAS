// ============================================================
// useCarbon — Carbon calculation and dashboard stats hook
// ============================================================

import { useMemo, useCallback } from 'react';
import { useCarbonStore } from '@/store/carbonStore';
import { computeDashboardStats, calculateEmission, getCategoryForFactor } from '@/utils/carbonCalculator';
import { FACTOR_LABELS, FACTOR_UNITS } from '@/constants/emissionFactors';
import type { IActivity, EmissionFactorKey, IDashboardStats } from '@/types';

export interface IUseCarbonReturn {
  activities: IActivity[];
  stats: IDashboardStats;
  logActivity: (type: EmissionFactorKey, value: number, dateStr?: string) => IActivity;
  deleteActivity: (id: string) => void;
  recentActivities: IActivity[];
}

/**
 * Custom React hook for carbon activity calculation and statistic aggregations.
 * @returns Carbon helpers and computed dashboard statistics
 */
export function useCarbon(): IUseCarbonReturn {
  const { activities, addActivity, removeActivity } = useCarbonStore();

  const stats = useMemo(() => computeDashboardStats(activities), [activities]);

  const logActivity = useCallback(
    (type: EmissionFactorKey, value: number, dateStr?: string): IActivity => {
      const co2e = calculateEmission(type, value);
      const now = dateStr || new Date().toISOString();

      const activity: IActivity = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        category: getCategoryForFactor(type),
        type,
        label: FACTOR_LABELS[type],
        value,
        unit: FACTOR_UNITS[type],
        co2e,
        date: now,
        timestamp: Date.now(),
      };

      addActivity(activity);
      return activity;
    },
    [addActivity]
  );

  const deleteActivity = useCallback(
    (id: string): void => {
      removeActivity(id);
    },
    [removeActivity]
  );

  const recentActivities = useMemo(
    (): IActivity[] => activities.slice(0, 20),
    [activities]
  );

  return {
    activities,
    stats,
    logActivity,
    deleteActivity,
    recentActivities,
  };
}
