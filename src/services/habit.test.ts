import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase';
vi.mock('./activity', () => ({
  createActivity: vi.fn(),
}));

import { supabase } from '@/lib/supabase';
import { createActivity } from './activity';

const mockCreateActivity = createActivity as ReturnType<typeof vi.fn>;
import {
  getMissions,
  getCompletions,
  getDaysInMonth,
  computeMonthlyStats,
  createMission,
  deleteMission,
  completeMission,
} from './habit';
import type { Mission, MissionCompletion } from '@/types/habit';

const mockFrom = supabase.from as ReturnType<typeof vi.fn>;

// --- Fixtures ---

const baseMission: Mission = {
  id: 'mission-1',
  user_id: 'user-1',
  name: 'Meditar',
  icon: '🧘',
  category: 'spiritual',
  day_of_week: null, // every day
  is_fixed: true,
  created_at: '2026-01-01T00:00:00Z',
};

const baseCompletion: MissionCompletion = {
  id: 'comp-1',
  mission_id: 'mission-1',
  user_id: 'user-1',
  activity_id: 'act-1',
  completed_at: '2026-01-15',
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// getMissions
// ---------------------------------------------------------------------------

describe('getMissions', () => {
  it('returns fixed missions for the user', async () => {
    const missions = [baseMission];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: missions, error: null }),
    });

    const result = await getMissions('user-1');

    expect(result).toEqual(missions);
    expect(mockFrom).toHaveBeenCalledWith('user_missions');
  });

  it('returns empty array when user has no missions', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    const result = await getMissions('user-1');

    expect(result).toEqual([]);
  });

  it('returns empty array on query error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'query failed' },
      }),
    });

    const result = await getMissions('user-1');

    expect(result).toEqual([]);
  });

  it('returns empty array when data is null without error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const result = await getMissions('user-1');

    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getCompletions
// ---------------------------------------------------------------------------

describe('getCompletions', () => {
  it('returns completions within date range', async () => {
    const completions = [baseCompletion];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: completions, error: null }),
    });

    const result = await getCompletions('user-1', '2026-01-01', '2026-01-31');

    expect(result).toEqual(completions);
    expect(mockFrom).toHaveBeenCalledWith('user_mission_completions');
  });

  it('returns empty array when no completions in range', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    const result = await getCompletions('user-1', '2026-02-01', '2026-02-28');

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

    const result = await getCompletions('user-1', '2026-01-01', '2026-01-31');

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

    const result = await getCompletions('user-1', '2026-01-01', '2026-01-31');

    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getDaysInMonth (pure logic)
// ---------------------------------------------------------------------------

describe('getDaysInMonth', () => {
  it('returns 31 days for January', () => {
    const days = getDaysInMonth(2026, 1);

    expect(days).toHaveLength(31);
    expect(days[0]).toBe('2026-01-01');
    expect(days[30]).toBe('2026-01-31');
  });

  it('returns 28 days for February (non-leap year)', () => {
    const days = getDaysInMonth(2025, 2);

    expect(days).toHaveLength(28);
    expect(days[0]).toBe('2025-02-01');
    expect(days[27]).toBe('2025-02-28');
  });

  it('returns 29 days for February (leap year)', () => {
    const days = getDaysInMonth(2024, 2);

    expect(days).toHaveLength(29);
    expect(days[28]).toBe('2024-02-29');
  });

  it('returns 30 days for April', () => {
    const days = getDaysInMonth(2026, 4);

    expect(days).toHaveLength(30);
  });

  it('all dates are in YYYY-MM-DD format', () => {
    const days = getDaysInMonth(2026, 3);

    for (const day of days) {
      expect(day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

// ---------------------------------------------------------------------------
// computeMonthlyStats (pure logic)
// ---------------------------------------------------------------------------

describe('computeMonthlyStats', () => {
  const jan2026 = getDaysInMonth(2026, 1); // 31 days

  it('returns all zeros when there are no missions', () => {
    const stats = computeMonthlyStats([], [], jan2026);

    expect(stats.dailyRates).toHaveLength(31);
    expect(stats.dailyRates.every((r) => r === 0)).toBe(true);
    expect(stats.monthlyRate).toBe(0);
  });

  it('returns all zeros when there are no completions', () => {
    const missions = [baseMission]; // every day
    const stats = computeMonthlyStats(missions, [], jan2026);

    expect(stats.dailyRates).toHaveLength(31);
    expect(stats.dailyRates.every((r) => r === 0)).toBe(true);
    expect(stats.monthlyRate).toBe(0);
  });

  it('returns 100% when all missions are completed every day', () => {
    const missions = [baseMission]; // every day, 1 mission
    const completions: MissionCompletion[] = jan2026.map((day, i) => ({
      id: `comp-${i}`,
      mission_id: 'mission-1',
      user_id: 'user-1',
      activity_id: `act-${i}`,
      completed_at: day,
    }));

    const stats = computeMonthlyStats(missions, completions, jan2026);

    expect(stats.dailyRates.every((r) => r === 1)).toBe(true);
    expect(stats.monthlyRate).toBe(1);
  });

  it('calculates correct rate with partial completions', () => {
    const missions = [baseMission]; // every day
    // Complete only first 10 days
    const completions: MissionCompletion[] = jan2026
      .slice(0, 10)
      .map((day, i) => ({
        id: `comp-${i}`,
        mission_id: 'mission-1',
        user_id: 'user-1',
        activity_id: `act-${i}`,
        completed_at: day,
      }));

    const stats = computeMonthlyStats(missions, completions, jan2026);

    // First 10 days: rate = 1, remaining 21 days: rate = 0
    for (let i = 0; i < 10; i++) {
      expect(stats.dailyRates[i]).toBe(1);
    }
    for (let i = 10; i < 31; i++) {
      expect(stats.dailyRates[i]).toBe(0);
    }
    expect(stats.monthlyRate).toBeCloseTo(10 / 31);
  });

  it('handles multiple missions per day', () => {
    const mission2: Mission = {
      ...baseMission,
      id: 'mission-2',
      name: 'Exercicio',
      category: 'fitness',
    };
    const missions = [baseMission, mission2]; // both every day

    // Day 1: both completed, Day 2: only one completed
    const completions: MissionCompletion[] = [
      { ...baseCompletion, id: 'c1', mission_id: 'mission-1', completed_at: jan2026[0] },
      { ...baseCompletion, id: 'c2', mission_id: 'mission-2', completed_at: jan2026[0] },
      { ...baseCompletion, id: 'c3', mission_id: 'mission-1', completed_at: jan2026[1] },
    ];

    const stats = computeMonthlyStats(missions, completions, jan2026);

    expect(stats.dailyRates[0]).toBe(1);     // 2/2
    expect(stats.dailyRates[1]).toBe(0.5);   // 1/2
    expect(stats.dailyRates[2]).toBe(0);     // 0/2
    // Total: 3 completed / (2 missions * 31 days) = 3/62
    expect(stats.monthlyRate).toBeCloseTo(3 / 62);
  });

  it('respects day_of_week filter for specific-day missions', () => {
    // 2026-01-05 is a Monday (day_of_week = 0 in spec: 0=Mon)
    const mondayMission: Mission = {
      ...baseMission,
      id: 'mission-monday',
      name: 'Monday task',
      day_of_week: 0, // Monday only
    };

    // Complete on the first Monday (2026-01-05)
    const completions: MissionCompletion[] = [
      {
        ...baseCompletion,
        id: 'c1',
        mission_id: 'mission-monday',
        completed_at: '2026-01-05',
      },
    ];

    const stats = computeMonthlyStats([mondayMission], completions, jan2026);

    // Jan 2026 has 4 Mondays: 5, 12, 19, 26
    // Only non-Monday days should have rate 0 (no applicable missions)
    // Monday days: 1 completed out of 4 applicable
    const mondayIndices = [4, 11, 18, 25]; // 0-indexed: Jan 5, 12, 19, 26
    expect(stats.dailyRates[mondayIndices[0]]).toBe(1); // completed
    expect(stats.dailyRates[mondayIndices[1]]).toBe(0); // not completed
    expect(stats.dailyRates[mondayIndices[2]]).toBe(0);
    expect(stats.dailyRates[mondayIndices[3]]).toBe(0);

    // Non-Monday days should be 0 (no missions applicable)
    expect(stats.dailyRates[0]).toBe(0); // Jan 1 is Thursday

    expect(stats.monthlyRate).toBeCloseTo(1 / 4);
  });

  it('returns all zeros when days array is empty', () => {
    const stats = computeMonthlyStats([baseMission], [], []);

    expect(stats.dailyRates).toHaveLength(0);
    expect(stats.monthlyRate).toBe(0);
  });

  it('ignores completions for missions not in the list', () => {
    const missions = [baseMission];
    const completions: MissionCompletion[] = [
      {
        ...baseCompletion,
        id: 'c1',
        mission_id: 'unknown-mission',
        completed_at: jan2026[0],
      },
    ];

    const stats = computeMonthlyStats(missions, completions, jan2026);

    expect(stats.dailyRates[0]).toBe(0);
    expect(stats.monthlyRate).toBe(0);
  });

  it('ignores duplicate completions for the same mission+day', () => {
    const missions = [baseMission];
    // Two completions for the same mission on the same day
    const completions: MissionCompletion[] = [
      { ...baseCompletion, id: 'c1', mission_id: 'mission-1', completed_at: jan2026[0] },
      { ...baseCompletion, id: 'c2', mission_id: 'mission-1', completed_at: jan2026[0] },
    ];

    const stats = computeMonthlyStats(missions, completions, jan2026);

    // Should still be 1 (100%), not 2
    expect(stats.dailyRates[0]).toBe(1);
    expect(stats.monthlyRate).toBeCloseTo(1 / 31);
  });

  it('mixes daily and specific-day missions correctly', () => {
    const dailyMission = baseMission; // every day
    // 2026-01-03 is a Saturday → day_of_week = 5 (0=Mon)
    const saturdayMission: Mission = {
      ...baseMission,
      id: 'mission-sat',
      name: 'Saturday task',
      day_of_week: 5,
    };

    // Complete both on Saturday Jan 3
    const completions: MissionCompletion[] = [
      { ...baseCompletion, id: 'c1', mission_id: 'mission-1', completed_at: '2026-01-03' },
      { ...baseCompletion, id: 'c2', mission_id: 'mission-sat', completed_at: '2026-01-03' },
    ];

    const stats = computeMonthlyStats(
      [dailyMission, saturdayMission],
      completions,
      jan2026,
    );

    // Jan 3 (index 2): 2 missions, 2 completed → rate 1
    expect(stats.dailyRates[2]).toBe(1);

    // Jan 1 (index 0, Thursday): only daily mission, 0 completed → rate 0
    expect(stats.dailyRates[0]).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// createMission
// ---------------------------------------------------------------------------

describe('createMission', () => {
  it('creates a mission and returns it', async () => {
    const created = { ...baseMission, name: 'Nova missão' };
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: created, error: null }),
    });

    const result = await createMission('user-1', 'Nova missão', '🧘', 'spiritual', null, true);

    expect(result).toEqual(created);
    expect(mockFrom).toHaveBeenCalledWith('user_missions');
  });

  it('returns null on insert error', async () => {
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'insert failed' } }),
    });

    const result = await createMission('user-1', 'Teste', '📌', 'fitness', 0, false);

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// deleteMission
// ---------------------------------------------------------------------------

describe('deleteMission', () => {
  it('deletes a mission and returns true', async () => {
    mockFrom.mockReturnValueOnce({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    const result = await deleteMission('mission-1');

    expect(result).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('user_missions');
  });

  it('returns false on delete error', async () => {
    mockFrom.mockReturnValueOnce({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: 'delete failed' } }),
    });

    const result = await deleteMission('mission-1');

    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// completeMission
// ---------------------------------------------------------------------------

/** Build a chainable mock for the duplicate-check query (select → eq → eq → eq → limit) */
function mockDuplicateCheck(data: unknown[]) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockResolvedValue({ data, error: null });
  mockFrom.mockReturnValueOnce(chain);
  return chain;
}

/** Build a chainable mock for the duplicate-check query that errors */
function mockDuplicateCheckError() {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockResolvedValue({ data: null, error: { message: 'query failed' } });
  mockFrom.mockReturnValueOnce(chain);
  return chain;
}

const demoActivity = {
  id: 'act-new',
  user_id: 'user-1',
  category: 'spiritual' as const,
  note: 'Meditar',
  xp: 20,
  created_at: '2026-03-10T12:00:00Z',
};

describe('completeMission', () => {
  it('creates activity and completion record', async () => {
    mockDuplicateCheck([]); // no existing completion

    mockCreateActivity.mockResolvedValue(demoActivity);

    // Insert completion record
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });

    const result = await completeMission(baseMission, 'user-1');

    expect(result).toBe(true);
    expect(mockCreateActivity).toHaveBeenCalledWith({
      user_id: 'user-1',
      category: 'spiritual',
      note: 'Meditar',
    });
  });

  it('returns true without creating activity when already completed today', async () => {
    mockDuplicateCheck([{ id: 'existing-comp' }]); // already completed

    const result = await completeMission(baseMission, 'user-1');

    expect(result).toBe(true);
    expect(mockCreateActivity).not.toHaveBeenCalled();
  });

  it('returns false when createActivity fails', async () => {
    mockDuplicateCheck([]); // no existing completion

    mockCreateActivity.mockResolvedValue(null);

    const result = await completeMission(baseMission, 'user-1');

    expect(result).toBe(false);
  });

  it('returns false when completion insert fails', async () => {
    mockDuplicateCheck([]); // no existing completion

    mockCreateActivity.mockResolvedValue(demoActivity);

    // Insert completion fails
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ error: { message: 'insert failed' } }),
    });

    const result = await completeMission(baseMission, 'user-1');

    expect(result).toBe(false);
  });

  it('proceeds when duplicate check query fails (fail-open)', async () => {
    mockDuplicateCheckError(); // query error, data is null

    mockCreateActivity.mockResolvedValue(demoActivity);

    // Insert completion
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });

    const result = await completeMission(baseMission, 'user-1');

    expect(result).toBe(true);
    expect(mockCreateActivity).toHaveBeenCalled();
  });
});
