'use client';

import { motion } from 'framer-motion';
import type { RankInfo } from '@/types/home';

export default function RankCard({ rank }: { rank: RankInfo }) {
  const progress = rank.xpForNextLevel > rank.xpForCurrentLevel
    ? ((rank.currentXP - rank.xpForCurrentLevel) / (rank.xpForNextLevel - rank.xpForCurrentLevel)) * 100
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="flex-1 rounded-xl p-4 border"
      style={{
        backgroundColor: `${rank.colors.accent}08`,
        borderColor: `${rank.colors.accent}20`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <motion.h3
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-xl font-bold tracking-wider"
            style={{ color: rank.colors.accent }}
          >
            {rank.tierLabel}
          </motion.h3>
          <p className="text-xs text-gray-400 mt-0.5">
            🛡️ Nível {rank.level}
          </p>
        </div>
        <motion.div
          animate={{
            boxShadow: [
              `0 0 8px ${rank.colors.glow}`,
              `0 0 20px ${rank.colors.glow}`,
              `0 0 8px ${rank.colors.glow}`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
          style={{ backgroundColor: `${rank.colors.accent}15` }}
        >
          🏅
        </motion.div>
      </div>

      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            backgroundColor: rank.colors.accent,
            boxShadow: `0 0 8px ${rank.colors.glow}`,
          }}
        />
      </div>
      <p className="text-[10px] text-gray-500 mt-1.5 font-mono">
        {rank.currentXP - rank.xpForCurrentLevel} / {rank.xpForNextLevel - rank.xpForCurrentLevel} XP
      </p>
    </motion.div>
  );
}
