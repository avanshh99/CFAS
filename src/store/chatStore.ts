// ============================================================
// Zustand Store — Chat with GPT-style session history
// ============================================================

import { create } from 'zustand';
import type { IChatMessage, IChatSession } from '@/types';
import { encryptData, decryptData } from '@/utils/encrypt';
import { MAX_CHAT_HISTORY_LIMIT } from '@/constants';

// ── Storage keys ─────────────────────────────────────────────
const SESSIONS_KEY = 'ecosense-chat-sessions';
const ACTIVE_KEY = 'ecosense-active-session';

/**
 * Generate a descriptive title based on the first user message.
 * @param messages Array of chat messages
 * @returns A title string
 */
function generateTitle(messages: IChatMessage[]): string {
  const first = messages.find((m) => m.role === 'user');
  if (!first) return 'New conversation';
  const raw = first.content.trim().replace(/\s+/g, ' ');
  return raw.length > 45 ? raw.slice(0, 42) + '…' : raw;
}

/**
 * Generate a unique session ID.
 * @returns A unique session ID string
 */
function newSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Store interface ───────────────────────────────────────────
interface IChatState {
  messages: IChatMessage[];
  isStreaming: boolean;
  error: string | null;
  sessions: IChatSession[];
  viewingSessionId: string | null;

  // ── Message actions ──────────────────────────────────────────
  /**
   * Add a new chat message to the active session.
   * @param msg The chat message object to add
   */
  addMessage: (msg: IChatMessage) => void;

  /**
   * Append a chunk of text to the last message content (used in streaming).
   * @param text The text chunk to append
   */
  appendToLastMessage: (text: string) => void;

  /**
   * Update the streaming status of the chat.
   * @param v True if streaming is in progress, false otherwise
   */
  setStreaming: (v: boolean) => void;

  /**
   * Set the current error message.
   * @param e The error message string or null to clear the error
   */
  setError: (e: string | null) => void;

  // ── Session actions ──────────────────────────────────────────
  /**
   * Save the current active messages as a new saved session and clear active chat.
   */
  saveAndClearSession: () => void;

  /**
   * Load a past session into the active view as read-only.
   * @param id The session ID to view
   */
  viewSession: (id: string) => void;

  /**
   * Exit the past session view and restore the active live chat draft.
   */
  exitSessionView: () => void;

  /**
   * Delete a saved session by its ID.
   * @param id The session ID to delete
   */
  deleteSession: (id: string) => void;

  /**
   * Persist the active draft messages so they survive a page refresh.
   */
  persistActiveMessages: () => void;

  // ── Storage ──────────────────────────────────────────────────
  /**
   * Load saved sessions and the active draft from local storage.
   */
  loadFromStorage: () => void;

  /**
   * Save the current sessions list and active draft to local storage.
   */
  saveToStorage: () => void;
}

// ── Store implementation ──────────────────────────────────────
export const useChatStore = create<IChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  error: null,
  sessions: [],
  viewingSessionId: null,

  // ── Message actions ───────────────────────────────────────────
  addMessage: (message: IChatMessage): void => {
    set((state) => {
      let msgs = [...state.messages, message];
      if (msgs.length > MAX_CHAT_HISTORY_LIMIT) {
        msgs = msgs.slice(msgs.length - MAX_CHAT_HISTORY_LIMIT);
      }
      return { messages: msgs, error: null };
    });
    setTimeout(() => get().saveToStorage(), 0);
  },

  appendToLastMessage: (text: string): void => {
    set((state) => {
      const msgs = [...state.messages];
      if (msgs.length > 0) {
        const last = msgs[msgs.length - 1];
        if (last) {
          msgs[msgs.length - 1] = { ...last, content: last.content + text };
        }
      }
      return { messages: msgs };
    });
  },

  setStreaming: (isStreaming: boolean): void => set({ isStreaming }),

  setError: (error: string | null): void => set({ error }),

  // ── Session actions ───────────────────────────────────────────
  saveAndClearSession: (): void => {
    const { messages, sessions } = get();
    const userMessages = messages.filter((m) => m.role !== 'system');

    if (userMessages.length < 2) {
      set({ messages: [], error: null, viewingSessionId: null });
      return;
    }

    const newSession: IChatSession = {
      id: newSessionId(),
      title: generateTitle(userMessages),
      messages: userMessages,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedSessions = [newSession, ...sessions];
    set({ sessions: updatedSessions, messages: [], error: null, viewingSessionId: null });
    get().saveToStorage();
  },

  viewSession: (id: string): void => {
    const { sessions } = get();
    const session = sessions.find((s) => s.id === id);
    if (session) {
      set({ viewingSessionId: id, messages: session.messages, error: null });
    }
  },

  exitSessionView: (): void => {
    set({ viewingSessionId: null, messages: [], error: null });
    const raw = localStorage.getItem(ACTIVE_KEY);
    if (raw) {
      try {
        const data = decryptData<{ messages: IChatMessage[] }>(raw);
        set({ messages: data.messages || [] });
      } catch { /* ignore */ }
    }
  },

  deleteSession: (id: string): void => {
    const { sessions, viewingSessionId } = get();
    const updated = sessions.filter((s) => s.id !== id);
    set({
      sessions: updated,
      viewingSessionId: viewingSessionId === id ? null : viewingSessionId,
      messages: viewingSessionId === id ? [] : get().messages,
    });
    get().saveToStorage();
  },

  persistActiveMessages: (): void => {
    const { messages, viewingSessionId } = get();
    if (viewingSessionId) return;
    try {
      const encrypted = encryptData({ messages });
      localStorage.setItem(ACTIVE_KEY, encrypted);
    } catch { /* ignore */ }
  },

  // ── Storage ───────────────────────────────────────────────────
  loadFromStorage: (): void => {
    try {
      const raw = localStorage.getItem(SESSIONS_KEY);
      if (raw) {
        const data = decryptData<{ sessions: IChatSession[] }>(raw);
        set({ sessions: data.sessions || [] });
      }
    } catch {
      localStorage.removeItem(SESSIONS_KEY);
    }

    try {
      const raw = localStorage.getItem(ACTIVE_KEY);
      if (raw) {
        const data = decryptData<{ messages: IChatMessage[] }>(raw);
        set({ messages: data.messages || [] });
      }
    } catch {
      localStorage.removeItem(ACTIVE_KEY);
    }
  },

  saveToStorage: (): void => {
    const { sessions, messages, viewingSessionId } = get();
    try {
      localStorage.setItem(SESSIONS_KEY, encryptData({ sessions }));
    } catch { /* ignore */ }
    if (!viewingSessionId) {
      try {
        localStorage.setItem(ACTIVE_KEY, encryptData({ messages }));
      } catch { /* ignore */ }
    }
  },
}));
