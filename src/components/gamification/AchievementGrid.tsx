// AchievementGrid — full badge showcase with locked/unlocked state
import React from 'react';
import { BADGES, RARITY_COLORS } from '../../utils/gamification';

interface AchievementGridProps {
  unlockedBadges: string[];
  compact?: boolean;
}

const rarityLabel: Record<string, string> = {
  common: 'Common', rare: 'Rare', epic: 'Epic', legendary: 'Legendary',
};

const AchievementGrid: React.FC<AchievementGridProps> = ({ unlockedBadges, compact = false }) => {
  const totalUnlocked = unlockedBadges.length;

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Achievements</h3>
            <p className="text-xs text-gray-500">{totalUnlocked} / {BADGES.length} unlocked</p>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
            <span className="text-sm">🏅</span>
            <span className="text-xs font-bold text-amber-700">{totalUnlocked}</span>
          </div>
        </div>
      )}

      <div className={`grid gap-3 ${compact ? 'grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
        {BADGES.map((badge) => {
          const unlocked = unlockedBadges.includes(badge.id);
          return (
            <div
              key={badge.id}
              className={`relative flex flex-col items-center text-center gap-2 rounded-xl border p-3 transition-all duration-200 ${
                unlocked
                  ? `${RARITY_COLORS[badge.rarity]} shadow-sm`
                  : 'bg-gray-50 border-gray-200 opacity-50 grayscale'
              }`}
              title={unlocked ? badge.description : `Locked: ${badge.description}`}
            >
              <span className={`text-3xl ${compact ? 'text-2xl' : 'text-3xl'}`}>
                {unlocked ? badge.emoji : '🔒'}
              </span>
              {!compact && (
                <>
                  <div>
                    <p className="text-xs font-bold leading-tight">{badge.name}</p>
                    <p className="text-[10px] mt-0.5 opacity-70 leading-snug">{badge.description}</p>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${RARITY_COLORS[badge.rarity]}`}>
                    {rarityLabel[badge.rarity]}
                  </span>
                </>
              )}
              {unlocked && (
                <span className="absolute -top-1 -right-1 text-xs bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  ✓
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementGrid;
