// BadgeToast — animated toast popup when a badge is newly unlocked
import React, { useEffect } from 'react';
import { BADGES } from '@/utils/gamification';
import { useGamificationStore } from '@/store/gamificationStore';

const BadgeToast: React.FC = () => {
  const { newlyUnlockedBadges, dismissNewBadges } = useGamificationStore();

  useEffect(() => {
    if (newlyUnlockedBadges.length > 0) {
      const timer = setTimeout(dismissNewBadges, 4500);
      return () => clearTimeout(timer);
    }
  }, [newlyUnlockedBadges, dismissNewBadges]);

  if (newlyUnlockedBadges.length === 0) return null;

  const latestId = newlyUnlockedBadges[newlyUnlockedBadges.length - 1];
  const badge = BADGES.find((b) => b.id === latestId);
  if (!badge) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 animate-slide-in-up"
      role="status"
      aria-live="polite"
      aria-label={`Badge unlocked: ${badge.name}`}
    >
      <div className="flex items-center gap-3 bg-white rounded-2xl shadow-2xl border border-amber-200 px-4 py-3 pr-5 max-w-xs">
        {/* Confetti-like glow ring */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-400 opacity-20 animate-ping" />
          <span className="relative text-3xl">{badge.emoji}</span>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
            🎉 Badge Unlocked!
          </p>
          <p className="text-sm font-bold text-gray-900">{badge.name}</p>
          <p className="text-xs text-gray-500">{badge.description}</p>
        </div>
        <button
          onClick={dismissNewBadges}
          className="ml-auto text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default BadgeToast;
