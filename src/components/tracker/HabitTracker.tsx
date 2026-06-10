// HabitTracker — daily habit chips with one-tap logging
import React from 'react';
import { HABITS } from '../../utils/gamification';
import { useGamificationStore } from '../../store/gamificationStore';
import { getTodayString } from '../../utils/gamification';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const HabitTracker: React.FC<{ className?: string }> = ({ className }) => {
  const { habitsLog, toggleHabit } = useGamificationStore();
  const today = getTodayString();
  const todayHabits = habitsLog[today] || [];
  const completedCount = todayHabits.length;
  const allComplete = completedCount === HABITS.length;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            Today's Habits
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            allComplete
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {completedCount}/{HABITS.length}
            {allComplete && ' 🎉'}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {allComplete && (
          <div className="mb-3 p-2.5 rounded-lg bg-green-50 border border-green-200 text-center">
            <p className="text-xs font-semibold text-green-700">
              🌟 All habits done! +{HABITS.length * 15} XP earned today
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {HABITS.map((habit) => {
            const done = todayHabits.includes(habit.id);
            return (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-sm transition-all duration-200 ${
                  done
                    ? 'bg-green-50 border-green-300 text-green-800'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50/50'
                }`}
                aria-pressed={done}
                aria-label={`${done ? 'Unmark' : 'Mark'} habit: ${habit.label}`}
              >
                <span className={`text-base shrink-0 transition-all ${done ? '' : 'grayscale opacity-70'}`}>
                  {habit.emoji}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-tight truncate">{habit.label}</p>
                  <p className="text-[10px] text-gray-400">+{habit.xp} XP</p>
                </div>
                {done && (
                  <span className="ml-auto text-green-600 font-bold text-base shrink-0">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitTracker;
