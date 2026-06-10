import { describe, it, expect } from 'vitest';
import { calculateEmission, calculateWeeklyTotal } from '../src/utils/carbonCalculator';

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
});
