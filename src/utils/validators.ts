// ============================================================
// Zod Validation Schemas
// ============================================================

import { z } from 'zod';

/** Schema for a single activity log entry */
export const activitySchema = z.object({
  type: z.string().min(1, 'Activity type is required'),
  value: z
    .number({ message: 'Value must be a number' })
    .min(0, 'Value cannot be negative')
    .max(50000, 'Value exceeds reasonable limit'),
  date: z.date().optional(),
});

/** Schema for chat message input */
export const chatMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(500, 'Message too long (max 500 characters)'),
});

/** Schema for user settings */
export const settingsSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  region: z.string().min(1, 'Region is required'),
  monthlyBudgetKg: z
    .number()
    .min(10, 'Monthly budget must be at least 10 kg')
    .max(5000, 'Monthly budget is unreasonably high'),
  weeklyGoalKg: z
    .number()
    .min(5, 'Weekly goal must be at least 5 kg')
    .max(1000, 'Weekly goal is unreasonably high'),
  currency: z.enum(['INR', 'USD']),
});

/**
 * Sanitize user input before sending to AI.
 * Strips HTML, prevents prompt injection, limits length.
 */
export function sanitizeForAI(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')       // strip HTML tags
    .replace(/[{}]/g, '')          // prevent prompt injection via braces
    .substring(0, 500)             // max length limit
    .trim();
}

export type ActivityInput = z.infer<typeof activitySchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
