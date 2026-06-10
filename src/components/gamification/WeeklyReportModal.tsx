// WeeklyReportModal — Monday digest of last week's performance
import React from 'react';
import { X, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import XPBar from '@/components/gamification/XPBar';
import StreakBadge from '@/components/gamification/StreakBadge';
import type { IDashboardStats } from '@/types';

/** Props interface for WeeklyReportModal component */
export interface IWeeklyReportModalProps {
  stats: IDashboardStats;
  totalXP: number;
  streak: number;
  weeklyGoalKg: number;
  newBadgeCount: number;
  onClose: () => void;
}

/**
 * WeeklyReportModal shows weekly progress summary and gamification gains.
 */
const WeeklyReportModal: React.FC<IWeeklyReportModalProps> = ({
  stats,
  totalXP,
  streak,
  weeklyGoalKg,
  newBadgeCount,
  onClose,
}) => {
  const goalMet = stats.weeklyTotal <= weeklyGoalKg;
  const pct = Math.abs(stats.percentChange);
  const improved = stats.percentChange < 0;
  const unchanged = stats.percentChange === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Weekly carbon report"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Close report"
          >
            <X className="h-5 w-5" />
          </button>
          <p className="text-xs font-semibold uppercase tracking-wider text-green-100 mb-1">
            📋 Weekly Report
          </p>
          <h2 className="text-xl font-extrabold">How did you do?</h2>
          <p className="text-sm text-green-100 mt-1">
            {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 p-6 pb-3">
          {/* Weekly total */}
          <div className={`rounded-xl p-4 border ${goalMet ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">This Week</p>
            <p className={`text-2xl font-extrabold mt-1 ${goalMet ? 'text-green-700' : 'text-red-700'}`}>
              {stats.weeklyTotal.toFixed(1)}
              <span className="text-sm font-medium"> kg</span>
            </p>
            <p className={`text-xs mt-0.5 font-semibold ${goalMet ? 'text-green-600' : 'text-red-600'}`}>
              {goalMet ? '✅ Goal met!' : `❌ Over by ${(stats.weeklyTotal - weeklyGoalKg).toFixed(1)} kg`}
            </p>
          </div>

          {/* vs last week */}
          <div className="rounded-xl p-4 border bg-gray-50 border-gray-200">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">vs Last Week</p>
            <div className="flex items-center gap-1 mt-1">
              {improved ? (
                <TrendingDown className="h-5 w-5 text-green-600" />
              ) : unchanged ? (
                <Minus className="h-5 w-5 text-gray-500" />
              ) : (
                <TrendingUp className="h-5 w-5 text-red-600" />
              )}
              <p className={`text-2xl font-extrabold ${improved ? 'text-green-700' : unchanged ? 'text-gray-700' : 'text-red-700'}`}>
                {unchanged ? '–' : `${pct.toFixed(0)}%`}
              </p>
            </div>
            <p className={`text-xs mt-0.5 font-semibold ${improved ? 'text-green-600' : 'text-gray-500'}`}>
              {improved ? '↘ Improved' : unchanged ? 'No change' : '↗ Increased'}
            </p>
          </div>
        </div>

        {/* XP & Streak */}
        <div className="px-6 pb-3 space-y-3">
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
            <XPBar totalXP={totalXP} compact />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50 border border-orange-100">
            <p className="text-xs font-semibold text-gray-700">Logging Streak</p>
            <StreakBadge streak={streak} compact />
          </div>
          {newBadgeCount > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-lg">🏅</span>
              <p className="text-xs font-semibold text-amber-700">
                {newBadgeCount} new badge{newBadgeCount > 1 ? 's' : ''} unlocked this week!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <Button onClick={onClose} className="w-full">
            Let's keep going! 🌱
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReportModal;
