'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getActivities, createActivity } from '@/services/activity';
import type { ActivityEntry, CategoryId } from '@/types/activity';

export function useTarefasData() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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
        setActivities([]);
        setError('not_authenticated');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async (uid: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getActivities(uid);
      setActivities(data);
    } catch {
      setError('fetch_failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) fetchData(userId);
  }, [userId, fetchData]);

  const refresh = useCallback(() => {
    if (userId) fetchData(userId);
  }, [userId, fetchData]);

  const registerActivity = useCallback(async (category: CategoryId, note?: string): Promise<ActivityEntry | null> => {
    if (!userId) return null;
    const entry = await createActivity({ user_id: userId, category, note });
    if (entry) await fetchData(userId);
    return entry;
  }, [userId, fetchData]);

  return { activities, loading, error, refresh, registerActivity };
}
