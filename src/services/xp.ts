import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  username: string;
  xp: number;
  level: number;
}

/**
 * Quadratic level formula: largest L where 50*(L-1)^2 <= xp
 */
export function computeLevel(xp: number): number {
  let level = 1;
  while (50 * level * level <= xp) {
    level++;
  }
  return level;
}

export async function getUserProfile(id: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, username, xp, level')
    .eq('id', id)
    .single();

  if (error) {
    console.error('getUserProfile error:', error.message);
    return null;
  }

  return data;
}

export async function addXP(id: string, amount: number): Promise<UserProfile | null> {
  const profile = await getUserProfile(id);
  if (!profile) return null;

  const newXp = profile.xp + amount;
  const newLevel = computeLevel(newXp);

  const { data, error } = await supabase
    .from('user_profiles')
    .update({ xp: newXp, level: newLevel })
    .eq('id', id)
    .select('id, username, xp, level')
    .single();

  if (error) {
    console.error('addXP error:', error.message);
    return null;
  }

  return data;
}
