import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase';
import { createActivity, getActivities, computeStreak, updateUserState } from './activity';
import { CATEGORIES, type CategoryId } from '@/types/activity';

const mockFrom = supabase.from as ReturnType<typeof vi.fn>;

const demoEntry = {
  id: 'entry-1',
  user_id: 'user-1',
  category: 'fitness' as CategoryId,
  note: null,
  xp: 30,
  created_at: '2026-03-04T12:00:00Z',
};

const demoUserState = {
  id: 'state-1',
  xp: 100,
  streak: 3,
  best_streak: 5,
  total_tasks: 10,
};

/** Mock chain for updateUserState: user_state select, user_activities select (streak), user_state update */
function mockUpdateUserStateChains() {
  // 1st from('user_state') → select state
  mockFrom.mockReturnValueOnce({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: demoUserState, error: null }),
  });
  // 2nd from('user_activities') → get recent activities for streak
  mockFrom.mockReturnValueOnce({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: [demoEntry], error: null }),
  });
  // 3rd from('user_state') → update
  mockFrom.mockReturnValueOnce({
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ error: null }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// createActivity
// ---------------------------------------------------------------------------

describe('createActivity', () => {
  it('creates an activity successfully', async () => {
    // insert
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: demoEntry, error: null }),
    });
    mockUpdateUserStateChains();

    const result = await createActivity({ user_id: 'user-1', category: 'fitness' });

    expect(result).toEqual(demoEntry);
    expect(mockFrom).toHaveBeenCalledWith('user_activities');
  });

  it('returns null for an invalid category', async () => {
    const result = await createActivity({ user_id: 'user-1', category: 'invalid' as CategoryId });

    expect(result).toBeNull();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('creates an activity without a note (null)', async () => {
    const insertChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: demoEntry, error: null }),
    };
    mockFrom.mockReturnValueOnce(insertChain);
    mockUpdateUserStateChains();

    await createActivity({ user_id: 'user-1', category: 'fitness' });

    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ note: null }),
    );
  });

  it('creates an activity with a note', async () => {
    const entryWithNote = { ...demoEntry, note: 'Morning run' };
    const insertChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: entryWithNote, error: null }),
    };
    mockFrom.mockReturnValueOnce(insertChain);
    mockUpdateUserStateChains();

    const result = await createActivity({ user_id: 'user-1', category: 'fitness', note: 'Morning run' });

    expect(result).toEqual(entryWithNote);
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ note: 'Morning run' }),
    );
  });

  it('returns null when insert fails', async () => {
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'insert failed' } }),
    });

    const result = await createActivity({ user_id: 'user-1', category: 'fitness' });

    expect(result).toBeNull();
  });

  it('still returns activity data when updateUserState fails', async () => {
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: demoEntry, error: null }),
    });
    // updateUserState fails at fetch step
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
    });

    const result = await createActivity({ user_id: 'user-1', category: 'fitness' });

    expect(result).toEqual(demoEntry);
  });

  it('uses the correct XP for each category', async () => {
    const expectedXP: Record<CategoryId, number> = {
      fitness: 30,
      nutrition: 25,
      delivery: 40,
      learning: 25,
      spiritual: 20,
      social: 30,
      creativity: 35,
    };

    for (const [categoryId, xp] of Object.entries(expectedXP)) {
      vi.clearAllMocks();
      const insertChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...demoEntry, category: categoryId, xp },
          error: null,
        }),
      };
      mockFrom.mockReturnValueOnce(insertChain);
      mockUpdateUserStateChains();

      await createActivity({ user_id: 'user-1', category: categoryId as CategoryId });

      expect(insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ xp }),
      );
    }
  });
});

// ---------------------------------------------------------------------------
// getActivities
// ---------------------------------------------------------------------------

describe('getActivities', () => {
  it('returns a list of activities', async () => {
    const activities = [demoEntry, { ...demoEntry, id: 'entry-2' }];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: activities, error: null }),
    });

    const result = await getActivities('user-1');

    expect(result).toEqual(activities);
    expect(mockFrom).toHaveBeenCalledWith('user_activities');
  });

  it('returns an empty array when user has no activities', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    const result = await getActivities('user-1');

    expect(result).toEqual([]);
  });

  it('returns an empty array on query error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: 'query failed' } }),
    });

    const result = await getActivities('user-1');

    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// CATEGORIES constants (pure logic)
// ---------------------------------------------------------------------------

describe('CATEGORIES constants', () => {
  it('has exactly 7 categories', () => {
    expect(Object.keys(CATEGORIES)).toHaveLength(7);
  });

  it('each category has the correct XP value', () => {
    expect(CATEGORIES.fitness.xp).toBe(30);
    expect(CATEGORIES.nutrition.xp).toBe(25);
    expect(CATEGORIES.delivery.xp).toBe(40);
    expect(CATEGORIES.learning.xp).toBe(25);
    expect(CATEGORIES.spiritual.xp).toBe(20);
    expect(CATEGORIES.social.xp).toBe(30);
    expect(CATEGORIES.creativity.xp).toBe(35);
  });
});

// ---------------------------------------------------------------------------
// computeStreak (pure logic)
// ---------------------------------------------------------------------------

describe('computeStreak', () => {
  it('increments streak when last activity was yesterday', () => {
    expect(computeStreak('2026-03-03', '2026-03-04', 5)).toBe(6);
  });

  it('keeps streak when last activity was today', () => {
    expect(computeStreak('2026-03-04', '2026-03-04', 5)).toBe(5);
  });

  it('returns at least 1 when last activity was today and streak is 0', () => {
    expect(computeStreak('2026-03-04', '2026-03-04', 0)).toBe(1);
  });

  it('resets streak to 1 when gap is more than 1 day', () => {
    expect(computeStreak('2026-03-01', '2026-03-04', 5)).toBe(1);
  });

  it('returns 1 when there is no previous activity', () => {
    expect(computeStreak(null, '2026-03-04', 0)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// updateUserState
// ---------------------------------------------------------------------------

describe('updateUserState', () => {
  it('increments xp and total_tasks', async () => {
    const updateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };

    // select user_state
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'state-1', xp: 100, streak: 3, best_streak: 5, total_tasks: 10 },
        error: null,
      }),
    });
    // select recent activities for streak
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [demoEntry], error: null }),
    });
    // update user_state
    mockFrom.mockReturnValueOnce(updateChain);

    const result = await updateUserState('user-1', 30);

    expect(result).toBe(true);
    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ xp: 130, total_tasks: 11 }),
    );
  });

  it('updates best_streak when new streak exceeds it', async () => {
    const updateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // select user_state — streak 5, best_streak 5
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'state-1', xp: 100, streak: 5, best_streak: 5, total_tasks: 10 },
        error: null,
      }),
    });
    // select recent activities — previous activity was yesterday
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [
          { created_at: new Date().toISOString() },
          { created_at: yesterday.toISOString() },
        ],
        error: null,
      }),
    });
    // update
    mockFrom.mockReturnValueOnce(updateChain);

    await updateUserState('user-1', 30);

    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ streak: 6, best_streak: 6 }),
    );
  });

  it('returns false when user_state fetch fails', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
    });

    const result = await updateUserState('user-1', 30);

    expect(result).toBe(false);
  });
});
