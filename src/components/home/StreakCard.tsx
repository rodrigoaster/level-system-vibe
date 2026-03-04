'use client';

import { motion } from 'framer-motion';
import type { StreakInfo } from '@/types/home';

export default function StreakCard({ streak }: { streak: StreakInfo }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ scale: 1.02 }}
      className="flex-1 rounded-xl p-4 border border-white/5 bg-white/[0.02]"
    >
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-baseline gap-1.5">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-lg"
            >
              🔥
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl font-bold text-green-400 font-mono"
            >
              {streak.current}
            </motion.span>
            <span className="text-sm text-green-400 font-medium">dias</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            melhor: {streak.best} dias
          </p>
        </div>
      </div>
    </motion.div>
  );
}
