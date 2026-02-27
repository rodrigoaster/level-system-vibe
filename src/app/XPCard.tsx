'use client';

import { useState, useTransition } from 'react';
import { addXP, UserProfile } from '@/services/xp';

const XP_PER_LEVEL = 100;

export default function XPCard({ initialProfile }: { initialProfile: UserProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [isPending, startTransition] = useTransition();

  const xpIntoLevel = profile.xp % XP_PER_LEVEL;
  const progress = (xpIntoLevel / XP_PER_LEVEL) * 100;

  function handleAwardXP() {
    startTransition(async () => {
      const updated = await addXP(profile.id, 10);
      if (updated) setProfile(updated);
    });
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-96 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <span className="text-gray-300 text-lg font-semibold">{profile.username}</span>
        <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full">
          Level {profile.level}
        </span>
      </div>

      <div className="mb-2 flex justify-between text-xs text-gray-400">
        <span>XP</span>
        <span>
          {xpIntoLevel} / {XP_PER_LEVEL}
        </span>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-gray-500 text-xs mb-6 text-center">
        Total XP: {profile.xp} &mdash; Next level at {profile.level * XP_PER_LEVEL} XP
      </p>

      <button
        onClick={handleAwardXP}
        disabled={isPending}
        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
      >
        {isPending ? 'Awarding…' : 'Award +10 XP'}
      </button>
    </div>
  );
}
