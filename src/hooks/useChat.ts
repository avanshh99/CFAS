// ============================================================
// useChat — Chat state management hook with Groq streaming
// ============================================================

import { useCallback, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useCarbonStore } from '../store/carbonStore';
import { streamChatFromProxy } from '../api/groq';
import { sanitizeForAI } from '../utils/validators';
import { computeDashboardStats } from '../utils/carbonCalculator';
import type { ChatMessage } from '../types';

const SYSTEM_PROMPT_TEMPLATE = `
You are EcoSense AI, a friendly and knowledgeable carbon footprint assistant.
You help users understand their environmental impact and suggest personalized,
practical, and achievable actions to reduce their carbon footprint.

User Context:
- Total CO₂ this week: {weeklyTotal} kg CO₂e
- Top emission category: {topCategory}
- Location region: {region}
- Recent activities: {recentActivities}

Guidelines:
- Be encouraging, never judgmental
- Give specific numbers when possible ("switching to LED saves ~0.5 kg CO₂e/month")
- Tailor suggestions to the user's actual logged data
- Keep responses concise (max 150 words) unless asked for detail
- When the user asks "what should I do?", always give exactly 3 ranked actions
- Understand Indian context: mention Indian Railways, solar subsidies, EVs in India
- Support both English and Hinglish queries
`;

function buildSystemPrompt(): string {
  const { activities, settings } = useCarbonStore.getState();
  const stats = computeDashboardStats(activities);

  const recentActivitySummary = activities
    .slice(0, 5)
    .map((a) => `${a.label}: ${a.co2e.toFixed(1)} kg CO₂e`)
    .join(', ') || 'No activities logged yet';

  return SYSTEM_PROMPT_TEMPLATE
    .replace('{weeklyTotal}', stats.weeklyTotal.toFixed(1))
    .replace('{topCategory}', stats.topCategory || 'none')
    .replace('{region}', settings.region)
    .replace('{recentActivities}', recentActivitySummary);
}

export function useChat() {
  const {
    messages,
    isStreaming,
    error,
    viewingSessionId,
    sessions,
    addMessage,
    appendToLastMessage,
    setStreaming,
    setError,
    saveAndClearSession,
    viewSession,
    exitSessionView,
    deleteSession,
    persistActiveMessages,
  } = useChatStore();

  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming) return;

      const sanitized = sanitizeForAI(content);
      if (!sanitized) return;

      // Add user message
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-user`,
        role: 'user',
        content: sanitized,
        timestamp: Date.now(),
      };
      addMessage(userMessage);

      // Prepare assistant placeholder
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };
      addMessage(assistantMessage);
      setStreaming(true);
      setError(null);

      try {
        const apiMessages = [
          { role: 'system' as const, content: buildSystemPrompt() },
          ...messages.slice(-8).map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          { role: 'user' as const, content: sanitized },
        ];

        await streamChatFromProxy(
          apiMessages,
          (text) => appendToLastMessage(text),
          () => {
            setStreaming(false);
            // Auto-persist draft so a page refresh doesn't lose it
            useChatStore.getState().persistActiveMessages();
          },
          (err) => {
            setError(err.message);
            setStreaming(false);
          }
        );
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to get AI response';
        setError(errorMsg);
        setStreaming(false);
        appendToLastMessage(
          "Sorry, I'm having trouble connecting right now. Please check that the proxy server is running on port 3001 and try again."
        );
      }
    },
    [isStreaming, messages, addMessage, appendToLastMessage, setStreaming, setError]
  );

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStreaming(false);
  }, [setStreaming]);

  return {
    messages,
    isStreaming,
    error,
    viewingSessionId,
    sessions,
    sendMessage,
    stopStreaming,
    saveAndClearSession,
    viewSession,
    exitSessionView,
    deleteSession,
    persistActiveMessages,
  };
}

