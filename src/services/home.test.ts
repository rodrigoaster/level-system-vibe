import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase';
import {
  getRank,
  computeWeeklyProgress,
  aggregateXPByDay,
  getUserState,
  getRecentActivities,
  getActivitiesInRange,
} from './home';
import { TIER_COLORS, WEEKLY_BONUSES } from '@/types/home';
import type { ActivityEntry } from '@/types/activity';

const mockFrom = supabase.from as ReturnType<typeof vi.fn>;

// --- Fixtures ---

const makeActivity = (overrides: Partial<ActivityEntry> = {}): ActivityEntry => ({
  id: 'a-1',
  user_id: 'user-1',
  category: 'fitness',
  note: null,
  xp: 30,
  created_at: '2026-03-04T10:00:00Z',
  ...overrides,
});

const demoState = {
  id: 'state-1',
  user_id: 'user-1',
  xp: 450,
  streak: 12,
  best_streak: 21,
  total_tasks: 50,
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// getRank (pure logic)
// ---------------------------------------------------------------------------

describe('getRank', () => {
  it('returns level 1 Bronze for 0 XP', () => {
    const rank = getRank(0);

    expect(rank.level).toBe(1);
    expect(rank.tier).toBe('bronze');
    expect(rank.tierLabel).toBe('BRONZE');
    expect(rank.colors).toEqual(TIER_COLORS.bronze);
    expect(rank.currentXP).toBe(0);
    expect(rank.xpForCurrentLevel).toBe(0);
    expect(rank.xpForNextLevel).toBe(50);
  });

  it('returns level 1 at 49 XP (just below threshold)', () => {
    const rank = getRank(49);

    expect(rank.level).toBe(1);
    expect(rank.xpForCurrentLevel).toBe(0);
    expect(rank.xpForNextLevel).toBe(50);
  });

  it('returns level 2 at exactly 50 XP', () => {
    // 50 * (2-1)^2 = 50
    const rank = getRank(50);

    expect(rank.level).toBe(2);
    expect(rank.tier).toBe('bronze');
    expect(rank.xpForCurrentLevel).toBe(50);
    expect(rank.xpForNextLevel).toBe(200); // 50 * 2^2
  });

  it('returns level 3 at 200 XP', () => {
    // 50 * (3-1)^2 = 200
    const rank = getRank(200);

    expect(rank.level).toBe(3);
    expect(rank.xpForCurrentLevel).toBe(200);
    expect(rank.xpForNextLevel).toBe(450); // 50 * 3^2
  });

  it('returns Bronze tier for levels 1-4', () => {
    expect(getRank(0).tier).toBe('bronze');      // level 1
    expect(getRank(50).tier).toBe('bronze');      // level 2
    expect(getRank(200).tier).toBe('bronze');     // level 3
    expect(getRank(450).tier).toBe('bronze');     // level 4
  });

  it('returns Silver tier for levels 5-8', () => {
    // level 5: 50 * 4^2 = 800
    expect(getRank(800).tier).toBe('silver');
    expect(getRank(800).tierLabel).toBe('SILVER');
    expect(getRank(800).colors).toEqual(TIER_COLORS.silver);

    // level 8: 50 * 7^2 = 2450
    expect(getRank(2450).tier).toBe('silver');
  });

  it('returns Gold tier for levels 9-12', () => {
    // level 9: 50 * 8^2 = 3200
    expect(getRank(3200).tier).toBe('gold');
    expect(getRank(3200).tierLabel).toBe('GOLD');

    // level 12: 50 * 11^2 = 6050
    expect(getRank(6050).tier).toBe('gold');
  });

  it('returns Diamond tier for levels 13-16', () => {
    // level 13: 50 * 12^2 = 7200
    expect(getRank(7200).tier).toBe('diamond');
    expect(getRank(7200).tierLabel).toBe('DIAMOND');

    // level 16: 50 * 15^2 = 11250
    expect(getRank(11250).tier).toBe('diamond');
  });

  it('returns Master tier for levels 17+', () => {
    // level 17: 50 * 16^2 = 12800
    expect(getRank(12800).tier).toBe('master');
    expect(getRank(12800).tierLabel).toBe('MASTER');
    expect(getRank(12800).colors).toEqual(TIER_COLORS.master);
  });

  it('handles very high XP values', () => {
    const rank = getRank(100000);

    expect(rank.level).toBeGreaterThan(17);
    expect(rank.tier).toBe('master');
  });

  it('provides correct XP range for the current level', () => {
    // level 4: xpForCurrent = 50*3^2 = 450, xpForNext = 50*4^2 = 800
    const rank = getRank(500);

    expect(rank.level).toBe(4);
    expect(rank.xpForCurrentLevel).toBe(450);
    expect(rank.xpForNextLevel).toBe(800);
    expect(rank.currentXP).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// computeWeeklyProgress (pure logic)
// ---------------------------------------------------------------------------

describe('computeWeeklyProgress', () => {
  it('returns no bonus unlocked when XP is below all thresholds', () => {
    const progress = computeWeeklyProgress(30);

    expect(progress.currentXP).toBe(30);
    expect(progress.unlockedBonus).toBeNull();
    expect(progress.bonuses).toEqual(WEEKLY_BONUSES);
  });

  it('unlocks +10 bonus at 50 XP', () => {
    const progress = computeWeeklyProgress(50);

    expect(progress.unlockedBonus).toBe(10);
  });

  it('unlocks +25 bonus at 100 XP', () => {
    const progress = computeWeeklyProgress(100);

    expect(progress.unlockedBonus).toBe(25);
  });

  it('unlocks +50 bonus at 200 XP', () => {
    const progress = computeWeeklyProgress(200);

    expect(progress.unlockedBonus).toBe(50);
  });

  it('unlocks highest applicable bonus at 150 XP (between 100 and 200)', () => {
    const progress = computeWeeklyProgress(150);

    expect(progress.unlockedBonus).toBe(25);
  });

  it('unlocks highest bonus for XP above all thresholds', () => {
    const progress = computeWeeklyProgress(999);

    expect(progress.unlockedBonus).toBe(50);
  });

  it('returns no bonus at 0 XP', () => {
    const progress = computeWeeklyProgress(0);

    expect(progress.currentXP).toBe(0);
    expect(progress.unlockedBonus).toBeNull();
  });

  it('returns no bonus at 49 XP (just below first threshold)', () => {
    const progress = computeWeeklyProgress(49);

    expect(progress.unlockedBonus).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// WEEKLY_BONUSES constants
// ---------------------------------------------------------------------------

describe('WEEKLY_BONUSES constants', () => {
  it('has exactly 3 bonus thresholds', () => {
    expect(WEEKLY_BONUSES).toHaveLength(3);
  });

  it('has correct threshold-bonus pairs', () => {
    expect(WEEKLY_BONUSES[0]).toEqual({ threshold: 50, bonus: 10 });
    expect(WEEKLY_BONUSES[1]).toEqual({ threshold: 100, bonus: 25 });
    expect(WEEKLY_BONUSES[2]).toEqual({ threshold: 200, bonus: 50 });
  });

  it('thresholds are in ascending order', () => {
    for (let i = 1; i < WEEKLY_BONUSES.length; i++) {
      expect(WEEKLY_BONUSES[i].threshold).toBeGreaterThan(
        WEEKLY_BONUSES[i - 1].threshold,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// aggregateXPByDay (pure logic)
// ---------------------------------------------------------------------------

describe('aggregateXPByDay', () => {
  it('aggregates XP from multiple activities on the same day', () => {
    const activities = [
      makeActivity({ xp: 30, created_at: '2026-03-04T08:00:00Z' }),
      makeActivity({ xp: 25, created_at: '2026-03-04T14:00:00Z' }),
      makeActivity({ xp: 40, created_at: '2026-03-04T20:00:00Z' }),
    ];

    const result = aggregateXPByDay(activities);

    expect(result).toEqual([{ date: '2026-03-04', xp: 95 }]);
  });

  it('groups by different days and sorts ascending', () => {
    const activities = [
      makeActivity({ xp: 30, created_at: '2026-03-05T10:00:00Z' }),
      makeActivity({ xp: 25, created_at: '2026-03-04T10:00:00Z' }),
      makeActivity({ xp: 40, created_at: '2026-03-06T10:00:00Z' }),
    ];

    const result = aggregateXPByDay(activities);

    expect(result).toEqual([
      { date: '2026-03-04', xp: 25 },
      { date: '2026-03-05', xp: 30 },
      { date: '2026-03-06', xp: 40 },
    ]);
  });

  it('returns empty array for no activities', () => {
    const result = aggregateXPByDay([]);

    expect(result).toEqual([]);
  });

  it('handles a single activity', () => {
    const activities = [makeActivity({ xp: 35 })];

    const result = aggregateXPByDay(activities);

    expect(result).toEqual([{ date: '2026-03-04', xp: 35 }]);
  });

  it('handles activities spanning multiple months', () => {
    const activities = [
      makeActivity({ xp: 30, created_at: '2026-02-28T10:00:00Z' }),
      makeActivity({ xp: 25, created_at: '2026-03-01T10:00:00Z' }),
    ];

    const result = aggregateXPByDay(activities);

    expect(result).toEqual([
      { date: '2026-02-28', xp: 30 },
      { date: '2026-03-01', xp: 25 },
    ]);
  });
});

// ---------------------------------------------------------------------------
// TIER_COLORS constants
// ---------------------------------------------------------------------------

describe('TIER_COLORS constants', () => {
  it('has all 5 tiers', () => {
    expect(Object.keys(TIER_COLORS)).toHaveLength(5);
    expect(Object.keys(TIER_COLORS)).toEqual(
      expect.arrayContaining(['bronze', 'silver', 'gold', 'diamond', 'master']),
    );
  });

  it('each tier has accent, glow, badge, and ring', () => {
    for (const tier of Object.values(TIER_COLORS)) {
      expect(tier).toHaveProperty('accent');
      expect(tier).toHaveProperty('glow');
      expect(tier).toHaveProperty('badge');
      expect(tier).toHaveProperty('ring');
    }
  });

  it('has correct accent colors per spec', () => {
    expect(TIER_COLORS.bronze.accent).toBe('#8899b0');
    expect(TIER_COLORS.silver.accent).toBe('#4d8ef7');
    expect(TIER_COLORS.gold.accent).toBe('#9b6ff8');
    expect(TIER_COLORS.diamond.accent).toBe('#f7b740');
    expect(TIER_COLORS.master.accent).toBe('#f05555');
  });
});

// ---------------------------------------------------------------------------
// getUserState (Supabase)
// ---------------------------------------------------------------------------

describe('getUserState', () => {
  it('returns user state when found', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: demoState, error: null }),
    });

    const result = await getUserState('user-1');

    expect(result).toEqual(demoState);
    expect(mockFrom).toHaveBeenCalledWith('user_state');
  });

  it('returns null on query error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'not found' },
      }),
    });

    const result = await getUserState('user-1');

    expect(result).toBeNull();
  });

  it('returns null when data is null without error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const result = await getUserState('user-1');

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getRecentActivities (Supabase)
// ---------------------------------------------------------------------------

describe('getRecentActivities', () => {
  it('returns recent activities with default limit', async () => {
    const activities = [makeActivity()];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: activities, error: null }),
    });

    const result = await getRecentActivities('user-1');

    expect(result).toEqual(activities);
    expect(mockFrom).toHaveBeenCalledWith('user_activities');
  });

  it('returns empty array when user has no activities', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    const result = await getRecentActivities('user-1');

    expect(result).toEqual([]);
  });

  it('returns empty array on query error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'query failed' },
      }),
    });

    const result = await getRecentActivities('user-1');

    expect(result).toEqual([]);
  });

  it('returns empty array when data is null without error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const result = await getRecentActivities('user-1');

    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getActivitiesInRange (Supabase)
// ---------------------------------------------------------------------------

describe('getActivitiesInRange', () => {
  it('returns activities within date range', async () => {
    const activities = [makeActivity()];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: activities, error: null }),
    });

    const result = await getActivitiesInRange('user-1', '2026-03-01', '2026-03-31');

    expect(result).toEqual(activities);
    expect(mockFrom).toHaveBeenCalledWith('user_activities');
  });

  it('returns empty array when no activities in range', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    const result = await getActivitiesInRange('user-1', '2026-04-01', '2026-04-30');

    expect(result).toEqual([]);
  });

  it('returns empty array on query error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'query failed' },
      }),
    });

    const result = await getActivitiesInRange('user-1', '2026-03-01', '2026-03-31');

    expect(result).toEqual([]);
  });

  it('returns empty array when data is null without error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const result = await getActivitiesInRange('user-1', '2026-03-01', '2026-03-31');

    expect(result).toEqual([]);
  });
});
