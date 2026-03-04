'use client';

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

export default function Home() {
  const { data, loading, error } = useHomeData();

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      <NavBar />

      {loading && <HomeSkeleton />}

      {error === 'not_authenticated' && (
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-4xl mb-4">🔒</p>
            <h2 className="text-lg font-semibold text-gray-300 mb-2">Autenticação necessária</h2>
            <p className="text-sm text-gray-500">
              Faça login no Supabase para acessar seus dados.
            </p>
          </motion.div>
        </div>
      )}

      {error && error !== 'not_authenticated' && (
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-4xl mb-4">⚠️</p>
            <h2 className="text-lg font-semibold text-gray-300 mb-2">Erro ao carregar dados</h2>
            <p className="text-sm text-gray-500">
              Verifique sua conexão e tente novamente.
            </p>
          </motion.div>
        </div>
      )}

      {data && (
        <main className="max-w-4xl mx-auto px-6 py-6">
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="text-lg font-semibold mb-5"
          >
            Home
          </motion.h1>

          {/* Stat cards row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <RankCard rank={data.rank} />
            <StreakCard streak={data.streak} />
            <WeeklyXPCard progress={data.weeklyProgress} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <MonthlyChart data={data.monthlyXP} />
            <WeeklyChart data={data.weeklyXPByDay} />
          </div>

          {/* Weekly progress */}
          <div className="mb-4">
            <WeeklyProgressBar progress={data.weeklyProgress} />
          </div>

          {/* Recent activities */}
          <RecentActivities activities={data.recentActivities} />
        </main>
      )}
    </div>
  );
}
