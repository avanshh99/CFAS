// ============================================================
// Insights Page — Generate and view AI-generated insights
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, AlertTriangle } from 'lucide-react';
import { generateInsights } from '@/api/groq';
import { useCarbon } from '@/hooks/useCarbon';
import { useCarbonStore } from '@/store/carbonStore';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import InsightCard from '@/components/insights/InsightCard';
import MonthlyComparison from '@/components/dashboard/MonthlyComparison';
import { useGamificationStore } from '@/store/gamificationStore';
import type { IInsight, ISuggestedAction } from '@/types';

const defaultInsights: IInsight[] = [
  {
    id: 'in-1',
    type: 'pattern',
    title: 'Commute Emissions Peak',
    description: 'You emit 40% more on weekdays — likely your commute. Switching to public transit or carpooling can reduce this significantly.',
    icon: 'TrendingUp',
    generatedAt: Date.now(),
  },
  {
    id: 'in-2',
    type: 'comparison',
    title: 'Excellent Diet Balance',
    description: 'Your food footprint is lower than 70% of users your age due to higher green/vegan choices logged.',
    icon: 'Compass',
    generatedAt: Date.now(),
  },
  {
    id: 'in-3',
    type: 'actionable',
    title: 'Transit Switch Potential',
    description: 'If you switch to the metro twice a week, you would save 28 kg CO₂ monthly.',
    icon: 'Lightbulb',
    generatedAt: Date.now(),
  },
];

const defaultActions: ISuggestedAction[] = [
  {
    id: 'act-1',
    description: 'Switch to Delhi Metro or train for twice-weekly commute',
    category: 'transport',
    monthlySavingKg: 28,
    difficulty: 'Easy',
    status: 'suggested',
  },
  {
    id: 'act-2',
    description: 'Unplug household electronics during idle night hours',
    category: 'energy',
    monthlySavingKg: 13,
    difficulty: 'Medium',
    status: 'suggested',
  },
  {
    id: 'act-3',
    description: 'Adopt vegetarian lunch diet for 3 days a week',
    category: 'food',
    monthlySavingKg: 18,
    difficulty: 'Hard',
    status: 'suggested',
  },
];

/**
 * Insights component fetches and presents customized carbon reduction feedback
 * generated dynamically by the AI model.
 */
const Insights: React.FC = () => {
  const { stats, activities } = useCarbon();
  const { actions, setActions, loadFromStorage } = useCarbonStore();

  const [cachedInsights, setCachedInsights] = useLocalStorage<IInsight[]>('ecosense-cached-insights', defaultInsights);
  const [_lastGeneratedTime, setLastGeneratedTime] = useLocalStorage<number>('ecosense-insights-time', Date.now() - 30 * 60 * 1000);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleGenerate = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const recentSummary = activities
      .slice(0, 10)
      .map((a) => `${a.label}: ${a.co2e.toFixed(1)} kg CO₂e`)
      .join(', ');

    const systemPrompt = `
You are EcoSense AI. Based on the user's weekly carbon footprint data, generate exactly 3 insights and 3 recommended actions.
JSON output format:
{
  "insights": [
    {
      "type": "pattern" | "comparison" | "actionable",
      "title": "Short title",
      "description": "Detailed explanation under 40 words."
    }
  ],
  "actions": [
    {
      "description": "Clear actionable step under 12 words",
      "category": "transport" | "energy" | "food" | "shopping" | "waste",
      "monthlySavingKg": 15,
      "difficulty": "Easy" | "Medium" | "Hard"
    }
  ]
}
Return ONLY valid raw JSON. No markdown ticks, no conversational text.
`;

    const userMessage = `
User Context:
- Weekly Total: ${stats.weeklyTotal} kg CO₂e
- Top Category: ${stats.topCategory || 'None'}
- Category Breakdown: ${JSON.stringify(stats.categoryBreakdown)}
- Recent Activities: ${recentSummary}
- Region: India
`;

    try {
      const resultText = await generateInsights([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ]);

      let cleanedText = resultText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.slice(7);
      }
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
      }
      cleanedText = cleanedText.trim();

      const data = JSON.parse(cleanedText);

      if (data.insights && Array.isArray(data.insights) && data.actions && Array.isArray(data.actions)) {
        const mappedInsights: IInsight[] = data.insights.map((ins: { type?: string; title?: string; description?: string }, idx: number) => ({
          id: `in-ai-${Date.now()}-${idx}`,
          type: (ins.type === 'pattern' || ins.type === 'comparison' || ins.type === 'actionable') ? ins.type : 'actionable',
          title: ins.title || 'Insight',
          description: ins.description || '',
          icon: ins.type === 'pattern' ? 'TrendingUp' : ins.type === 'comparison' ? 'Compass' : 'Lightbulb',
          generatedAt: Date.now(),
        }));

        const mappedActions: ISuggestedAction[] = data.actions.map((act: { description?: string; category?: string; monthlySavingKg?: number; difficulty?: string }, idx: number) => ({
          id: `act-ai-${Date.now()}-${idx}`,
          description: act.description || 'Reduce carbon footprint',
          category: (act.category === 'transport' || act.category === 'energy' || act.category === 'food' || act.category === 'shopping' || act.category === 'waste') ? act.category : 'energy',
          monthlySavingKg: Number(act.monthlySavingKg) || 10,
          difficulty: act.difficulty || 'Easy',
          status: 'suggested',
        }));

        setCachedInsights(mappedInsights);
        setActions(mappedActions);
        setLastGeneratedTime(Date.now());
        useGamificationStore.getState().incrementInsights();
      } else {
        throw new Error('Malformed JSON structure from AI response');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to generate AI insights:', err);
      setError('Could not connect to the proxy server or parse the response. Using offline backup insights.');
      
      if (actions.length === 0) {
        setActions(defaultActions);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activities, stats, actions.length, setActions, setCachedInsights, setLastGeneratedTime]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Personalized Insights</h2>
          <p className="text-sm text-gray-500">
            Tailored carbon reduction reports created from your activity history.
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Generate Insights</span>
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800" role="alert">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Offline Backup Loaded</p>
            <p className="text-xs text-amber-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cachedInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>

          <div className="rounded-xl border border-dashed border-gray-200 p-6 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg text-green-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-950">Suggested actions updated</p>
                <p className="text-xs text-gray-500">
                  New committed actions will immediately count towards reducing your projected footprint.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <MonthlyComparison activities={activities} />
          </div>
        </>
      )}
    </div>
  );
};

export default Insights;
export { defaultInsights, defaultActions };
