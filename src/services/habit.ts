import { supabase } from '@/lib/supabase';
import { createActivity } from './activity';
import type { Mission, MissionCompletion, MonthlyHabitStats } from '@/types/habit';
import type { CategoryId } from '@/types/activity';

export async function getMissions(userId: string): Promise<Mission[]> {
  const { data, error } = await supabase
    .from('user_missions')
    .select('id, user_id, name, icon, category, day_of_week, is_fixed, created_at')
    .eq('user_id', userId)
    .eq('is_fixed', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getMissions error:', error.message);
    return [];
  }

  return data ?? [];
}

export async function getCompletions(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<MissionCompletion[]> {
  const { data, error } = await supabase
    .from('user_mission_completions')
    .select('id, mission_id, user_id, activity_id, completed_at')
    .eq('user_id', userId)
    .gte('completed_at', startDate)
    .lte('completed_at', endDate)
    .order('completed_at', { ascending: true });

  if (error) {
    console.error('getCompletions error:', error.message);
    return [];
  }

  return data ?? [];
}

export function getDaysInMonth(year: number, month: number): string[] {
  const days: string[] = [];
  const daysCount = new Date(year, month, 0).getDate();

  for (let d = 1; d <= daysCount; d++) {
    const date = new Date(year, month - 1, d);
    days.push(date.toISOString().split('T')[0]);
  }

  return days;
}

function getDayOfWeek(dateStr: string): number {
  const date = new Date(dateStr + 'T00:00:00');
  // Convert JS day (0=Sun) to spec day (0=Mon)
  return (date.getDay() + 6) % 7;
}

function getMissionsForDay(missions: Mission[], dateStr: string): Mission[] {
  const dow = getDayOfWeek(dateStr);
  return missions.filter(
    (m) => m.day_of_week === null || m.day_of_week === dow,
  );
}

export function computeMonthlyStats(
  missions: Mission[],
  completions: MissionCompletion[],
  days: string[],
): MonthlyHabitStats {
  if (missions.length === 0 || days.length === 0) {
    return {
      dailyRates: days.map(() => 0),
      monthlyRate: 0,
    };
  }

  const completionSet = new Set(
    completions.map((c) => `${c.mission_id}:${c.completed_at}`),
  );

  let totalExpected = 0;
  let totalCompleted = 0;

  const dailyRates = days.map((day) => {
    const dayMissions = getMissionsForDay(missions, day);
    if (dayMissions.length === 0) return 0;

    const completed = dayMissions.filter((m) =>
      completionSet.has(`${m.id}:${day}`),
    ).length;

    totalExpected += dayMissions.length;
    totalCompleted += completed;

    return completed / dayMissions.length;
  });

  const monthlyRate = totalExpected > 0 ? totalCompleted / totalExpected : 0;

  return { dailyRates, monthlyRate };
}

export async function createMission(
  userId: string,
  name: string,
  icon: string,
  category: CategoryId,
  dayOfWeek: number | null,
  isFixed: boolean,
): Promise<Mission | null> {
  const { data, error } = await supabase
    .from('user_missions')
    .insert({
      user_id: userId,
      name,
      icon,
      category,
      day_of_week: dayOfWeek,
      is_fixed: isFixed,
    })
    .select('id, user_id, name, icon, category, day_of_week, is_fixed, created_at')
    .single();

  if (error) {
    console.error('createMission error:', error.message);
    return null;
  }

  return data;
}

export async function deleteMission(missionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_missions')
    .delete()
    .eq('id', missionId);

  if (error) {
    console.error('deleteMission error:', error.message);
    return false;
  }

  return true;
}

export async function completeMission(
  mission: Mission,
  userId: string,
): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];

  // Check if this mission was already completed today
  const { data: existing } = await supabase
    .from('user_mission_completions')
    .select('id')
    .eq('mission_id', mission.id)
    .eq('user_id', userId)
    .eq('completed_at', today)
    .limit(1);

  if (existing && existing.length > 0) {
    return true; // Already completed today
  }

  const entry = await createActivity({
    user_id: userId,
    category: mission.category,
    note: mission.name,
  });

  if (!entry) return false;

  const { error } = await supabase
    .from('user_mission_completions')
    .insert({
      mission_id: mission.id,
      user_id: userId,
      activity_id: entry.id,
      completed_at: today,
    });

  if (error) {
    console.error('completeMission error:', error.message);
    return false;
  }

  return true;
}

export { getDayOfWeek, getMissionsForDay };
