// ============================================================
// ChatWindow — The AI conversational assistant interface
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, PlusSquare, ArrowDown, ArrowLeft } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { sanitizeForAI } from '@/utils/validators';
import { CHAT_SCROLL_THRESHOLD } from '@/constants';

/** Props interface for ChatWindow component */
export interface IChatWindowProps {
  onSend?: (sanitizedContent: string) => void;
  className?: string;
}

const QUICK_REPLIES = [
  'How can I reduce my footprint?',
  'Compare my carbon footprint',
  'Give me a weekly carbon summary',
];

/**
 * ChatWindow component provides the messaging UI to interact with EcoSense AI.
 */
const ChatWindow: React.FC<IChatWindowProps> = ({ onSend, className }) => {
  const {
    messages,
    isStreaming,
    error,
    viewingSessionId,
    sendMessage,
    saveAndClearSession,
    exitSessionView,
  } = useChat();
  const [input, setInput] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [srAnnouncement, setSrAnnouncement] = useState('');

  const activeMessages = messages.filter((m) => m.role !== 'system');

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth'): void => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages.length, isStreaming, scrollToBottom]);

  useEffect(() => {
    scrollToBottom('auto');
  }, [scrollToBottom]);

  // Online / Offline state tracking
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Focus management when AI response finishes streaming
  const prevStreaming = useRef(isStreaming);
  useEffect(() => {
    if (prevStreaming.current && !isStreaming) {
      setSrAnnouncement('EcoSense AI has responded');
      // Timeout to clear announcement so it can be announced next time
      setTimeout(() => setSrAnnouncement(''), 1000);
      
      // Delay focus slightly to ensure the element is re-enabled in the DOM
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
    prevStreaming.current = isStreaming;
  }, [isStreaming]);

  const handleScroll = useCallback((): void => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > CHAT_SCROLL_THRESHOLD);
    }
  }, []);

  const handleSend = useCallback(
    async (text: string): Promise<void> => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const sanitized = sanitizeForAI(trimmed);
      if (!sanitized) return;

      setInput('');

      if (onSend) {
        onSend(sanitized);
      } else {
        await sendMessage(sanitized);
      }
    },
    [onSend, sendMessage]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent): void => {
      e.preventDefault();
      handleSend(input);
    },
    [input, handleSend]
  );

  const isReadOnly = viewingSessionId !== null;
  const lastMsg = activeMessages[activeMessages.length - 1];

  return (
    <Card className={`flex flex-col h-[600px] bg-white border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          {isReadOnly ? (
            <>
              <button
                onClick={exitSessionView}
                className="flex items-center gap-1.5 text-xs text-green-700 hover:text-green-800 font-semibold"
                aria-label="Back to live chat"
              >
                <ArrowLeft className="h-4 w-4" /> Back to chat
              </button>
              <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Viewing history</span>
            </>
          ) : (
            <>
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold text-gray-900">EcoSense Assistant</span>
            </>
          )}
        </div>
        {!isReadOnly && activeMessages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={saveAndClearSession}
            className="text-gray-400 hover:text-green-600 gap-1.5"
            aria-label="Save and start new chat"
          >
            <PlusSquare className="h-4 w-4" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        )}
      </div>

      {/* Offline Banner */}
      {!isOnline && (
        <div id="offline-banner" className="p-3 text-sm text-amber-800 bg-amber-50 border-b border-amber-200 text-center font-medium" role="status">
          You are offline. AI assistant features may be limited.
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin"
        role="log"
        aria-label="Chat messages history"
      >
        {activeMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isStreaming && <TypingIndicator />}

        {error && (
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-red-50 border border-red-100 text-center">
            <span className="text-lg">⚠️</span>
            <p className="text-xs text-red-700 mt-1 font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* Bottom area */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 relative">
        {showScrollBtn && (
          <button
            onClick={() => scrollToBottom('smooth')}
            className="absolute -top-12 left-1/2 -translate-x-1/2 bg-green-600 hover:bg-green-700 text-white rounded-full p-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}

        {isReadOnly ? (
          <div className="text-center py-2 text-xs text-gray-500 font-semibold">
            You are viewing a saved conversation session.
            <button
              onClick={exitSessionView}
              className="text-green-700 hover:underline ml-1 font-bold"
            >
              Start new chat
            </button>
          </div>
        ) : (
          <>
            {/* Quick replies */}
            {activeMessages.length === 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => handleSend(reply)}
                    className="text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:border-green-500 hover:bg-green-50/50 text-gray-600 transition-all duration-200"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                role="textbox"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isStreaming}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                aria-label="Chat message input"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isStreaming}
                aria-label="Send message"
                className="flex-shrink-0"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </>
        )}
      </div>

      {/* Live region for accessibility */}
      <div aria-live="polite" aria-atomic="false" className="sr-only">
        {srAnnouncement || (lastMsg?.role === 'assistant' ? lastMsg.content : '')}
      </div>
    </Card>
  );
};

export default ChatWindow;
