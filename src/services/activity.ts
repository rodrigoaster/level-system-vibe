import { supabase } from '@/lib/supabase';
import { addXP } from './xp';
import { CATEGORIES, type ActivityEntry, type CreateActivityInput } from '@/types/activity';

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
