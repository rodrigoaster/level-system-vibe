'use client';

import { motion } from 'framer-motion';
import type { Category, CategoryId } from '@/types/activity';
import { CATEGORY_COLORS } from '@/lib/category-colors';

interface CategoryCardProps {
  category: Category;
  onRegister: (category: CategoryId) => void;
  isSubmitting: boolean;
}

export default function CategoryCard({ category, onRegister, isSubmitting }: CategoryCardProps) {
  const colors = CATEGORY_COLORS[category.id];

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col items-center gap-2 rounded-xl border p-4 backdrop-blur-sm transition-colors"
      style={{
        borderColor: colors.text + '30',
        background: `linear-gradient(to bottom, ${colors.bg}, transparent)`,
      }}
    >
      <span className="text-2xl">{category.icon}</span>
      <span className="text-sm font-medium text-gray-100">{category.label}</span>
      <span className="text-xs font-mono" style={{ color: colors.text }}>+{category.xp} XP</span>
      <motion.button
        onClick={() => onRegister(category.id)}
        disabled={isSubmitting}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-gray-200 transition-colors hover:bg-white/10 disabled:opacity-50"
      >
        Registrar
      </motion.button>
    </motion.div>
  );
}
