// ============================================================
// Achievements Page — Showcase level, badges, streak, and challenges
// ============================================================

import React, { useEffect } from 'react';
import { useGamificationStore } from '../store/gamificationStore';
import XPBar from '../components/gamification/XPBar';
import StreakBadge from '../components/gamification/StreakBadge';
import ChallengeCard from '../components/gamification/ChallengeCard';
import AchievementGrid from '../components/gamification/AchievementGrid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';

const Achievements: React.FC = () => {
  const {
    totalXP,
    currentStreak,
    longestStreak,
    unlockedBadges,
    loadFromStorage,
  } = useGamificationStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Your Achievements & Rewards</h2>
        <p className="text-sm text-gray-500">
          Earn XP by logging footprint activities, maintaining streaks, and completing challenges.
        </p>
      </div>

      {/* Level & Streak summary card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Level Progression</CardTitle>
            <CardDescription>Earn XP to level up your ecological profile status.</CardDescription>
          </CardHeader>
          <CardContent className="h-full flex flex-col justify-center pb-8">
            <XPBar totalXP={totalXP} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Streak Stats</CardTitle>
            <CardDescription>Keep logging daily to protect your streak.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Streak:</span>
              <StreakBadge streak={currentStreak} compact />
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-sm text-gray-600">Longest Streak:</span>
              <span className="text-sm font-bold text-gray-900">🔥 {longestStreak} days</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-sm text-gray-600 font-medium text-gray-500">
                Log any activity today to continue your streak!
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Challenge & Badges section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <ChallengeCard />
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <AchievementGrid unlockedBadges={unlockedBadges} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
