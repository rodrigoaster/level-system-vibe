import { supabase } from '@/lib/supabase';
import { addXP } from './xp';
import { CATEGORIES, type ActivityEntry, type CreateActivityInput } from '@/types/activity';

/**
 * Pure function to compute new streak value.
 * - Last activity yesterday -> currentStreak + 1
 * - Last activity today -> currentStreak (min 1)
 * - No activity or gap > 1 day -> 1
 */
export function computeStreak(
  lastActivityDate: string | null,
  currentDate: string,
  currentStreak: number,
): number {
  if (!lastActivityDate) return 1;

  const last = new Date(lastActivityDate);
  last.setHours(0, 0, 0, 0);
  const current = new Date(currentDate);
  current.setHours(0, 0, 0, 0);

  const diffMs = current.getTime() - last.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return currentStreak + 1;
  if (diffDays === 0) return Math.max(currentStreak, 1);
  return 1;
}

/**
 * Updates user_state with new XP, total_tasks, streak and best_streak.
 */
export async function updateUserState(userId: string, xpAmount: number): Promise<boolean> {
  const { data: state, error: stateError } = await supabase
    .from('user_state')
    .select('id, xp, streak, best_streak, total_tasks')
    .eq('user_id', userId)
    .single();

  if (stateError || !state) {
    console.error('updateUserState: failed to fetch user_state', stateError?.message);
    return false;
  }

  // Get the most recent activity before this one to calculate streak
  const { data: lastActivity } = await supabase
    .from('user_activities')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(2);

  // The second entry is the previous activity (first is the one just inserted)
  const previousDate = lastActivity && lastActivity.length > 1
    ? lastActivity[1].created_at
    : null;

  const now = new Date().toISOString();
  const newStreak = computeStreak(previousDate, now, state.streak);
  const newBestStreak = Math.max(state.best_streak, newStreak);

  const { error: updateError } = await supabase
    .from('user_state')
    .update({
      xp: state.xp + xpAmount,
      total_tasks: state.total_tasks + 1,
      streak: newStreak,
      best_streak: newBestStreak,
    })
    .eq('id', state.id);

  if (updateError) {
    console.error('updateUserState: failed to update', updateError.message);
    return false;
  }

  return true;
}

export async function createActivity(input: CreateActivityInput): Promise<ActivityEntry | null> {
  const category = CATEGORIES[input.category];
  if (!category) {
    console.error('createActivity error: invalid category', input.category);
    return null;
  }

  const { data, error } = await supabase
    .from('user_activities')
    .insert({
      user_id: input.user_id,
      category: input.category,
      note: input.note ?? null,
      xp: category.xp,
    })
    .select('id, user_id, category, note, xp, created_at')
    .single();

  if (error) {
    console.error('createActivity insert error:', error.message);
    return null;
  }

  const updated = await addXP(input.user_id, category.xp);
  if (!updated) {
    console.error('createActivity addXP error: failed to update user XP');
    return null;
  }

  await updateUserState(input.user_id, category.xp);

  return data;
}

export async function getActivities(userId: string): Promise<ActivityEntry[]> {
  const { data, error } = await supabase
    .from('user_activities')
    .select('id, user_id, category, note, xp, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getActivities error:', error.message);
    return [];
  }

  return data ?? [];
}
