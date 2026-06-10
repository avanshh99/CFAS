import { describe, it, expect } from 'vitest';
import { activitySchema } from '../src/utils/validators';

describe('activitySchema', () => {
  it('rejects negative km value', () => {
    const result = activitySchema.safeParse({ type: 'car', value: -5 });
    expect(result.success).toBe(false);
  });

  it('rejects unreasonably large value', () => {
    const result = activitySchema.safeParse({ type: 'car', value: 100000 });
    expect(result.success).toBe(false);
  });

  it('accepts valid entry', () => {
    const result = activitySchema.safeParse({ type: 'car', value: 25, date: new Date() });
    expect(result.success).toBe(true);
  });
});
