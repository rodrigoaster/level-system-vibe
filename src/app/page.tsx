'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import NavBar from '@/components/nav/NavBar';
import RankCard from '@/components/home/RankCard';
import StreakCard from '@/components/home/StreakCard';
import WeeklyXPCard from '@/components/home/WeeklyXPCard';
import MonthlyChart from '@/components/home/MonthlyChart';
import WeeklyChart from '@/components/home/WeeklyChart';
import WeeklyProgressBar from '@/components/home/WeeklyProgressBar';
import RecentActivities from '@/components/home/RecentActivities';
import HomeSkeleton from '@/components/home/HomeSkeleton';
import { useHomeData } from '@/hooks/useHomeData';
import { useAuth } from '@/providers/AuthProvider';

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error } = useHomeData();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading || (!user && !error)) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white">
        <NavBar />
        <HomeSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      <NavBar />

      {loading && <HomeSkeleton />}

      {error && error !== 'not_authenticated' && (
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm"
          >
            <motion.p
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-4 text-4xl sm:text-5xl"
            >
              ⚠️
            </motion.p>
            <h2 className="mb-2 text-2xl font-semibold text-gray-200 sm:text-3xl">Erro ao carregar dados</h2>
            <p className="text-base text-gray-400 sm:text-lg">
              Verifique sua conexão e tente novamente.
            </p>
          </motion.div>
        </div>
      )}

      {data && (
        <main className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <motion.h1
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-6 text-2xl font-semibold tracking-tight sm:mb-7 sm:text-3xl"
          >
            Home
          </motion.h1>

          {/* Stat cards row */}
          <div className="mb-5 grid grid-cols-1 gap-4 md:mb-6 md:grid-cols-3 md:gap-5">
            <RankCard rank={data.rank} />
            <StreakCard streak={data.streak} />
            <WeeklyXPCard progress={data.weeklyProgress} />
          </div>

          {/* Charts — stacked vertically */}
          <div className="mb-5 flex flex-col gap-4 lg:mb-6 lg:gap-5">
            <MonthlyChart data={data.monthlyXP} />
            <WeeklyChart data={data.weeklyXPByDay} />
          </div>

          {/* Weekly progress */}
          <div className="mb-6">
            <WeeklyProgressBar progress={data.weeklyProgress} />
          </div>

          {/* Recent activities */}
          <RecentActivities activities={data.recentActivities} />
        </main>
      )}
    </div>
  );
}
