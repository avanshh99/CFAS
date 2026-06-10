// ============================================================
// Tracker Page — Activity Tracker portal
// ============================================================

import React, { useEffect } from 'react';
import ActivityForm from '../components/tracker/ActivityForm';
import ActivityLogger from '../components/tracker/ActivityLogger';
import HistoryTable from '../components/tracker/HistoryTable';
import { useCarbon } from '../hooks/useCarbon';
import { useCarbonStore } from '../store/carbonStore';

const Tracker: React.FC = () => {
  const { logActivity, deleteActivity, recentActivities } = useCarbon();
  const { loadFromStorage } = useCarbonStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column: Activity Form */}
        <div className="flex-1">
          <ActivityForm onSubmit={logActivity} />
        </div>

        {/* Right column: Quick Log presets */}
        <div className="w-full md:w-80">
          <ActivityLogger onQuickLog={logActivity} />
        </div>
      </div>

      {/* History table */}
      <div>
        <HistoryTable activities={recentActivities} onDelete={deleteActivity} />
      </div>
    </div>
  );
};

export default Tracker;
