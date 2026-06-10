// CalendarHeatmap — GitHub-style 52-week emissions heatmap
import React, { useMemo } from 'react';
import type { Activity } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';

interface CalendarHeatmapProps {
  activities: Activity[];
  weeklyGoalKg?: number;
  className?: string;
}

// Returns last N weeks of dates (Sunday-first)
function buildWeeks(numWeeks = 20): Date[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Move back to most recent Sunday
  const dayOfWeek = today.getDay();
  const lastSunday = new Date(today);
  lastSunday.setDate(today.getDate() - dayOfWeek);

  const weeks: Date[][] = [];
  for (let w = numWeeks - 1; w >= 0; w--) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(lastSunday);
      date.setDate(lastSunday.getDate() - w * 7 + d);
      week.push(date);
    }
    weeks.push(week);
  }
  return weeks;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getColorClass(kg: number, goalPerDay: number): string {
  if (kg <= 0) return 'bg-gray-100';
  const ratio = kg / goalPerDay;
  if (ratio <= 0.5)  return 'bg-green-500';
  if (ratio <= 0.8)  return 'bg-green-400';
  if (ratio <= 1.0)  return 'bg-green-300';
  if (ratio <= 1.3)  return 'bg-amber-300';
  if (ratio <= 1.8)  return 'bg-orange-400';
  return 'bg-red-500';
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  activities,
  weeklyGoalKg = 50,
  className,
}) => {
  const dailyGoal = weeklyGoalKg / 7;

  // Aggregate activities per day
  const dailyMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const act of activities) {
      const key = act.date.slice(0, 10); // YYYY-MM-DD
      map[key] = (map[key] || 0) + act.co2e;
    }
    return map;
  }, [activities]);

  const weeks = useMemo(() => buildWeeks(20), []);

  // Compute month labels (show month when week transitions to a new month)
  const monthLabels: string[] = weeks.map((week) => {
    const firstDay = week[0];
    if (firstDay.getDate() <= 7) return MONTHS[firstDay.getMonth()];
    return '';
  });

  const today = toDateKey(new Date());

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <span>🗓️</span>
          Carbon Calendar
        </CardTitle>
        <CardDescription>
          Daily emissions over the past 20 weeks. Greener = lower; red = over daily budget.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Month labels */}
            <div className="flex gap-1 ml-6 mb-1">
              {weeks.map((_, wi) => (
                <div key={wi} className="w-4 text-center text-[9px] text-gray-400 font-medium shrink-0">
                  {monthLabels[wi]}
                </div>
              ))}
            </div>

            {/* Grid: 7 rows (days) × N weeks columns */}
            <div className="flex gap-1">
              {/* Day labels */}
              <div className="flex flex-col gap-1 mr-1">
                {DAYS.map((d) => (
                  <div key={d} className="h-4 w-4 text-[9px] text-gray-400 font-medium flex items-center justify-end pr-0.5">
                    {d}
                  </div>
                ))}
              </div>

              {/* Week columns */}
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((date) => {
                    const key = toDateKey(date);
                    const kg = dailyMap[key] || 0;
                    const isToday = key === today;
                    const isFuture = date > new Date();

                    return (
                      <div
                        key={key}
                        title={`${key}: ${kg > 0 ? `${kg.toFixed(1)} kg CO₂e` : 'No data'}`}
                        className={`h-4 w-4 rounded-sm transition-colors ${
                          isFuture
                            ? 'bg-gray-50 opacity-30'
                            : getColorClass(kg, dailyGoal)
                        } ${isToday ? 'ring-2 ring-green-600 ring-offset-1' : ''}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-[10px] text-gray-400">Less</span>
          {['bg-gray-100','bg-green-500','bg-green-300','bg-amber-300','bg-orange-400','bg-red-500'].map((c) => (
            <div key={c} className={`h-3 w-3 rounded-sm ${c}`} />
          ))}
          <span className="text-[10px] text-gray-400">More</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarHeatmap;
