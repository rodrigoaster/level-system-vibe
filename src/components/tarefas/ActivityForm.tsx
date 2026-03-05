'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CATEGORIES, type CategoryId } from '@/types/activity';

const categoryEntries = Object.values(CATEGORIES);

interface ActivityFormProps {
  onRegister: (category: CategoryId, note?: string) => void;
  isSubmitting: boolean;
}

export default function ActivityForm({ onRegister, isSubmitting }: ActivityFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('fitness');
  const [note, setNote] = useState('');

  const currentXP = CATEGORIES[selectedCategory].xp;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onRegister(selectedCategory, note.trim() || undefined);
    setNote('');
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-sm sm:p-6"
    >
      <div className="mb-4 flex flex-col gap-3">
        <label className="text-xs text-gray-400">Categoria</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as CategoryId)}
          className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm text-white outline-none focus:border-white/20 sm:text-base"
        >
          {categoryEntries.map((cat) => (
            <option key={cat.id} value={cat.id} className="bg-[#0d1117]">
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 flex flex-col gap-3">
        <label className="text-xs text-gray-400">Nota (opcional)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Treino de peito"
          className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-white/20 sm:text-base"
        />
      </div>

      <div className="flex justify-end">
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50 sm:text-base"
        >
          {isSubmitting ? 'Registrando...' : `Registrar +${currentXP} XP`}
        </motion.button>
      </div>
    </motion.form>
  );
}
