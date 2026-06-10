// StreakBadge — flame icon + current streak count
import React from 'react';

interface StreakBadgeProps {
  streak: number;
  compact?: boolean;
}

const StreakBadge: React.FC<StreakBadgeProps> = ({ streak, compact = false }) => {
  const isActive = streak > 0;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-sm font-bold transition-colors ${
          isActive ? 'text-orange-500' : 'text-gray-400'
        }`}
        title={`${streak}-day streak`}
        aria-label={`${streak} day streak`}
      >
        🔥 {streak}
      </span>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
        isActive
          ? 'bg-orange-50 border-orange-200'
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      <span className={`text-xl ${isActive ? '' : 'grayscale opacity-50'}`}>🔥</span>
      <div>
        <p className={`text-lg font-extrabold leading-none ${isActive ? 'text-orange-600' : 'text-gray-500'}`}>
          {streak}
        </p>
        <p className="text-[10px] font-medium text-gray-500 leading-none mt-0.5">
          {streak === 1 ? 'day streak' : 'day streak'}
        </p>
      </div>
    </div>
  );
};

export default StreakBadge;
