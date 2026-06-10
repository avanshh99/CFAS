// ============================================================
// Zod Validation Schemas
// ============================================================

import { z } from 'zod';
import {
  MAX_MESSAGE_LENGTH,
  MAX_NAME_LENGTH,
  MIN_MONTHLY_BUDGET,
  MAX_MONTHLY_BUDGET,
  MIN_WEEKLY_GOAL,
  MAX_WEEKLY_GOAL,
} from '@/constants';

/** 
 * Zod schema for validating a single activity log entry.
 * Checks that type is provided and value is within bounds [0, 50000].
 */
export const activitySchema = z.object({
  type: z.string().min(1, 'Activity type is required'),
  value: z
    .number({ message: 'Value must be a number' })
    .min(0, 'Value cannot be negative')
    .max(50000, 'Value exceeds reasonable limit'),
  date: z.date().optional(),
});

/** 
 * Zod schema for validating chat message input.
 * Ensures the content is not empty and is under MAX_MESSAGE_LENGTH.
 */
export const chatMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(MAX_MESSAGE_LENGTH, `Message too long (max ${MAX_MESSAGE_LENGTH} characters)`),
});

/** 
 * Zod schema for validating user settings/preferences.
 * Validates budget limits, goals, name length, and supported currency.
 */
export const settingsSchema = z.object({
  name: z.string().min(1, 'Name is required').max(MAX_NAME_LENGTH, `Name too long (max ${MAX_NAME_LENGTH} characters)`),
  region: z.string().min(1, 'Region is required'),
  monthlyBudgetKg: z
    .number()
    .min(MIN_MONTHLY_BUDGET, `Monthly budget must be at least ${MIN_MONTHLY_BUDGET} kg`)
    .max(MAX_MONTHLY_BUDGET, `Monthly budget cannot exceed ${MAX_MONTHLY_BUDGET} kg`),
  weeklyGoalKg: z
    .number()
    .min(MIN_WEEKLY_GOAL, `Weekly goal must be at least ${MIN_WEEKLY_GOAL} kg`)
    .max(MAX_WEEKLY_GOAL, `Weekly goal cannot exceed ${MAX_WEEKLY_GOAL} kg`),
  currency: z.enum(['INR', 'USD']),
});

/**
 * Sanitize user input before sending to AI.
 * Strips HTML, prevents prompt injection, limits length.
 * @param input The raw input string from the user
 * @returns The sanitized input string
 */
export function sanitizeForAI(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')       // strip HTML tags
    .replace(/[{}]/g, '')          // prevent prompt injection via braces
    .substring(0, MAX_MESSAGE_LENGTH) // max length limit
    .trim();
}

export type ActivityInput = z.infer<typeof activitySchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
