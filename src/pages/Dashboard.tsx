// ============================================================
// Dashboard Page — EcoSense main portal
// ============================================================

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, Sparkles, Plus } from 'lucide-react';
import { useCarbon } from '../hooks/useCarbon';
import { useCarbonStore } from '../store/carbonStore';
import FootprintCard from '../components/dashboard/FootprintCard';
import TrendChart from '../components/dashboard/TrendChart';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import ActionList from '../components/dashboard/ActionList';
import ComparisonBar from '../components/insights/ComparisonBar';
import { Button } from '../components/ui/Button';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { stats } = useCarbon();
  const { actions, updateActionStatus, loadFromStorage } = useCarbonStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const activeActions = actions.filter((a) => a.status === 'suggested' || a.status === 'committed');

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute right-0 top-0 -mr-6 -mt-6 opacity-10">
          <Leaf className="h-48 w-48 rotate-12" />
        </div>
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI carbon tips inside</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Your Carbon Journey Starts Here
          </h2>
          <p className="text-sm text-green-50/90 leading-relaxed">
            Every daily choice counts. Log your activities to track your environmental impact and receive tailored AI tips for reduction.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={() => navigate('/tracker')}
              className="bg-white text-green-700 hover:bg-green-50 shadow-md font-semibold border-none"
            >
              <Plus className="h-4 w-4" />
              Log Activity
            </Button>
            <Button
              onClick={() => navigate('/chat')}
              className="bg-green-700/40 text-white hover:bg-green-700/60 border border-green-400/30 backdrop-blur-md font-semibold"
            >
              Talk to AI
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Footprint summary card */}
        <FootprintCard stats={stats} className="lg:col-span-1" />

        {/* 7-day trend chart */}
        <TrendChart data={stats.dailyTrend} className="lg:col-span-2" />
      </div>

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
    </div>
  );
};

export default Dashboard;
