'use client';

import { motion } from 'framer-motion';
import type { StreakInfo } from '@/types/home';

export default function StreakCard({ streak }: { streak: StreakInfo }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-default rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-sm sm:p-6"
    >
      <div className="mb-2 flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <motion.span
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-2xl sm:text-3xl"
            >
              🔥
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, type: 'spring', stiffness: 200 }}
              className="font-mono text-2xl font-bold text-green-300 sm:text-3xl"
            >
              {streak.current}
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg font-medium text-green-300 sm:text-xl"
            >
              dias
            </motion.span>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-2 text-sm text-gray-300 sm:text-base"
          >
            melhor: {streak.best} dias
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
