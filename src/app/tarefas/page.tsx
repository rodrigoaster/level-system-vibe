'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import NavBar from '@/components/nav/NavBar';
import ActivityForm from '@/components/tarefas/ActivityForm';
import CategoryGrid from '@/components/tarefas/CategoryGrid';
import ActivityHistory from '@/components/tarefas/ActivityHistory';
import TarefasSkeleton from '@/components/tarefas/TarefasSkeleton';
import { useTarefasData } from '@/hooks/useTarefasData';
import { useAuth } from '@/providers/AuthProvider';
import type { CategoryId } from '@/types/activity';

export default function TarefasPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { activities, loading, error, registerActivity } = useTarefasData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  async function handleRegister(category: CategoryId, note?: string) {
    setIsSubmitting(true);
    try {
      await registerActivity(category, note);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading || (!user && !error)) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white">
        <NavBar activeTab="tarefas" />
        <TarefasSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      <NavBar activeTab="tarefas" />

      {loading && <TarefasSkeleton />}

      {error && error !== 'not_authenticated' && (
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm"
          >
            <p className="mb-4 text-4xl">⚠️</p>
            <h2 className="mb-2 text-2xl font-semibold text-gray-200">Erro ao carregar dados</h2>
            <p className="text-base text-gray-400">Verifique sua conexao e tente novamente.</p>
          </motion.div>
        </div>
      )}

      {!loading && !error && (
        <main className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <motion.h1
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-6 text-2xl font-semibold tracking-tight sm:mb-7 sm:text-3xl"
          >
            Registrar atividade
          </motion.h1>

          <div className="mb-5">
            <ActivityForm onRegister={handleRegister} isSubmitting={isSubmitting} />
          </div>

          <div className="mb-5">
            <CategoryGrid onRegister={(cat) => handleRegister(cat)} isSubmitting={isSubmitting} />
          </div>

          <ActivityHistory activities={activities} />
        </main>
      )}
    </div>
  );
}
