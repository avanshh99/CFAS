// ============================================================
// Chat Page — AI chat with GPT-style history sidebar
// ============================================================

import React, { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatHistorySidebar from '@/components/chat/ChatHistorySidebar';
import { useChat } from '@/hooks/useChat';
import { useCarbonStore } from '@/store/carbonStore';
import { useChatStore } from '@/store/chatStore';

const Chat: React.FC = () => {
  const { loadFromStorage: loadCarbonFromStorage } = useCarbonStore();
  const { loadFromStorage: loadChatFromStorage } = useChatStore();

  const {
    sessions,
    viewingSessionId,
    saveAndClearSession,
    viewSession,
    deleteSession,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadChatFromStorage();
    loadCarbonFromStorage();
  }, [loadChatFromStorage, loadCarbonFromStorage]);

  return (
    <div className="flex h-[calc(100vh-64px)] -mx-6 -my-6 overflow-hidden rounded-xl border border-gray-100 shadow-sm bg-white">

      {/* ── Sidebar — desktop always visible, mobile toggled ── */}
      <div
        className={`
          z-20 w-64 shrink-0 flex flex-col transition-transform duration-300
          md:translate-x-0 md:relative md:flex
          absolute inset-y-0 left-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <ChatHistorySidebar
          sessions={sessions}
          activeSessionId={viewingSessionId}
          onNew={() => {
            saveAndClearSession();
            setSidebarOpen(false);
          }}
          onView={(id) => {
            viewSession(id);
            setSidebarOpen(false);
          }}
          onDelete={deleteSession}
          onClose={() => setSidebarOpen(false)}
          className="flex-1"
        />
      </div>

      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="absolute inset-0 z-10 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50/50 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Open chat history"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-gray-900">EcoSense Support</span>
        </div>

        {/* Chat window fills remaining height */}
        <div className="flex-1 flex flex-col overflow-hidden p-4">
          <ChatWindow className="flex-1 h-full" />
        </div>
      </div>
    </div>
  );
};

export default Chat;
