import { describe, it, expect } from 'vitest';
import { getWeekStart, getMonthStart, relativeDate, fillWeeklyDays } from './date-utils';

// ---------------------------------------------------------------------------
// getWeekStart
// ---------------------------------------------------------------------------

describe('getWeekStart', () => {
  it('returns Monday for a Monday input', () => {
    // 2026-03-02 is a Monday
    const result = getWeekStart(new Date(2026, 2, 2, 14, 30));

    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(2);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });

  it('returns previous Monday for a Wednesday input', () => {
    // 2026-03-04 is a Wednesday → week started 2026-03-02 (Monday)
    const result = getWeekStart(new Date(2026, 2, 4, 10, 0));

    expect(result.getDate()).toBe(2);
    expect(result.getHours()).toBe(0);
  });

  it('returns previous Monday for a Sunday input', () => {
    // 2026-03-08 is a Sunday → week started 2026-03-02 (Monday)
    const result = getWeekStart(new Date(2026, 2, 8, 23, 59));

    expect(result.getDate()).toBe(2);
  });

  it('returns previous Monday for a Saturday input', () => {
    // 2026-03-07 is a Saturday → week started 2026-03-02
    const result = getWeekStart(new Date(2026, 2, 7));

    expect(result.getDate()).toBe(2);
  });

  it('handles month boundary (Thursday March 1 → Monday Feb 26)', () => {
    // 2026-03-01 is a Sunday → week started 2026-02-23 (Monday)
    const result = getWeekStart(new Date(2026, 2, 1));

    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(23);
  });

  it('handles year boundary', () => {
    // 2026-01-01 is a Thursday → week started 2025-12-29 (Monday)
    const result = getWeekStart(new Date(2026, 0, 1));

    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(11);
    expect(result.getDate()).toBe(29);
  });

  it('does not mutate the input date', () => {
    const input = new Date(2026, 2, 4, 15, 30);
    const original = input.getTime();

    getWeekStart(input);

    expect(input.getTime()).toBe(original);
  });
});

// ---------------------------------------------------------------------------
// getMonthStart
// ---------------------------------------------------------------------------

describe('getMonthStart', () => {
  it('returns the first day of the month', () => {
    const result = getMonthStart(new Date(2026, 2, 15));

    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(1);
  });

  it('returns same date if already the first', () => {
    const result = getMonthStart(new Date(2026, 5, 1));

    expect(result.getDate()).toBe(1);
    expect(result.getMonth()).toBe(5);
  });

  it('returns the first day of the last day of month', () => {
    const result = getMonthStart(new Date(2026, 0, 31));

    expect(result.getDate()).toBe(1);
    expect(result.getMonth()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// relativeDate
// ---------------------------------------------------------------------------

describe('relativeDate', () => {
  it('returns "Hoje" for today', () => {
    const now = new Date();
    const result = relativeDate(now.toISOString());

    expect(result).toBe('Hoje');
  });

  it('returns "Ontem" for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = relativeDate(yesterday.toISOString());

    expect(result).toBe('Ontem');
  });

  it('returns "2 dias atrás" for two days ago', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const result = relativeDate(twoDaysAgo.toISOString());

    expect(result).toBe('2 dias atrás');
  });

  it('returns "7 dias atrás" for a week ago', () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const result = relativeDate(weekAgo.toISOString());

    expect(result).toBe('7 dias atrás');
  });

  it('returns "30 dias atrás" for 30 days ago', () => {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const result = relativeDate(monthAgo.toISOString());

    expect(result).toBe('30 dias atrás');
  });
});

// ---------------------------------------------------------------------------
// fillWeeklyDays
// ---------------------------------------------------------------------------

describe('fillWeeklyDays', () => {
  // Monday 2026-03-02
  const weekStart = new Date(2026, 2, 2, 0, 0, 0, 0);

  it('returns 7 days starting from Monday', () => {
    const result = fillWeeklyDays(weekStart, []);

    expect(result).toHaveLength(7);
    expect(result[0].date).toBe('2026-03-02'); // Mon
    expect(result[6].date).toBe('2026-03-08'); // Sun
  });

  it('fills missing days with 0 XP', () => {
    const result = fillWeeklyDays(weekStart, []);

    for (const day of result) {
      expect(day.xp).toBe(0);
    }
  });

  it('uses existing XP data for matching days', () => {
    const xpData = [
      { date: '2026-03-02', xp: 30 },
      { date: '2026-03-04', xp: 55 },
    ];

    const result = fillWeeklyDays(weekStart, xpData);

    expect(result[0]).toEqual({ date: '2026-03-02', xp: 30 }); // Mon
    expect(result[1]).toEqual({ date: '2026-03-03', xp: 0 });   // Tue (missing)
    expect(result[2]).toEqual({ date: '2026-03-04', xp: 55 });  // Wed
    expect(result[3]).toEqual({ date: '2026-03-05', xp: 0 });   // Thu (missing)
  });

  it('handles all 7 days with data', () => {
    const xpData = [
      { date: '2026-03-02', xp: 10 },
      { date: '2026-03-03', xp: 20 },
      { date: '2026-03-04', xp: 30 },
      { date: '2026-03-05', xp: 40 },
      { date: '2026-03-06', xp: 50 },
      { date: '2026-03-07', xp: 60 },
      { date: '2026-03-08', xp: 70 },
    ];

    const result = fillWeeklyDays(weekStart, xpData);

    expect(result.map((d) => d.xp)).toEqual([10, 20, 30, 40, 50, 60, 70]);
  });

  it('ignores XP data outside the week range', () => {
    const xpData = [
      { date: '2026-03-01', xp: 99 }, // Sunday before
      { date: '2026-03-03', xp: 25 },
      { date: '2026-03-09', xp: 99 }, // Monday after
    ];

    const result = fillWeeklyDays(weekStart, xpData);

    expect(result[0].xp).toBe(0);  // Mon (no match for 03-01)
    expect(result[1].xp).toBe(25); // Tue
    expect(result[6].xp).toBe(0);  // Sun (no match for 03-09)
  });
});
