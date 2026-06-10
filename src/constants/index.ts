// ============================================================
// Application Constants
// ============================================================

/** Maximum number of assistant and user turns to feed into the API context window */
export const MAX_CHAT_HISTORY = 8;

/** Maximum message state history limit for UI session */
export const MAX_CHAT_HISTORY_LIMIT = 11;

/** Default monthly carbon budget in kg CO₂e */
export const MONTHLY_BUDGET_KG = 200;

/** Default debounce latency in milliseconds */
export const DEBOUNCE_MS = 500;

/** Validation boundaries for user settings */
export const MIN_MONTHLY_BUDGET = 10;
export const MAX_MONTHLY_BUDGET = 5000;
export const MIN_WEEKLY_GOAL = 5;
export const MAX_WEEKLY_GOAL = 1000;

/** Text length constraints */
export const MAX_MESSAGE_LENGTH = 500;
export const MAX_NAME_LENGTH = 50;

/** Offset calculations factors */
export const KG_PER_TREE_PER_YEAR = 21;
export const INR_PER_KG_OFFSET = 0.5;
export const USD_PER_KG_OFFSET = 0.006;
export const SOLAR_PANELS_YEARLY_OFFSET = 200;

/** Calendar heatmap config */
export const CALENDAR_WEEKS = 20;

/** UI Interaction thresholds */
export const CHAT_SCROLL_THRESHOLD = 300;
export const AUTO_CANCEL_CONFIRM_MS = 3000;

export * from './emissionFactors';
