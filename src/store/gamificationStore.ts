// ============================================================
// Zustand Store — Gamification (XP, Streak, Badges, Habits, Challenges)
// ============================================================

import { create } from 'zustand';
import { encryptData, decryptData } from '../utils/encrypt';
import {
  XP_REWARDS, getLevelForXP, getTodayString, BADGES, HABITS, getWeeklyChallenge,
} from '../utils/gamification';
import type { Challenge } from '../utils/gamification';

const STORAGE_KEY = 'ecosense-gamification';

interface GamificationState {
  // XP & Level
  totalXP: number;
  level: number;

  // Streak
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string | null; // YYYY-MM-DD

  // Badges
  unlockedBadges: string[];
  newlyUnlockedBadges: string[]; // toast queue — not yet dismissed

  // Daily habits
  habitsLog: Record<string, string[]>; // { 'YYYY-MM-DD': ['walked', 'recycled', ...] }

  // Weekly challenge
  challengeStartDate: string | null; // YYYY-MM-DD
  challengeId: string | null;
  challengeCompleted: boolean;
  completedChallengeIds: string[];

  // Weekly report
  lastReportDate: string | null; // YYYY-MM-DD of last Monday shown

  // Activity counters (for badge triggers)
  insightsGeneratedCount: number;
  actionsCompletedCount: number;

  // ── Actions ────────────────────────────────────────────────
  addXP: (amount: number) => void;
  checkAndUpdateStreak: () => void;
  unlockBadge: (id: string) => void;
  dismissNewBadges: () => void;
  toggleHabit: (habitId: string) => void;
  startWeeklyChallenge: () => void;
  checkChallengeCompletion: (params: ChallengeCheckParams) => void;
  incrementInsights: () => void;
  incrementActionsCompleted: () => void;
  markReportShown: () => void;

  loadFromStorage: () => void;
  saveToStorage: () => void;
}

export interface ChallengeCheckParams {
  carTripsThisWeek: number;          // for no-car challenge
  vegetarianMealsThisWeek: number;   // for vegetarian challenge
  electricityKWhThisWeek: number;    // for energy challenge
  transitTripsThisWeek: number;      // for transit challenge
  allHabitsLoggedDays: number;       // days where all habits were completed
}

const defaultState = {
  totalXP: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastLogDate: null,
  unlockedBadges: [] as string[],
  newlyUnlockedBadges: [] as string[],
  habitsLog: {} as Record<string, string[]>,
  challengeStartDate: null as string | null,
  challengeId: null as string | null,
  challengeCompleted: false,
  completedChallengeIds: [] as string[],
  lastReportDate: null as string | null,
  insightsGeneratedCount: 0,
  actionsCompletedCount: 0,
};

