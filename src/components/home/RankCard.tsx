'use client';

import { motion } from 'framer-motion';
import type { RankInfo } from '@/types/home';

export default function RankCard({ rank }: { rank: RankInfo }) {
  const progress = rank.xpForNextLevel > rank.xpForCurrentLevel
    ? ((rank.currentXP - rank.xpForCurrentLevel) / (rank.xpForNextLevel - rank.xpForCurrentLevel)) * 100
    : 100;

  const pct = Math.round(progress);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-default rounded-2xl border p-5 backdrop-blur-sm sm:p-6"
      style={{
        backgroundColor: `${rank.colors.accent}08`,
        borderColor: `${rank.colors.accent}20`,
      }}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <motion.h3
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-2xl font-bold tracking-wide sm:text-3xl"
            style={{ color: rank.colors.accent }}
          >
            {rank.tierLabel}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-1 text-sm text-gray-300 sm:text-base"
          >
            🛡️ Nível {rank.level}
          </motion.p>
        </div>

        <motion.div
          animate={{
            boxShadow: [
              `0 0 10px ${rank.colors.glow}`,
              `0 0 25px ${rank.colors.glow}`,
              `0 0 10px ${rank.colors.glow}`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-xl sm:h-12 sm:w-12 sm:text-2xl"
          style={{ backgroundColor: `${rank.colors.accent}15` }}
        >
          🏅
        </motion.div>
      </div>

      {/* Progress bar + percentage */}
      <div className="flex items-center gap-2">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              backgroundColor: rank.colors.accent,
              boxShadow: `0 0 12px ${rank.colors.glow}`,
            }}
          />
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="w-10 text-right text-xs font-mono sm:text-sm"
          style={{ color: rank.colors.accent }}
        >
          {pct}%
        </motion.span>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="mt-1.5 text-xs font-mono text-gray-500 sm:text-sm"
      >
        {rank.currentXP - rank.xpForCurrentLevel} / {rank.xpForNextLevel - rank.xpForCurrentLevel} XP
      </motion.p>
    </motion.div>
  );
}
