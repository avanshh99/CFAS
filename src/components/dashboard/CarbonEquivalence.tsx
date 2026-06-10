// CarbonEquivalence — rotating equivalence comparisons widget
import React, { useEffect, useState } from 'react';
import { getEquivalences } from '@/utils/carbonEquivalences';

/** Props interface for CarbonEquivalence component */
export interface ICarbonEquivalenceProps {
  weeklyKg: number;
  className?: string;
}

/**
 * CarbonEquivalence widget shows user-friendly comparisons of the carbon footprint.
 */
const CarbonEquivalence: React.FC<ICarbonEquivalenceProps> = ({ weeklyKg, className }) => {
  const equivalences = getEquivalences(weeklyKg);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (equivalences.length <= 1) return;
    const timer = setInterval(() => {
      setIdx((i) => (i + 1) % equivalences.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [equivalences.length]);

  if (weeklyKg <= 0 || equivalences.length === 0) {
    return (
      <div className={`flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 ${className}`}>
        <span className="text-2xl">🌱</span>
        <p className="text-sm text-green-700 font-semibold">Start logging to see your carbon comparisons!</p>
      </div>
    );
  }

  const eq = equivalences[idx];
  if (!eq) return null;

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-white p-5 ${className}`}>
      {/* Background emoji decoration */}
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl opacity-10 select-none" aria-hidden="true">
        {eq.emoji}
      </span>

      <div className="relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
          This week equals
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl">{eq.emoji}</span>
          <p className="text-2xl font-extrabold text-white leading-tight">
            {eq.amount}
          </p>
        </div>
        <p className="text-sm text-slate-300 mt-1">{eq.label}</p>

        {/* Dot indicators */}
        {equivalences.length > 1 && (
          <div className="flex gap-1.5 mt-3">
            {equivalences.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === idx ? 'bg-green-400 w-4' : 'bg-slate-600 w-1.5'
                }`}
                aria-label={`Equivalence ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarbonEquivalence;
