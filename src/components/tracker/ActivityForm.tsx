// ============================================================
// ActivityForm — Log a new carbon activity with validation
// ============================================================

import React, { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Car, Zap, UtensilsCrossed, ShoppingBag, Trash2, Leaf,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  CATEGORY_OPTIONS,
  FACTOR_LABELS,
  FACTOR_UNITS,
} from '@/constants/emissionFactors';
import { calculateEmission } from '@/utils/carbonCalculator';
import type { ActivityCategory, EmissionFactorKey } from '@/types';

const formSchema = z.object({
  value: z
    .number({ message: 'Please enter a number' })
    .min(0.01, 'Value must be greater than 0')
    .max(50000, 'Value exceeds reasonable limit'),
});

type FormData = z.infer<typeof formSchema>;

/** Props interface for ActivityForm component */
export interface IActivityFormProps {
  onSubmit: (type: EmissionFactorKey, value: number) => void;
  isLoading?: boolean;
  className?: string;
}

const categoryConfig: Array<{
  key: ActivityCategory;
  label: string;
  icon: React.ReactNode;
  color: string;
}> = [
  { key: 'transport', label: 'Transport', icon: <Car className="h-4 w-4" />, color: 'blue' },
  { key: 'energy', label: 'Energy', icon: <Zap className="h-4 w-4" />, color: 'amber' },
  { key: 'food', label: 'Food', icon: <UtensilsCrossed className="h-4 w-4" />, color: 'red' },
  { key: 'shopping', label: 'Shopping', icon: <ShoppingBag className="h-4 w-4" />, color: 'purple' },
  { key: 'waste', label: 'Waste', icon: <Trash2 className="h-4 w-4" />, color: 'gray' },
];

/**
 * ActivityForm provides the interface to input and log daily carbon-producing activities.
 */
const ActivityForm: React.FC<IActivityFormProps> = ({ onSubmit, isLoading = false, className }) => {
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory>('transport');
  const [selectedType, setSelectedType] = useState<EmissionFactorKey>('car_petrol_per_km');
  const [lastResult, setLastResult] = useState<{ co2e: number; label: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const typeOptions = useMemo(
    () => {
      const options = CATEGORY_OPTIONS[selectedCategory];
      return options.map((key) => ({
        value: key,
        label: FACTOR_LABELS[key],
      }));
    },
    [selectedCategory]
  );

  const currentUnit = FACTOR_UNITS[selectedType];

  const handleCategoryChange = useCallback(
    (cat: ActivityCategory): void => {
      setSelectedCategory(cat);
      const firstOpt = CATEGORY_OPTIONS[cat][0];
      if (firstOpt) {
        setSelectedType(firstOpt);
      }
    },
    []
  );

  const onFormSubmit = useCallback(
    (data: FormData): void => {
      const co2e = calculateEmission(selectedType, data.value);
      onSubmit(selectedType, data.value);
      setLastResult({ co2e, label: FACTOR_LABELS[selectedType] });
      reset();

      setTimeout(() => setLastResult(null), 4000);
    },
    [selectedType, onSubmit, reset]
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-600" />
          Log Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
          {/* Category selector */}
          <div>
            <label className="eco-label" id="category-label">Category</label>
            <div
              className="flex flex-wrap gap-2"
              role="radiogroup"
              aria-labelledby="category-label"
            >
              {categoryConfig.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  role="radio"
                  aria-checked={selectedCategory === cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedCategory === cat.key
                      ? 'bg-green-100 text-green-800 ring-2 ring-green-500 ring-offset-1'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat.icon}
                  <span className="hidden sm:inline">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Activity type */}
          <div>
            <label htmlFor="activity-type" className="eco-label">Activity Type</label>
            <select
              id="activity-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as EmissionFactorKey)}
              className="eco-input"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Value input */}
          <div>
            <label htmlFor="activity-value" className="eco-label">
              Amount ({currentUnit})
            </label>
            <Input
              id="activity-value"
              type="number"
              step="0.1"
              placeholder={`Enter ${currentUnit}...`}
              error={errors.value?.message}
              aria-describedby={errors.value ? 'value-error' : undefined}
              {...register('value', { valueAsNumber: true })}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Logging...' : 'Log Activity'}
          </Button>

          {/* Result toast */}
          {lastResult && (
            <div
              className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 animate-slide-in-up"
              role="status"
              aria-live="polite"
            >
              <span className="text-lg">🌿</span>
              <p className="text-sm text-green-700">
                Logged! <strong>{lastResult.label}</strong> = <strong>{lastResult.co2e.toFixed(2)} kg CO₂e</strong>
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ActivityForm;
