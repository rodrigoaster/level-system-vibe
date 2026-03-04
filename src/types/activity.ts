export type CategoryId =
  | 'fitness'
  | 'nutrition'
  | 'delivery'
  | 'learning'
  | 'spiritual'
  | 'social'
  | 'creativity';

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  xp: number;
}

export const CATEGORIES: Record<CategoryId, Category> = {
  fitness:    { id: 'fitness',    label: 'Fitness',    icon: '💪', xp: 30 },
  nutrition:  { id: 'nutrition',  label: 'Nutrition',  icon: '🥗', xp: 25 },
  delivery:   { id: 'delivery',   label: 'Delivery',   icon: '📦', xp: 40 },
  learning:   { id: 'learning',   label: 'Learning',   icon: '📚', xp: 25 },
  spiritual:  { id: 'spiritual',  label: 'Spiritual',  icon: '🧘', xp: 20 },
  social:     { id: 'social',     label: 'Social',     icon: '🤝', xp: 30 },
  creativity: { id: 'creativity', label: 'Creativity', icon: '🎨', xp: 35 },
};

export interface ActivityEntry {
  id: string;
  user_id: string;
  category: CategoryId;
  note: string | null;
  xp: number;
  created_at: string;
}

export interface CreateActivityInput {
  user_id: string;
  category: CategoryId;
  note?: string;
}
