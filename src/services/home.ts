import { supabase } from '@/lib/supabase';
import type { ActivityEntry } from '@/types/activity';
import type {
  RankInfo,
  TierId,
  UserState,
  WeeklyProgress,
  DayXP,
} from '@/types/home';
import { TIER_COLORS, WEEKLY_BONUSES } from '@/types/home';

// --- Rank calculation ---

export function getRank(xp: number): RankInfo {
  // XP per level: 50 * (level - 1)^2
  // Find level: largest L where 50*(L-1)^2 <= xp
  let level = 1;
  while (50 * level * level <= xp) {
    level++;
  }

  const xpForCurrentLevel = 50 * (level - 1) * (level - 1);
  const xpForNextLevel = 50 * level * level;

  let tier: TierId;
  let tierLabel: string;

  if (level <= 4) {
    tier = 'bronze';
    tierLabel = 'BRONZE';
  } else if (level <= 8) {
    tier = 'silver';
    tierLabel = 'SILVER';
  } else if (level <= 12) {
    tier = 'gold';
    tierLabel = 'GOLD';
  } else if (level <= 16) {
    tier = 'diamond';
    tierLabel = 'DIAMOND';
  } else {
    tier = 'master';
    tierLabel = 'MASTER';
  }

  return {
    level,
    tier,
    tierLabel,
    colors: TIER_COLORS[tier],
    currentXP: xp,
    xpForCurrentLevel,
    xpForNextLevel,
  };
}

// --- Weekly progress ---

export function computeWeeklyProgress(weeklyXP: number): WeeklyProgress {
  let unlockedBonus: number | null = null;

  for (const b of WEEKLY_BONUSES) {
    if (weeklyXP >= b.threshold) {
      unlockedBonus = b.bonus;
    }
  }

  return {
    currentXP: weeklyXP,
    bonuses: WEEKLY_BONUSES,
    unlockedBonus,
  };
}

// --- Aggregate XP by day ---

export function aggregateXPByDay(activities: ActivityEntry[]): DayXP[] {
  const map = new Map<string, number>();

  for (const a of activities) {
    const date = a.created_at.split('T')[0];
    map.set(date, (map.get(date) ?? 0) + a.xp);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, xp]) => ({ date, xp }));
}

// --- Supabase queries ---

export async function getUserState(userId: string): Promise<UserState | null> {
  const { data, error } = await supabase
    .from('user_state')
    .select('id, user_id, xp, streak, best_streak, total_tasks')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('getUserState error:', error.message);
    return null;
  }

  return data;
}

export async function getOrCreateUserState(userId: string): Promise<UserState | null> {
  const existing = await getUserState(userId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from('user_state')
    .upsert({ user_id: userId }, { onConflict: 'user_id' })
    .select('id, user_id, xp, streak, best_streak, total_tasks')
    .single();

  if (error) {
    console.error('getOrCreateUserState error:', error.message);
    return null;
  }

  return data ?? null;
}

export async function getRecentActivities(
  userId: string,
  limit = 5,
): Promise<ActivityEntry[]> {
  const { data, error } = await supabase
    .from('user_activities')
    .select('id, user_id, category, note, xp, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getRecentActivities error:', error.message);
    return [];
  }

  return data ?? [];
}

export async function getActivitiesInRange(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<ActivityEntry[]> {
  const { data, error } = await supabase
    .from('user_activities')
    .select('id, user_id, category, note, xp, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getActivitiesInRange error:', error.message);
    return [];
  }

  return data ?? [];
}
