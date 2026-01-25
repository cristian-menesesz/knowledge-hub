import { formatDate, capitalize } from '../string.utils';

describe('String Utilities', () => {
  describe('formatDate', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date('2026-01-25T12:00:00Z');
      expect(formatDate(date)).toBe('2026-01-25');
    });

    it('should handle different dates', () => {
      const date = new Date('2025-12-31T23:59:59Z');
      expect(formatDate(date)).toBe('2025-12-31');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should lowercase rest of string', () => {
      expect(capitalize('HELLO')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A');
    });
  });
});
