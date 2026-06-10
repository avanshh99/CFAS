// ============================================================
// Zustand Store — Carbon Footprint Data
// ============================================================

import { create } from 'zustand';
import type { Activity, SuggestedAction, UserSettings } from '../types';
import { encryptData, decryptData } from '../utils/encrypt';

interface CarbonState {
  activities: Activity[];
  actions: SuggestedAction[];
  settings: UserSettings;
  isLoading: boolean;

  // Activity CRUD
  addActivity: (activity: Activity) => void;
  removeActivity: (id: string) => void;
  clearActivities: () => void;

  // Actions
  setActions: (actions: SuggestedAction[]) => void;
  updateActionStatus: (id: string, status: SuggestedAction['status']) => void;

  // Settings
  updateSettings: (settings: Partial<UserSettings>) => void;

  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const STORAGE_KEY = 'ecosense-carbon-data';

const defaultSettings: UserSettings = {
  name: 'User',
  region: 'India',
  monthlyBudgetKg: 200,
  weeklyGoalKg: 50,
  currency: 'INR',
};

export const useCarbonStore = create<CarbonState>((set, get) => ({
  activities: [],
  actions: [],
  settings: defaultSettings,
  isLoading: false,

  addActivity: (activity) => {
    set((state) => {
      const newActivities = [activity, ...state.activities];
      return { activities: newActivities };
    });
    // Persist after state update
    setTimeout(() => get().saveToStorage(), 0);
  },

  removeActivity: (id) => {
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    }));
    setTimeout(() => get().saveToStorage(), 0);
  },

  clearActivities: () => {
    set({ activities: [] });
    setTimeout(() => get().saveToStorage(), 0);
  },

  setActions: (actions) => {
    set({ actions });
    setTimeout(() => get().saveToStorage(), 0);
  },

  updateActionStatus: (id, status) => {
    set((state) => ({
      actions: state.actions.map((a) =>
        a.id === id ? { ...a, status } : a
      ),
    }));
    setTimeout(() => get().saveToStorage(), 0);
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
    setTimeout(() => get().saveToStorage(), 0);
  },

  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = decryptData<{
          activities: Activity[];
          actions: SuggestedAction[];
          settings: UserSettings;
        }>(raw);
        set({
          activities: data.activities || [],
          actions: data.actions || [],
          settings: { ...defaultSettings, ...data.settings },
        });
      }
    } catch {
      // If decryption fails, start fresh
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  saveToStorage: () => {
    const { activities, actions, settings } = get();
    const encrypted = encryptData({ activities, actions, settings });
    localStorage.setItem(STORAGE_KEY, encrypted);
  },
}));
