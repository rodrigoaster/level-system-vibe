'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function CadastroPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    const { error: err } = await signUp(email, password, name);

    if (err) {
      setError(err);
      setLoading(false);
    } else {
      router.push('/');
    }
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white flex items-center justify-center px-4 py-10 sm:px-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8"
      >
        <motion.div variants={itemVariants} className="mb-8 text-center sm:mb-9">
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block text-4xl sm:text-5xl"
          >
            ⚡
          </motion.span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">PeakHabit</h1>
          <p className="mt-2 text-base text-gray-400 sm:text-lg">Crie sua conta</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <motion.div variants={itemVariants}>
            <label htmlFor="name" className="mb-2 block text-sm font-medium tracking-wide text-gray-300 sm:text-base">
              Nome
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-base text-white placeholder-gray-500 transition-all duration-300 focus:border-emerald-300/45 focus:bg-white/[0.08] focus:outline-none sm:text-lg"
              placeholder="Seu nome"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="email" className="mb-2 block text-sm font-medium tracking-wide text-gray-300 sm:text-base">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-base text-white placeholder-gray-500 transition-all duration-300 focus:border-emerald-300/45 focus:bg-white/[0.08] focus:outline-none sm:text-lg"
              placeholder="seu@email.com"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="password" className="mb-2 block text-sm font-medium tracking-wide text-gray-300 sm:text-base">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-base text-white placeholder-gray-500 transition-all duration-300 focus:border-emerald-300/45 focus:bg-white/[0.08] focus:outline-none sm:text-lg"
              placeholder="••••••"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium tracking-wide text-gray-300 sm:text-base">
              Confirmar senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-base text-white placeholder-gray-500 transition-all duration-300 focus:border-emerald-300/45 focus:bg-white/[0.08] focus:outline-none sm:text-lg"
              placeholder="••••••"
            />
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="rounded-lg border border-red-400/25 bg-red-500/10 py-2 text-center text-sm text-red-300 sm:text-base"
            >
              {error}
            </motion.p>
          )}

          <motion.div variants={itemVariants}>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-400/80 to-green-400/80 py-3 text-base font-semibold text-[#04210f] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </motion.button>
          </motion.div>
        </form>

        <motion.p
          variants={itemVariants}
          className="mt-7 text-center text-sm text-gray-400 sm:mt-8 sm:text-base"
        >
          Já tem conta?{' '}
          <a href="/login" className="font-medium text-emerald-300 transition-colors hover:text-emerald-200 hover:underline">
            Entrar
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
