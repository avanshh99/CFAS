// ============================================================
// Dashboard Page — EcoSense main portal with gamification
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, Sparkles, Plus, Trophy } from 'lucide-react';
import { useCarbon } from '../hooks/useCarbon';
import { useCarbonStore } from '../store/carbonStore';
import { useGamificationStore } from '../store/gamificationStore';
import FootprintCard from '../components/dashboard/FootprintCard';
import TrendChart from '../components/dashboard/TrendChart';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import ActionList from '../components/dashboard/ActionList';
import ComparisonBar from '../components/insights/ComparisonBar';
import { Button } from '../components/ui/Button';

// Gamification & new tracking widgets
import XPBar from '../components/gamification/XPBar';
import StreakBadge from '../components/gamification/StreakBadge';
import ChallengeCard from '../components/gamification/ChallengeCard';
import HabitTracker from '../components/tracker/HabitTracker';
import CarbonEquivalence from '../components/dashboard/CarbonEquivalence';
import OffsetCalculator from '../components/dashboard/OffsetCalculator';
import CalendarHeatmap from '../components/dashboard/CalendarHeatmap';
import WeeklyReportModal from '../components/gamification/WeeklyReportModal';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { stats, activities } = useCarbon();
  const { actions, settings, updateActionStatus, loadFromStorage: loadCarbon } = useCarbonStore();

  const {
    totalXP,
    currentStreak,
    lastReportDate,
    unlockedBadges,
    markReportShown,
    loadFromStorage: loadGamification,
  } = useGamificationStore();

  const [showWeeklyReport, setShowWeeklyReport] = useState(false);

  useEffect(() => {
    loadCarbon();
    loadGamification();
  }, [loadCarbon, loadGamification]);

  // Check if we should auto-show the weekly report modal
  useEffect(() => {
    const today = new Date();
    const isMonday = today.getDay() === 1;
    const todayStr = today.toISOString().slice(0, 10);

    if (isMonday && lastReportDate !== todayStr && stats.weeklyTotal > 0) {
      setShowWeeklyReport(true);
    }
  }, [lastReportDate, stats.weeklyTotal]);

  const handleCloseReport = () => {
    setShowWeeklyReport(false);
    markReportShown();
  };

  const activeActions = actions.filter((a) => a.status === 'suggested' || a.status === 'committed');

  return (
    <div className="space-y-6">
      {/* Top Banner Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 p-6 text-white shadow-lg lg:col-span-2">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 opacity-10">
            <Leaf className="h-48 w-48 rotate-12" />
          </div>
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>AI carbon recommendations inside</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
              Your Carbon Journey Starts Here
            </h2>
            <p className="text-xs sm:text-sm text-green-50/90 leading-relaxed max-w-xl">
              Every daily choice counts. Log your activities to track your environmental impact and receive tailored AI tips for reduction.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                onClick={() => navigate('/tracker')}
                className="bg-white text-green-700 hover:bg-green-50 shadow-md font-semibold border-none text-xs px-4 py-2"
              >
                <Plus className="h-4 w-4" />
                Log Activity
              </Button>
              <Button
                onClick={() => navigate('/chat')}
                className="bg-green-700/40 text-white hover:bg-green-700/60 border border-green-400/30 backdrop-blur-md font-semibold text-xs px-4 py-2"
              >
                Talk to AI
                <ArrowRight className="h-4 w-4" />
              </Button>
              {stats.weeklyTotal > 0 && (
                <Button
                  onClick={() => setShowWeeklyReport(true)}
                  className="bg-transparent hover:bg-white/10 hover:text-white border border-white/40 text-white font-semibold text-xs px-4 py-2"
                >
                  View Weekly Report
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Level & Streak Quick Widget */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 flex flex-col justify-between shadow-sm lg:col-span-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span className="font-bold text-gray-900 text-sm">Your Level</span>
              </div>
              <StreakBadge streak={currentStreak} compact />
            </div>
            <XPBar totalXP={totalXP} />
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500">Badges Unlocked:</span>
            <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              {unlockedBadges.length} unlocked
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Heatmap + Equivalences */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Footprint summary card */}
        <FootprintCard stats={stats} className="lg:col-span-1" />

        {/* 7-day trend chart */}
        <TrendChart data={stats.dailyTrend} className="lg:col-span-1.5" />

        {/* Rotating comparisons widget */}
        <CarbonEquivalence weeklyKg={stats.weeklyTotal} className="lg:col-span-1" />
      </div>

      {/* Habits & Challenge Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily habit tracker */}
        <HabitTracker className="lg:col-span-2" />

        {/* Weekly challenge */}
        <div className="lg:col-span-1 h-full flex flex-col">
          <ChallengeCard />
        </div>
      </div>

      {/* Heatmap & Offset Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Heatmap */}
        <CalendarHeatmap
          activities={activities}
          weeklyGoalKg={settings.weeklyGoalKg}
          className="lg:col-span-2"
        />

        {/* Offset widget */}
        <OffsetCalculator yearlyKg={stats.yearlyProjection} currency={settings.currency} className="lg:col-span-1" />
      </div>

      {/* Breakdowns & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category breakdown pie */}
        <CategoryBreakdown data={stats.categoryBreakdown} className="lg:col-span-1" />

        {/* Comparison average bar chart */}
        <ComparisonBar userValueTonnes={stats.yearlyProjection} className="lg:col-span-1" />

        {/* Recommended actions list */}
        <ActionList
          actions={activeActions}
          onUpdateStatus={updateActionStatus}
          className="lg:col-span-1"
        />
      </div>

      {/* Weekly Report Modal popup */}
      {showWeeklyReport && (
        <WeeklyReportModal
          stats={stats}
          totalXP={totalXP}
          streak={currentStreak}
          weeklyGoalKg={settings.weeklyGoalKg}
          newBadgeCount={unlockedBadges.length}
          onClose={handleCloseReport}
        />
      )}
    </div>
  );
};

export default Dashboard;
