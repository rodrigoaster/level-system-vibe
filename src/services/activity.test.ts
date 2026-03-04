import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('./xp', () => ({
  addXP: vi.fn(),
}));

import { supabase } from '@/lib/supabase';
import { addXP } from './xp';
import { createActivity, getActivities } from './activity';
import { CATEGORIES, type CategoryId } from '@/types/activity';

const mockFrom = supabase.from as ReturnType<typeof vi.fn>;
const mockAddXP = addXP as ReturnType<typeof vi.fn>;

const demoEntry = {
  id: 'entry-1',
  user_id: 'user-1',
  category: 'fitness' as CategoryId,
  note: null,
  xp: 30,
  created_at: '2026-03-04T12:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// createActivity
// ---------------------------------------------------------------------------

describe('createActivity', () => {
  it('creates an activity successfully', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: demoEntry, error: null }),
    });
    mockAddXP.mockResolvedValue({ id: 'user-1', username: 'demo', xp: 30, level: 1 });

    const result = await createActivity({ user_id: 'user-1', category: 'fitness' });

    expect(result).toEqual(demoEntry);
    expect(mockFrom).toHaveBeenCalledWith('user_activities');
    expect(mockAddXP).toHaveBeenCalledWith('user-1', 30);
  });

  it('returns null for an invalid category', async () => {
    const result = await createActivity({ user_id: 'user-1', category: 'invalid' as CategoryId });

    expect(result).toBeNull();
    expect(mockFrom).not.toHaveBeenCalled();
    expect(mockAddXP).not.toHaveBeenCalled();
  });

  it('creates an activity without a note (null)', async () => {
    const chain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: demoEntry, error: null }),
    };
    mockFrom.mockReturnValue(chain);
    mockAddXP.mockResolvedValue({ id: 'user-1', username: 'demo', xp: 30, level: 1 });

    await createActivity({ user_id: 'user-1', category: 'fitness' });

    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ note: null }),
    );
  });

  it('creates an activity with a note', async () => {
    const entryWithNote = { ...demoEntry, note: 'Morning run' };
    const chain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: entryWithNote, error: null }),
    };
    mockFrom.mockReturnValue(chain);
    mockAddXP.mockResolvedValue({ id: 'user-1', username: 'demo', xp: 30, level: 1 });

    const result = await createActivity({ user_id: 'user-1', category: 'fitness', note: 'Morning run' });

    expect(result).toEqual(entryWithNote);
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ note: 'Morning run' }),
    );
  });

  it('returns null when insert fails', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'insert failed' } }),
    });

    const result = await createActivity({ user_id: 'user-1', category: 'fitness' });

    expect(result).toBeNull();
    expect(mockAddXP).not.toHaveBeenCalled();
  });

  it('returns null when addXP fails', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: demoEntry, error: null }),
    });
    mockAddXP.mockResolvedValue(null);

    const result = await createActivity({ user_id: 'user-1', category: 'fitness' });

    expect(result).toBeNull();
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
      const chain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...demoEntry, category: categoryId, xp },
          error: null,
        }),
      };
      mockFrom.mockReturnValue(chain);
      mockAddXP.mockResolvedValue({ id: 'user-1', username: 'demo', xp, level: 1 });

      await createActivity({ user_id: 'user-1', category: categoryId as CategoryId });

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ xp }),
      );
      expect(mockAddXP).toHaveBeenCalledWith('user-1', xp);
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
