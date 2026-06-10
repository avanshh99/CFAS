import { describe, it, expect } from 'vitest';
import { calculateEmission, calculateWeeklyTotal } from '../src/utils/carbonCalculator';
import type { EmissionFactorKey } from '../src/types';

describe('carbonCalculator', () => {
  it('calculates car trip correctly', () => {
    expect(calculateEmission('car_petrol_per_km', 50)).toBeCloseTo(9.6, 1);
  });

  it('returns 0 for zero distance', () => {
    expect(calculateEmission('car_petrol_per_km', 0)).toBe(0);
  });

  it('throws on negative input', () => {
    expect(() => calculateEmission('car_petrol_per_km', -10)).toThrow();
  });

  it('calculates weekly total from activities array', () => {
    const activities = [
      { type: 'car_petrol_per_km' as const, value: 10 },
      { type: 'electricity_india_per_kwh' as const, value: 5 },
    ];
    expect(calculateWeeklyTotal(activities)).toBeCloseTo(5.5, 1);
  });

  it('throws TypeError when calculating emission with undefined key', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => calculateEmission(undefined as any, 10)).toThrow(TypeError);
  });

  it('returns 0 when calculating weekly total with an empty array', () => {
    expect(calculateWeeklyTotal([])).toBe(0);
  });

  it('calculates weekly total with 100+ activities under 50ms', () => {
    const hugeActivities = Array.from({ length: 150 }, (_, i) => ({
      type: (i % 2 === 0 ? 'car_petrol_per_km' : 'electricity_india_per_kwh') as EmissionFactorKey,
      value: 10,
    }));

    const start = performance.now();
    const result = calculateWeeklyTotal(hugeActivities);
    const end = performance.now();

    expect(result).toBeGreaterThan(0);
    expect(end - start).toBeLessThan(50);
  });
});
