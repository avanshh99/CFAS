// ============================================================
// Zustand Store — Carbon Footprint Data
// ============================================================

import { create } from 'zustand';
import type { IActivity, ISuggestedAction, IUserSettings } from '@/types';
import { encryptData, decryptData } from '@/utils/encrypt';
import { useGamificationStore } from '@/store/gamificationStore';

interface ICarbonState {
  activities: IActivity[];
  actions: ISuggestedAction[];
  settings: IUserSettings;
  isLoading: boolean;

  // Activity CRUD
  /**
   * Add a new carbon activity log.
   * @param activity The activity log object
   */
  addActivity: (activity: IActivity) => void;

  /**
   * Remove an activity log by ID.
   * @param id The activity ID to remove
   */
  removeActivity: (id: string) => void;

  /**
   * Clear all activity logs from state and storage.
   */
  clearActivities: () => void;

  // Actions
  /**
   * Set the list of suggested AI actions.
   * @param actions The list of actions
   */
  setActions: (actions: ISuggestedAction[]) => void;

  /**
   * Update the status of a specific action.
   * @param id The action ID
   * @param status The new status
   */
  updateActionStatus: (id: string, status: ISuggestedAction['status']) => void;

  // Settings
  /**
   * Update the user settings profile.
   * @param settings The settings updates
   */
  updateSettings: (settings: Partial<IUserSettings>) => void;

  // Persistence
  /**
   * Load carbon activities, actions, and settings from local storage.
   */
  loadFromStorage: () => void;

  /**
   * Save carbon activities, actions, and settings to local storage.
   */
  saveToStorage: () => void;
}

const STORAGE_KEY = 'ecosense-carbon-data';

const defaultSettings: IUserSettings = {
  name: 'User',
  region: 'India',
  monthlyBudgetKg: 200,
  weeklyGoalKg: 50,
  currency: 'INR',
};

export const useCarbonStore = create<ICarbonState>((set, get) => ({
  activities: [],
  actions: [],
  settings: defaultSettings,
  isLoading: false,

  addActivity: (activity: IActivity): void => {
    set((state) => {
      const newActivities = [activity, ...state.activities];
      return { activities: newActivities };
    });

    const gamification = useGamificationStore.getState();
    gamification.checkAndUpdateStreak();
    gamification.unlockBadge('first-step');
    gamification.addXP(10);

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const currentActivities = get().activities;
    const weeklyActs = currentActivities.filter((a) => a.timestamp >= oneWeekAgo);

    const carTrips = weeklyActs.filter((a) => a.type === 'car_petrol_per_km' || a.type === 'car_diesel_per_km').length;
    const vegMeals = weeklyActs.filter((a) => a.type === 'vegetables_per_kg' || a.type === 'rice_per_kg' || a.type === 'wheat_per_kg' || a.type === 'lentils_per_kg').length;
    const electricityKWh = weeklyActs.filter((a) => a.category === 'energy').reduce((sum, a) => sum + a.value, 0);
    const transitTrips = weeklyActs.filter((a) => a.type === 'metro_per_km' || a.type === 'bus_per_km').length;

    const allHabitsLoggedDays = Object.values(gamification.habitsLog).filter((list) => list.length >= 6).length;

    if (transitTrips >= 5) {
      gamification.unlockBadge('transit-switcher');
    }
    if (vegMeals >= 5) {
      gamification.unlockBadge('plant-powered');
    }

    gamification.checkChallengeCompletion({
      carTripsThisWeek: carTrips,
      vegetarianMealsThisWeek: vegMeals,
      electricityKWhThisWeek: electricityKWh,
      transitTripsThisWeek: transitTrips,
      allHabitsLoggedDays,
    });

    setTimeout(() => get().saveToStorage(), 0);
  },

  removeActivity: (id: string): void => {
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    }));
    setTimeout(() => get().saveToStorage(), 0);
  },

  clearActivities: (): void => {
    set({ activities: [] });
    setTimeout(() => get().saveToStorage(), 0);
  },

  setActions: (actions: ISuggestedAction[]): void => {
    set({ actions });
    setTimeout(() => get().saveToStorage(), 0);
  },

  updateActionStatus: (id: string, status: ISuggestedAction['status']): void => {
    set((state) => ({
      actions: state.actions.map((a) =>
        a.id === id ? { ...a, status } : a
      ),
    }));
    setTimeout(() => get().saveToStorage(), 0);
  },

  updateSettings: (newSettings: Partial<IUserSettings>): void => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
    setTimeout(() => get().saveToStorage(), 0);
  },

  loadFromStorage: (): void => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = decryptData<{
          activities: IActivity[];
          actions: ISuggestedAction[];
          settings: IUserSettings;
        }>(raw);
        set({
          activities: data.activities || [],
          actions: data.actions || [],
          settings: { ...defaultSettings, ...data.settings },
        });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  saveToStorage: (): void => {
    const { activities, actions, settings } = get();
    const encrypted = encryptData({ activities, actions, settings });
    localStorage.setItem(STORAGE_KEY, encrypted);
  },
}));
