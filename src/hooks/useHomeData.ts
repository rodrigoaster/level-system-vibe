'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getWeekStart, getMonthStart, fillWeeklyDays } from '@/lib/date-utils';
import {
  getUserState,
  getRecentActivities,
  getActivitiesInRange,
  getRank,
  computeWeeklyProgress,
  aggregateXPByDay,
} from '@/services/home';
import type { HomeData } from '@/types/home';

export function useHomeData() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get authenticated user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
      } else {
        setLoading(false);
        setError('not_authenticated');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
        setData(null);
        setError('not_authenticated');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async (uid: string) => {
    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const weekStart = getWeekStart(now);
      const monthStart = getMonthStart(now);
      const endOfToday = new Date(now);
      endOfToday.setHours(23, 59, 59, 999);

      const [userState, recentActivities, weeklyActivities, monthlyActivities] =
        await Promise.all([
          getUserState(uid),
          getRecentActivities(uid, 5),
          getActivitiesInRange(uid, weekStart.toISOString(), endOfToday.toISOString()),
          getActivitiesInRange(uid, monthStart.toISOString(), endOfToday.toISOString()),
        ]);

      if (!userState) {
        setError('no_user_state');
        setLoading(false);
        return;
      }

      const rank = getRank(userState.xp);
      const weeklyXPTotal = weeklyActivities.reduce((sum, a) => sum + a.xp, 0);
      const weeklyProgress = computeWeeklyProgress(weeklyXPTotal);
      const monthlyXP = aggregateXPByDay(monthlyActivities);
      const weeklyXPByDay = aggregateXPByDay(weeklyActivities);
      const filledWeekly = fillWeeklyDays(weekStart, weeklyXPByDay);

      setData({
        rank,
        streak: { current: userState.streak, best: userState.best_streak },
        weeklyProgress,
        monthlyXP,
        weeklyXPByDay: filledWeekly,
        recentActivities,
      });
    } catch (err) {
      console.error('useHomeData error:', err);
      setError('fetch_failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchData(userId);
    }
  }, [userId, fetchData]);

  const refresh = useCallback(() => {
    if (userId) fetchData(userId);
  }, [userId, fetchData]);

  return { data, loading, error, refresh };
}
