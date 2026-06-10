// ============================================================
// MessageBubble — Renders a chat message safely
// ============================================================

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Sparkles } from 'lucide-react';
import type { ChatMessage } from '../../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 w-full max-w-3xl animate-fade-in ${
        isUser ? 'flex-row-reverse self-end' : 'self-start'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg text-sm shadow-sm ${
          isUser
            ? 'bg-green-600 text-white'
            : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>

      {/* Bubble */}
      <div
        className={`relative flex flex-col gap-1 rounded-xl px-4 py-2.5 text-sm shadow-sm max-w-[85%] ${
          isUser
            ? 'bg-green-600 text-white rounded-tr-none'
            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
        }`}
      >
        <div className="prose prose-sm break-words focus:outline-none">
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <div className="leading-relaxed space-y-2 prose-p:leading-relaxed prose-li:my-1 prose-ul:list-disc prose-ol:list-decimal prose-ul:pl-4 prose-ol:pl-4">
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline font-semibold"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <span
          className={`text-[10px] self-end mt-1 select-none ${
            isUser ? 'text-green-100' : 'text-gray-400'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
