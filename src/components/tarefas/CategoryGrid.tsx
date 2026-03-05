'use client';

import { motion } from 'framer-motion';
import { CATEGORIES, type CategoryId } from '@/types/activity';
import CategoryCard from './CategoryCard';

interface CategoryGridProps {
  onRegister: (category: CategoryId) => void;
  isSubmitting: boolean;
}

export default function CategoryGrid({ onRegister, isSubmitting }: CategoryGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h3 className="mb-3 text-base font-medium text-gray-200 sm:text-lg">Categorias</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Object.values(CATEGORIES).map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            onRegister={onRegister}
            isSubmitting={isSubmitting}
          />
        ))}
      </div>
    </motion.div>
  );
}
