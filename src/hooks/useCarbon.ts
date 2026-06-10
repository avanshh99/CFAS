// ============================================================
// useCarbon — Carbon calculation and dashboard stats hook
// ============================================================

import { useMemo, useCallback } from 'react';
import { useCarbonStore } from '../store/carbonStore';
import { computeDashboardStats, calculateEmission, getCategoryForFactor } from '../utils/carbonCalculator';
import { FACTOR_LABELS, FACTOR_UNITS } from '../constants/emissionFactors';
import type { Activity, EmissionFactorKey } from '../types';

export function useCarbon() {
  const { activities, addActivity, removeActivity } = useCarbonStore();

  const stats = useMemo(() => computeDashboardStats(activities), [activities]);

  const logActivity = useCallback(
    (type: EmissionFactorKey, value: number, dateStr?: string) => {
      const co2e = calculateEmission(type, value);
      const now = dateStr || new Date().toISOString();

      const activity: Activity = {
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
    (id: string) => {
      removeActivity(id);
    },
    [removeActivity]
  );

  const recentActivities = useMemo(
    () => activities.slice(0, 20),
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
