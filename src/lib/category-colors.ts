import type { CategoryId } from '@/types/activity';

export const CATEGORY_COLORS: Record<CategoryId, { bg: string; text: string }> = {
  fitness:    { bg: 'rgba(59,130,246,0.15)',  text: '#93c5fd' },
  nutrition:  { bg: 'rgba(16,185,129,0.15)',  text: '#6ee7b7' },
  delivery:   { bg: 'rgba(249,115,22,0.15)',  text: '#fdba74' },
  learning:   { bg: 'rgba(74,222,128,0.15)',  text: '#86efac' },
  spiritual:  { bg: 'rgba(167,139,250,0.15)', text: '#c4b5fd' },
  social:     { bg: 'rgba(250,204,21,0.15)',  text: '#fde047' },
  creativity: { bg: 'rgba(244,114,182,0.15)', text: '#f9a8d4' },
};
