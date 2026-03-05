'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';

const tabs = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'tarefas', label: 'Tarefas', icon: '📋' },
  { id: 'habitos', label: 'Hábitos', icon: '🔁' },
];

export default function NavBar({ activeTab = 'home' }: { activeTab?: string }) {
  const { user, signOut } = useAuth();

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-30 border-b border-white/10 bg-[#080c14]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <motion.div
          className="flex items-center gap-2.5 sm:gap-3"
          whileHover={{ scale: 1.04 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <span className="text-2xl sm:text-3xl">⚡</span>
          <span className="text-lg font-semibold tracking-wide text-white sm:text-2xl">PeakHabit</span>
        </motion.div>

        <nav className="flex items-center gap-1 rounded-xl bg-white/[0.04] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`relative rounded-lg px-2.5 py-2 text-sm font-medium transition-colors sm:px-4 sm:text-base ${
                tab.id === activeTab
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.id === activeTab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-lg border border-white/10 bg-white/10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 whitespace-nowrap">{tab.icon} {tab.label}</span>
            </button>
          ))}
        </nav>

        {user ? (
          <motion.button
            onClick={signOut}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg border border-white/10 p-2 text-gray-400 transition-colors hover:border-red-400/30 hover:text-red-300"
            title="Sair"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.08, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="rounded-lg border border-white/10 p-2 text-gray-400 transition-colors hover:text-gray-200"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </motion.button>
        )}
      </div>
    </motion.header>
  );
}
