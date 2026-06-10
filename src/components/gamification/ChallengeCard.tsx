// ChallengeCard — weekly challenge with progress and countdown
import React, { useEffect, useState } from 'react';
import { Trophy, CheckCircle2 } from 'lucide-react';
import { getWeeklyChallenge } from '../../utils/gamification';
import { useGamificationStore } from '../../store/gamificationStore';
import { Button } from '../ui/Button';

const ChallengeCard: React.FC = () => {
  const {
    challengeId,
    challengeCompleted,
    challengeStartDate,
    startWeeklyChallenge,
  } = useGamificationStore();

  const challenge = getWeeklyChallenge();
  const isActive = challengeId === challenge.id;
  const isCompleted = isActive && challengeCompleted;

  // Days remaining
  const [daysLeft, setDaysLeft] = useState(7);
  useEffect(() => {
    if (challengeStartDate) {
      const start = new Date(challengeStartDate).getTime();
      const now = Date.now();
      const diff = 7 - Math.floor((now - start) / (1000 * 60 * 60 * 24));
      setDaysLeft(Math.max(0, diff));
    }
  }, [challengeStartDate]);

  return (
    <div className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-300 ${
      isCompleted
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
        : isActive
          ? 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200'
          : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
    }`}>
      {/* Background decoration */}
      <div className="absolute right-3 top-3 text-4xl opacity-10 select-none" aria-hidden="true">
        {challenge.emoji}
      </div>

      <div className="relative z-10 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{challenge.emoji}</span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                This Week's Challenge
              </p>
              <h4 className="text-sm font-bold text-gray-900">{challenge.name}</h4>
            </div>
          </div>
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          ) : (
            <div className="flex items-center gap-1 bg-violet-100 text-violet-700 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0">
              <Trophy className="h-3 w-3" />
              +{challenge.xpReward} XP
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 leading-relaxed">{challenge.description}</p>

        {/* Footer */}
        {isCompleted ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Challenge Complete! +{challenge.xpReward} XP earned
          </div>
        ) : isActive ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              ⏱ {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
            </span>
            <div className="h-1.5 flex-1 mx-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${((7 - daysLeft) / 7) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={startWeeklyChallenge}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white border-none text-xs"
          >
            Accept Challenge
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard;
