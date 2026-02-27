import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase singleton before importing the service
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase';
import { getUserProfile, addXP } from './xp';

const mockFrom = supabase.from as ReturnType<typeof vi.fn>;

// Helper to build a chainable Supabase query mock that resolves to { data, error }
function mockQuery(result: { data: unknown; error: unknown }) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    update: vi.fn().mockReturnThis(),
  };
  mockFrom.mockReturnValue(chain);
  return chain;
}

const demoProfile = {
  id: 'abc-123',
  username: 'demo',
  xp: 0,
  level: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// getUserProfile
// ---------------------------------------------------------------------------

describe('getUserProfile', () => {
  it('returns the profile when found', async () => {
    mockQuery({ data: demoProfile, error: null });

    const result = await getUserProfile('abc-123');

    expect(result).toEqual(demoProfile);
    expect(mockFrom).toHaveBeenCalledWith('user_profiles');
  });

  it('returns null when Supabase returns an error', async () => {
    mockQuery({ data: null, error: { message: 'row not found' } });

    const result = await getUserProfile('unknown-id');

    expect(result).toBeNull();
  });

  it('returns null when data is null without an error', async () => {
    mockQuery({ data: null, error: null });

    const result = await getUserProfile('ghost-id');

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// addXP
// ---------------------------------------------------------------------------

describe('addXP', () => {
  it('increments XP and returns the updated profile', async () => {
    const updated = { ...demoProfile, xp: 10, level: 1 };

    // First call: getUserProfile select
    // Second call: update
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: demoProfile, error: null }),
      })
      .mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updated, error: null }),
      });

    const result = await addXP('abc-123', 10);

    expect(result).toEqual(updated);
  });

  it('calculates level correctly at the 100 XP threshold (level-up)', async () => {
    const profileAt99 = { ...demoProfile, xp: 99, level: 1 };
    // Adding 1 XP → 100 XP → level 2
    const expectedUpdate = { xp: 100, level: 2 };

    const updateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { ...profileAt99, ...expectedUpdate },
        error: null,
      }),
    };

    mockFrom
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: profileAt99, error: null }),
      })
      .mockReturnValueOnce(updateChain);

    const result = await addXP('abc-123', 1);

    expect(result?.xp).toBe(100);
    expect(result?.level).toBe(2);
    // Verify the update was called with the correct computed values
    expect(updateChain.update).toHaveBeenCalledWith({ xp: 100, level: 2 });
  });

  it('calculates level correctly just below the threshold (no level-up)', async () => {
    const profileAt90 = { ...demoProfile, xp: 90, level: 1 };
    const updateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { ...profileAt90, xp: 99, level: 1 },
        error: null,
      }),
    };

    mockFrom
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: profileAt90, error: null }),
      })
      .mockReturnValueOnce(updateChain);

    await addXP('abc-123', 9);

    expect(updateChain.update).toHaveBeenCalledWith({ xp: 99, level: 1 });
  });

  it('returns null when the user profile is not found', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
    });

    const result = await addXP('missing-id', 10);

    expect(result).toBeNull();
  });

  it('returns null when the update query fails', async () => {
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: demoProfile, error: null }),
      })
      .mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'write failed' } }),
      });

    const result = await addXP('abc-123', 10);

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Level formula (pure logic verification)
// ---------------------------------------------------------------------------

describe('level formula: floor(xp / 100) + 1', () => {
  const cases: [number, number][] = [
    [0, 1],
    [99, 1],
    [100, 2],
    [199, 2],
    [200, 3],
    [999, 10],
  ];

  it.each(cases)('%i XP → level %i', (xp, expectedLevel) => {
    expect(Math.floor(xp / 100) + 1).toBe(expectedLevel);
  });
});
