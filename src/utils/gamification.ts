// ============================================================
// Gamification Constants — XP, Levels, Badges, Challenges, Habits
// ============================================================

// ── XP Rewards ───────────────────────────────────────────────
export const XP_REWARDS = {
  LOG_ACTIVITY: 10,
  COMPLETE_ACTION: 50,
  STREAK_7_DAYS: 100,
  STREAK_30_DAYS: 300,
  ASK_AI: 5,
  GENERATE_INSIGHTS: 25,
  BEAT_WEEKLY_GOAL: 75,
  TOGGLE_HABIT: 15,
  UNLOCK_BADGE: 20,
  COMPLETE_CHALLENGE: 150,
} as const;

// ── Levels ───────────────────────────────────────────────────
export interface Level {
  level: number;
  name: string;
  emoji: string;
  minXP: number;
  color: string;
}

export const LEVELS: Level[] = [
  { level: 1, name: 'Carbon Novice',    emoji: '🌿', minXP: 0,    color: '#6b7280' },
  { level: 2, name: 'Eco Curious',      emoji: '🌱', minXP: 500,  color: '#16a34a' },
  { level: 3, name: 'Green Thinker',    emoji: '🍃', minXP: 1000, color: '#0ea5e9' },
  { level: 4, name: 'Eco Warrior',      emoji: '⚔️',  minXP: 1500, color: '#8b5cf6' },
  { level: 5, name: 'Planet Guardian',  emoji: '🛡️',  minXP: 2000, color: '#f59e0b' },
  { level: 6, name: 'Climate Champion', emoji: '🏆', minXP: 2500, color: '#ef4444' },
];

export const XP_PER_LEVEL = 500;

export function getLevelForXP(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getXPProgress(xp: number): { current: number; needed: number; percent: number } {
  const level = getLevelForXP(xp);
  const nextLevelMinXP = level.level < LEVELS.length
    ? LEVELS[level.level].minXP
    : level.minXP + XP_PER_LEVEL;
  const current = xp - level.minXP;
  const needed = nextLevelMinXP - level.minXP;
  const percent = Math.min(100, Math.round((current / needed) * 100));
  return { current, needed, percent };
}

// ── Badges ───────────────────────────────────────────────────
export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const BADGES: Badge[] = [
  { id: 'first-step',       name: 'First Step',       emoji: '🌱', description: 'Log your first activity',           rarity: 'common'    },
  { id: 'week-warrior',     name: 'Week Warrior',     emoji: '🔥', description: '7-day logging streak',              rarity: 'rare'      },
  { id: 'month-master',     name: 'Month Master',     emoji: '🌙', description: '30-day logging streak',             rarity: 'epic'      },
  { id: 'transit-switcher', name: 'Transit Switcher', emoji: '🚇', description: 'Log metro/bus 5× in a week',        rarity: 'rare'      },
  { id: 'plant-powered',    name: 'Plant Powered',    emoji: '🥗', description: 'Log vegetarian meals 5× in a week', rarity: 'rare'      },
  { id: 'under-budget',     name: 'Under Budget',     emoji: '💡', description: 'Stay under monthly budget',         rarity: 'rare'      },
  { id: 'action-taker',     name: 'Action Taker',     emoji: '✅', description: 'Complete 3 suggested actions',      rarity: 'common'    },
  { id: 'data-nerd',        name: 'Data Nerd',        emoji: '📊', description: 'Generate AI insights 3×',          rarity: 'common'    },
  { id: 'carbon-cutter',    name: 'Carbon Cutter',    emoji: '🌍', description: 'Reduce footprint 10% vs last month',rarity: 'epic'      },
  { id: 'eco-champion',     name: 'Eco Champion',     emoji: '🏆', description: 'Reach Level 5',                    rarity: 'legendary' },
  { id: 'habit-hero',       name: 'Habit Hero',       emoji: '⚡', description: 'Complete all habits in a single day',rarity: 'rare'     },
  { id: 'challenge-winner', name: 'Challenge Winner', emoji: '🎯', description: 'Complete a weekly challenge',       rarity: 'epic'      },
];

export const RARITY_COLORS: Record<Badge['rarity'], string> = {
  common:    'bg-gray-100 border-gray-200 text-gray-700',
  rare:      'bg-blue-50 border-blue-200 text-blue-700',
  epic:      'bg-purple-50 border-purple-200 text-purple-700',
  legendary: 'bg-amber-50 border-amber-200 text-amber-700',
};

// ── Daily Habits ──────────────────────────────────────────────
export interface Habit {
  id: string;
  emoji: string;
  label: string;
  xp: number;
}

export const HABITS: Habit[] = [
  { id: 'walked',      emoji: '🚶', label: 'Walked instead of driving',  xp: 15 },
  { id: 'vegetarian',  emoji: '🥗', label: 'Vegetarian meal today',      xp: 15 },
  { id: 'lights-off',  emoji: '💡', label: 'Turned off lights when out', xp: 10 },
  { id: 'short-shower',emoji: '🚿', label: 'Short shower (<5 min)',       xp: 10 },
  { id: 'recycled',    emoji: '♻️', label: 'Recycled today',             xp: 15 },
  { id: 'composted',   emoji: '🌿', label: 'Composted food waste',       xp: 20 },
];

// ── Weekly Challenges ────────────────────────────────────────
export interface Challenge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  xpReward: number;
  durationDays: number;
  type: 'no-car' | 'vegetarian' | 'energy' | 'transit' | 'habits';
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'car-free-week',  name: 'Car-Free Week',    emoji: '🚗',
    description: 'Log zero petrol/diesel car trips this week',
    xpReward: 200, durationDays: 7, type: 'no-car',
  },
  {
    id: 'meatless-week',  name: 'Meatless Week',    emoji: '🥦',
    description: 'No beef or lamb logged for 7 days',
    xpReward: 200, durationDays: 7, type: 'vegetarian',
  },
  {
    id: 'energy-saver',   name: 'Energy Saver',     emoji: '⚡',
    description: 'Keep electricity below 5 kWh total this week',
    xpReward: 175, durationDays: 7, type: 'energy',
  },
  {
    id: 'transit-champ',  name: 'Transit Champion', emoji: '🚇',
    description: 'Log metro or bus at least 3× this week',
    xpReward: 175, durationDays: 7, type: 'transit',
  },
  {
    id: 'habit-master',   name: 'Habit Master',     emoji: '🏅',
    description: 'Complete all 6 daily habits at least once',
    xpReward: 250, durationDays: 7, type: 'habits',
  },
];

// Get this week's challenge by rotating based on ISO week number
export function getWeeklyChallenge(): Challenge {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  return CHALLENGES[weekNum % CHALLENGES.length];
}

// ── Today helper ──────────────────────────────────────────────
export function getTodayString(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}
