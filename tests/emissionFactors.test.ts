import { describe, it, expect } from 'vitest';
import { EMISSION_FACTORS } from '../src/constants/emissionFactors';
import type { EmissionFactorKey } from '../src/types';

describe('Emission Factors (IPCC AR6 / CEA 2023)', () => {
  it('defines correct car petrol emission factor', () => {
    expect(EMISSION_FACTORS.car_petrol_per_km).toBe(0.192);
  });

  it('defines correct electricity grid emission factor for India', () => {
    expect(EMISSION_FACTORS.electricity_india_per_kwh).toBe(0.716);
  });

  it('asserts all factor values are positive numbers', () => {
    Object.keys(EMISSION_FACTORS).forEach((key) => {
      const val = EMISSION_FACTORS[key as EmissionFactorKey];
      expect(val).toBeGreaterThan(0);
    });
  });

  it('asserts no factor exceeds 80 kg CO2e', () => {
    Object.keys(EMISSION_FACTORS).forEach((key) => {
      const val = EMISSION_FACTORS[key as EmissionFactorKey];
      expect(val).toBeLessThanOrEqual(80);
    });
  });
});
