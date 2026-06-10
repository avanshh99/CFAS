// XPBar — Level name, XP progress bar, and next level info
import React from 'react';
import { getLevelForXP, getXPProgress, LEVELS } from '../../utils/gamification';

interface XPBarProps {
  totalXP: number;
  compact?: boolean;
}

const XPBar: React.FC<XPBarProps> = ({ totalXP, compact = false }) => {
  const level = getLevelForXP(totalXP);
  const { current, needed, percent } = getXPProgress(totalXP);
  const isMaxLevel = level.level >= LEVELS.length;

  if (compact) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-gray-700 flex items-center gap-1">
            <span>{level.emoji}</span> Lv.{level.level} {level.name}
          </span>
          <span className="text-gray-400">{totalXP} XP</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percent}%`, backgroundColor: level.color }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{level.emoji}</span>
          <div>
            <p className="text-sm font-bold text-gray-900">Level {level.level}</p>
            <p className="text-xs text-gray-500">{level.name}</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-gray-700">{totalXP.toLocaleString()} XP</span>
      </div>

      <div className="space-y-1">
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${percent}%`, backgroundColor: level.color }}
          />
        </div>
        {!isMaxLevel && (
          <p className="text-[10px] text-gray-400 text-right">
            {current} / {needed} XP to Level {level.level + 1}
          </p>
        )}
        {isMaxLevel && (
          <p className="text-[10px] text-amber-600 font-semibold text-right">🏆 Max Level Reached!</p>
        )}
      </div>
    </div>
  );
};

export default XPBar;
