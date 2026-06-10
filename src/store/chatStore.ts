// ============================================================
// Zustand Store — Chat with GPT-style session history
// ============================================================

import { create } from 'zustand';
import type { ChatMessage, ChatSession } from '../types';
import { encryptData, decryptData } from '../utils/encrypt';

// ── Storage keys ─────────────────────────────────────────────
const SESSIONS_KEY   = 'ecosense-chat-sessions';
const ACTIVE_KEY     = 'ecosense-active-session';

// ── Helpers ──────────────────────────────────────────────────
function generateTitle(messages: ChatMessage[]): string {
  const first = messages.find((m) => m.role === 'user');
  if (!first) return 'New conversation';
  const raw = first.content.trim().replace(/\s+/g, ' ');
  return raw.length > 45 ? raw.slice(0, 42) + '…' : raw;
}

function newSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Store interface ───────────────────────────────────────────
interface ChatState {
  // Active in-progress messages
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;

  // Session list (saved conversations)
  sessions: ChatSession[];

  // Which saved session we're viewing (null = live/new chat)
  viewingSessionId: string | null;

  // ── Message actions ──────────────────────────────────────────
  addMessage:          (msg: ChatMessage) => void;
  appendToLastMessage: (text: string) => void;
  setStreaming:        (v: boolean) => void;
  setError:            (e: string | null) => void;

  // ── Session actions ──────────────────────────────────────────
  /** Save current messages as a new session and clear active chat */
  saveAndClearSession: () => void;

  /** Load a past session into view (read-only) */
  viewSession:     (id: string) => void;

  /** Return to the live new-chat pane */
  exitSessionView: () => void;

  /** Delete a session by id */
  deleteSession:   (id: string) => void;

  /** Auto-called after streaming finishes — updates the live session draft */
  persistActiveMessages: () => void;

  // ── Storage ──────────────────────────────────────────────────
  loadFromStorage: () => void;
  saveToStorage:   () => void;
}

// ── Store implementation ──────────────────────────────────────
export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  error: null,
  sessions: [],
  viewingSessionId: null,

  // ── Message actions ───────────────────────────────────────────
  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message], error: null }));
    setTimeout(() => get().saveToStorage(), 0);
  },

  appendToLastMessage: (text) => {
    set((state) => {
      const msgs = [...state.messages];
      if (msgs.length > 0) {
        const last = msgs[msgs.length - 1];
        msgs[msgs.length - 1] = { ...last, content: last.content + text };
      }
      return { messages: msgs };
    });
  },

  setStreaming: (isStreaming) => set({ isStreaming }),

  setError: (error) => set({ error }),

  // ── Session actions ───────────────────────────────────────────
  saveAndClearSession: () => {
    const { messages, sessions } = get();
    const userMessages = messages.filter((m) => m.role !== 'system');

    if (userMessages.length < 2) {
      // Nothing meaningful to save; just clear
      set({ messages: [], error: null, viewingSessionId: null });
      return;
    }

    const newSession: ChatSession = {
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

  viewSession: (id) => {
    const { sessions } = get();
    const session = sessions.find((s) => s.id === id);
    if (session) {
      set({ viewingSessionId: id, messages: session.messages, error: null });
    }
  },

  exitSessionView: () => {
    // Restore blank live chat (unsaved draft is lost — acceptable UX)
    set({ viewingSessionId: null, messages: [], error: null });
    // Reload the live draft if we persisted it
    const raw = localStorage.getItem(ACTIVE_KEY);
    if (raw) {
      try {
        const data = decryptData<{ messages: ChatMessage[] }>(raw);
        set({ messages: data.messages || [] });
      } catch { /* ignore */ }
    }
  },

  deleteSession: (id) => {
    const { sessions, viewingSessionId } = get();
    const updated = sessions.filter((s) => s.id !== id);
    set({
      sessions: updated,
      // If we were viewing the deleted session, exit to live chat
      viewingSessionId: viewingSessionId === id ? null : viewingSessionId,
      messages: viewingSessionId === id ? [] : get().messages,
    });
    get().saveToStorage();
  },

  persistActiveMessages: () => {
    // Saves the current in-progress messages so they survive a page refresh
    const { messages, viewingSessionId } = get();
    if (viewingSessionId) return; // don't overwrite draft when viewing a past session
    try {
      const encrypted = encryptData({ messages });
      localStorage.setItem(ACTIVE_KEY, encrypted);
    } catch { /* ignore */ }
  },

  // ── Storage ───────────────────────────────────────────────────
  loadFromStorage: () => {
    // Load sessions list
    try {
      const raw = localStorage.getItem(SESSIONS_KEY);
      if (raw) {
        const data = decryptData<{ sessions: ChatSession[] }>(raw);
        set({ sessions: data.sessions || [] });
      }
    } catch {
      localStorage.removeItem(SESSIONS_KEY);
    }

    // Restore active (unsaved) draft messages
    try {
      const raw = localStorage.getItem(ACTIVE_KEY);
      if (raw) {
        const data = decryptData<{ messages: ChatMessage[] }>(raw);
        set({ messages: data.messages || [] });
      }
    } catch {
      localStorage.removeItem(ACTIVE_KEY);
    }
  },

  saveToStorage: () => {
    const { sessions, messages, viewingSessionId } = get();
    // Always save sessions list
    try {
      localStorage.setItem(SESSIONS_KEY, encryptData({ sessions }));
    } catch { /* ignore */ }
    // Save active draft only when not viewing a past session
    if (!viewingSessionId) {
      try {
        localStorage.setItem(ACTIVE_KEY, encryptData({ messages }));
      } catch { /* ignore */ }
    }
  },
}));
