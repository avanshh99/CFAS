// ============================================================
// TypingIndicator — Renders typing dot animation
// ============================================================

import React from 'react';
import { Sparkles } from 'lucide-react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex gap-3 w-full max-w-3xl self-start animate-fade-in">
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm shadow-sm">
        <Sparkles className="h-4 w-4" />
      </div>

      <div className="flex flex-col gap-1 rounded-xl rounded-tl-none bg-white border border-gray-100 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5 h-4" aria-label="EcoSense AI is typing">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-typing-dot" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-typing-dot" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-typing-dot" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
