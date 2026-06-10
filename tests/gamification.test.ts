import { describe, it, expect } from 'vitest';
import { getLevelForXP, getXPProgress, getWeeklyChallenge, getTodayString, LEVELS } from '@/utils/gamification';

describe('Gamification Utilities', () => {
  describe('getLevelForXP', () => {
    it('should return level 1 for 0 XP', () => {
      const lvl = getLevelForXP(0);
      expect(lvl.level).toBe(1);
      expect(lvl.name).toBe('Carbon Novice');
    });

    it('should return level 2 for 500 XP', () => {
      const lvl = getLevelForXP(500);
      expect(lvl.level).toBe(2);
      expect(lvl.name).toBe('Eco Curious');
    });

    it('should return level 6 for 3000 XP', () => {
      const lvl = getLevelForXP(3000);
      expect(lvl.level).toBe(6);
      expect(lvl.name).toBe('Climate Champion');
    });

    it('should handle middle-range XP values correctly', () => {
      const lvl = getLevelForXP(1200);
      expect(lvl.level).toBe(3);
    });
  });

  describe('getXPProgress', () => {
    it('should calculate progress towards level 2', () => {
      const prog = getXPProgress(200);
      expect(prog.current).toBe(200);
      expect(prog.needed).toBe(500);
      expect(prog.percent).toBe(40);
    });

    it('should cap progress at 100% for maximum levels', () => {
      const prog = getXPProgress(4000);
      expect(prog.percent).toBe(100);
    });
  });

  describe('getWeeklyChallenge', () => {
    it('should return a valid challenge object', () => {
      const challenge = getWeeklyChallenge();
      expect(challenge).toBeDefined();
      expect(challenge.id).toBeDefined();
      expect(challenge.xpReward).toBeGreaterThan(0);
    });
  });

  describe('getTodayString', () => {
    it('should return a YYYY-MM-DD formatted string', () => {
      const dateStr = getTodayString();
      expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