export const useGamificationStore = create<GamificationState>((set, get) => ({
  ...defaultState,

  addXP: (amount) => {
    set((state) => {
      const newXP = state.totalXP + amount;
      const newLevel = getLevelForXP(newXP).level;
      return { totalXP: newXP, level: newLevel };
    });
    // Check eco-champion badge on level-up
    const { level, unlockedBadges } = get();
    if (level >= 5 && !unlockedBadges.includes('eco-champion')) {
      get().unlockBadge('eco-champion');
    }
    setTimeout(() => get().saveToStorage(), 0);
  },

  checkAndUpdateStreak: () => {
    const today = getTodayString();
    const { lastLogDate, currentStreak, longestStreak, unlockedBadges } = get();

    if (lastLogDate === today) return; // already logged today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const newStreak = lastLogDate === yesterdayStr ? currentStreak + 1 : 1;
    const newLongest = Math.max(longestStreak, newStreak);

    set({ currentStreak: newStreak, longestStreak: newLongest, lastLogDate: today });

    // Streak badges
    if (newStreak >= 7 && !unlockedBadges.includes('week-warrior')) {
      get().unlockBadge('week-warrior');
      get().addXP(XP_REWARDS.STREAK_7_DAYS);
    }
    if (newStreak >= 30 && !unlockedBadges.includes('month-master')) {
      get().unlockBadge('month-master');
      get().addXP(XP_REWARDS.STREAK_30_DAYS);
    }

    setTimeout(() => get().saveToStorage(), 0);
  },

  unlockBadge: (id) => {
    const { unlockedBadges } = get();
    if (unlockedBadges.includes(id)) return;
    const badge = BADGES.find((b) => b.id === id);
    if (!badge) return;
    set((state) => ({
      unlockedBadges: [...state.unlockedBadges, id],
      newlyUnlockedBadges: [...state.newlyUnlockedBadges, id],
    }));
    // Bonus XP for unlocking
    setTimeout(() => {
      get().addXP(XP_REWARDS.UNLOCK_BADGE);
      get().saveToStorage();
    }, 0);
  },

  dismissNewBadges: () => {
    set({ newlyUnlockedBadges: [] });
  },

  toggleHabit: (habitId) => {
    const today = getTodayString();
    const { habitsLog, unlockedBadges } = get();
    const todayHabits = habitsLog[today] || [];
    const alreadyDone = todayHabits.includes(habitId);
    const updatedHabits = alreadyDone
      ? todayHabits.filter((h) => h !== habitId)
      : [...todayHabits, habitId];

    set((state) => ({
      habitsLog: { ...state.habitsLog, [today]: updatedHabits },
    }));

    if (!alreadyDone) {
      get().addXP(XP_REWARDS.TOGGLE_HABIT);
    }

    // Habit Hero badge — all 6 habits in one day
    if (updatedHabits.length >= HABITS.length && !unlockedBadges.includes('habit-hero')) {
      get().unlockBadge('habit-hero');
    }

    setTimeout(() => get().saveToStorage(), 0);
  },

  startWeeklyChallenge: () => {
    const challenge: Challenge = getWeeklyChallenge();
    set({
      challengeId: challenge.id,
      challengeStartDate: getTodayString(),
      challengeCompleted: false,
    });
    setTimeout(() => get().saveToStorage(), 0);
  },

  checkChallengeCompletion: (params) => {
    const { challengeId, challengeCompleted, unlockedBadges } = get();
    if (!challengeId || challengeCompleted) return;

    let completed = false;
    if (challengeId === 'car-free-week')  completed = params.carTripsThisWeek === 0;
    if (challengeId === 'meatless-week')  completed = params.vegetarianMealsThisWeek >= 5;
    if (challengeId === 'energy-saver')   completed = params.electricityKWhThisWeek < 5;
    if (challengeId === 'transit-champ')  completed = params.transitTripsThisWeek >= 3;
    if (challengeId === 'habit-master')   completed = params.allHabitsLoggedDays >= 5;

    if (completed) {
      set((state) => ({
        challengeCompleted: true,
        completedChallengeIds: [...state.completedChallengeIds, challengeId],
      }));
      get().addXP(XP_REWARDS.COMPLETE_CHALLENGE);
      if (!unlockedBadges.includes('challenge-winner')) {
        get().unlockBadge('challenge-winner');
      }
      setTimeout(() => get().saveToStorage(), 0);
    }
  },

  incrementInsights: () => {
    set((state) => ({ insightsGeneratedCount: state.insightsGeneratedCount + 1 }));
    get().addXP(XP_REWARDS.GENERATE_INSIGHTS);
    const { insightsGeneratedCount, unlockedBadges } = get();
    if (insightsGeneratedCount >= 3 && !unlockedBadges.includes('data-nerd')) {
      get().unlockBadge('data-nerd');
    }
    setTimeout(() => get().saveToStorage(), 0);
  },

  incrementActionsCompleted: () => {
    set((state) => ({ actionsCompletedCount: state.actionsCompletedCount + 1 }));
    get().addXP(XP_REWARDS.COMPLETE_ACTION);
    const { actionsCompletedCount, unlockedBadges } = get();
    if (actionsCompletedCount >= 3 && !unlockedBadges.includes('action-taker')) {
      get().unlockBadge('action-taker');
    }
    setTimeout(() => get().saveToStorage(), 0);
  },

  markReportShown: () => {
    set({ lastReportDate: getTodayString() });
    setTimeout(() => get().saveToStorage(), 0);
  },

  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = decryptData<Partial<GamificationState>>(raw);
        set({
          totalXP: data.totalXP ?? 0,
          level: data.level ?? 1,
          currentStreak: data.currentStreak ?? 0,
          longestStreak: data.longestStreak ?? 0,
          lastLogDate: data.lastLogDate ?? null,
          unlockedBadges: data.unlockedBadges ?? [],
          newlyUnlockedBadges: [],
          habitsLog: data.habitsLog ?? {},
          challengeStartDate: data.challengeStartDate ?? null,
          challengeId: data.challengeId ?? null,
          challengeCompleted: data.challengeCompleted ?? false,
          completedChallengeIds: data.completedChallengeIds ?? [],
          lastReportDate: data.lastReportDate ?? null,
          insightsGeneratedCount: data.insightsGeneratedCount ?? 0,
          actionsCompletedCount: data.actionsCompletedCount ?? 0,
        });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  saveToStorage: () => {
    const state = get();
    const toSave = {
      totalXP: state.totalXP,
      level: state.level,
      currentStreak: state.currentStreak,
      longestStreak: state.longestStreak,
      lastLogDate: state.lastLogDate,
      unlockedBadges: state.unlockedBadges,
      habitsLog: state.habitsLog,
      challengeStartDate: state.challengeStartDate,
      challengeId: state.challengeId,
      challengeCompleted: state.challengeCompleted,
      completedChallengeIds: state.completedChallengeIds,
      lastReportDate: state.lastReportDate,
      insightsGeneratedCount: state.insightsGeneratedCount,
      actionsCompletedCount: state.actionsCompletedCount,
    };
    localStorage.setItem(STORAGE_KEY, encryptData(toSave));
  },
}));
