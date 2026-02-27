'use server';

import { supabase } from '@/lib/supabase';
import XPCard from './XPCard';

async function getDemoProfile() {
  const { data } = await supabase
    .from('user_profiles')
    .select('id, username, xp, level')
    .eq('username', 'demo')
    .single();
  return data ?? null;
}

export default async function Home() {
  const profile = await getDemoProfile();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950">
      {profile ? (
        <XPCard initialProfile={profile} />
      ) : (
        <div className="text-gray-400 text-sm">
          No demo user found. Run the SQL schema in your Supabase dashboard and add credentials to{' '}
          <code className="text-gray-200">.env.local</code>.
        </div>
      )}
    </main>
  );
}
