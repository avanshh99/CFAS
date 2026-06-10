// ============================================================
// ChatHistorySidebar — GPT-style conversation history panel
// ============================================================

import React, { useState, useMemo } from 'react';
import { Plus, Search, Trash2, MessageSquare, X } from 'lucide-react';
import type { ChatSession } from '../../types';

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;    // currently viewed session id (null = live chat)
  onNew: () => void;                  // start fresh new chat
  onView: (id: string) => void;       // view a past session
  onDelete: (id: string) => void;     // delete a session
  onClose?: () => void;               // mobile: close sidebar
  className?: string;
}

// ── Date group helpers ────────────────────────────────────────
function getGroupLabel(ts: number): string {
  const now  = new Date();
  const date = new Date(ts);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7)  return 'Previous 7 days';
  if (diffDays <= 30) return 'Previous 30 days';
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

type GroupedSessions = { label: string; items: ChatSession[] }[];

function groupByDate(sessions: ChatSession[]): GroupedSessions {
  const map = new Map<string, ChatSession[]>();
  const order: string[] = [];

  for (const s of sessions) {
    const label = getGroupLabel(s.updatedAt);
    if (!map.has(label)) {
      map.set(label, []);
      order.push(label);
    }
    map.get(label)!.push(s);
  }

  return order.map((label) => ({ label, items: map.get(label)! }));
}

// ── Component ─────────────────────────────────────────────────
const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  sessions,
  activeSessionId,
  onNew,
  onView,
  onDelete,
  onClose,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return sessions;
    const q = query.toLowerCase();
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [sessions, query]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deletingId === id) {
      onDelete(id);
      setDeletingId(null);
    } else {
      setDeletingId(id);
      // Auto-cancel confirm after 3s
      setTimeout(() => setDeletingId((prev) => (prev === id ? null : prev)), 3000);
    }
  };

  return (
    <aside
      className={`flex flex-col h-full bg-gray-950 text-gray-100 border-r border-gray-800 select-none ${className}`}
      aria-label="Chat history"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        <span className="text-sm font-bold text-white tracking-wide">Chat History</span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* New Chat button */}
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors duration-150"
          aria-label="Start new chat"
        >
          <Plus className="h-4 w-4 shrink-0" />
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations…"
            className="w-full pl-8 pr-3 py-2 text-xs bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
            aria-label="Search chat history"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto py-1 space-y-1 px-2 scrollbar-thin scrollbar-thumb-gray-700">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <MessageSquare className="h-8 w-8 text-gray-700 mb-2" />
            <p className="text-xs text-gray-500">No saved conversations yet.</p>
            <p className="text-xs text-gray-600 mt-1">Start chatting to build history.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <p className="text-xs text-gray-500">No results for &ldquo;{query}&rdquo;</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              <p className="px-2 pt-3 pb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                {group.label}
              </p>
              {group.items.map((session) => {
                const isActive = session.id === activeSessionId;
                const isConfirmingDelete = deletingId === session.id;

                return (
                  <button
                    key={session.id}
                    onClick={() => onView(session.id)}
                    className={`group w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all duration-100 ${
                      isActive
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={`View conversation: ${session.title}`}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                    <span className="flex-1 text-xs truncate leading-snug">{session.title}</span>

                    {/* Delete button — shown on hover or when confirming */}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => handleDelete(e, session.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          handleDelete(e as unknown as React.MouseEvent, session.id);
                        }
                      }}
                      className={`shrink-0 rounded p-0.5 transition-all ${
                        isConfirmingDelete
                          ? 'text-red-400 bg-red-900/30 opacity-100'
                          : 'text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-400'
                      }`}
                      aria-label={isConfirmingDelete ? 'Confirm delete' : 'Delete conversation'}
                      title={isConfirmingDelete ? 'Click again to confirm' : 'Delete'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </span>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-800 text-[10px] text-gray-600 text-center">
        {sessions.length} conversation{sessions.length !== 1 ? 's' : ''} saved
      </div>
    </aside>
  );
};

export default ChatHistorySidebar;
