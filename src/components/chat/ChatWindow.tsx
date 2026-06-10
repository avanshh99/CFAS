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

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin flex flex-col"
      >
        {activeMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto my-auto">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <span className="text-2xl">🌱</span>
            </div>
            <h3 className="text-base font-semibold text-gray-900">Meet your Carbon Assistant</h3>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
              I can analyze your carbon activities, recommend green actions, or compare your emissions against averages.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activeMessages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isStreaming && <TypingIndicator />}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg" role="alert">
                Error: {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="p-4 border-t border-gray-100 bg-white space-y-3 relative">
        {showScrollBtn && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => scrollToBottom('smooth')}
            className="absolute -top-12 right-6 rounded-full shadow-lg border-gray-200 bg-white hover:bg-gray-50 z-10"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4 text-gray-600" />
          </Button>
        )}

        {isReadOnly ? (
          <div className="text-center py-2">
            <p className="text-xs text-gray-400">This is a read-only view of a past conversation.</p>
            <button
              onClick={exitSessionView}
              className="mt-1 text-xs text-green-600 hover:text-green-700 font-semibold underline"
            >
              Start a new chat →
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
        {lastMsg?.role === 'assistant' ? lastMsg.content : ''}
      </div>
    </Card>
  );
};

export default ChatWindow;
