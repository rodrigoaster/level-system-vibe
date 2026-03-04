-- 001_config_tables.sql
-- Configuration tables with seed data (public, read-only)

-- =============================================================================
-- config_ranks: 15 levels across 5 tiers
-- =============================================================================
CREATE TABLE config_ranks (
  level    SMALLINT PRIMARY KEY,
  xp_required INTEGER NOT NULL,
  tier     TEXT     NOT NULL
);

INSERT INTO config_ranks (level, xp_required, tier) VALUES
  ( 1,     0, 'bronze'),
  ( 2,    50, 'bronze'),
  ( 3,   200, 'bronze'),
  ( 4,   450, 'bronze'),
  ( 5,   800, 'silver'),
  ( 6,  1250, 'silver'),
  ( 7,  1800, 'silver'),
  ( 8,  2450, 'silver'),
  ( 9,  3200, 'gold'),
  (10,  4050, 'gold'),
  (11,  5000, 'gold'),
  (12,  6050, 'gold'),
  (13,  7200, 'diamond'),
  (14,  8450, 'diamond'),
  (15,  9800, 'diamond');

-- =============================================================================
-- config_categories: 7 activity categories
-- =============================================================================
CREATE TABLE config_categories (
  id    TEXT     PRIMARY KEY,
  label TEXT     NOT NULL,
  icon  TEXT     NOT NULL,
  xp    SMALLINT NOT NULL
);

INSERT INTO config_categories (id, label, icon, xp) VALUES
  ('fitness',    'Fitness',    '💪', 30),
  ('nutrition',  'Nutrition',  '🥗', 25),
  ('delivery',   'Delivery',   '📦', 40),
  ('learning',   'Learning',   '📚', 25),
  ('spiritual',  'Spiritual',  '🧘', 20),
  ('social',     'Social',     '🤝', 30),
  ('creativity', 'Creativity', '🎨', 35);

-- =============================================================================
-- config_achievements: 9 achievements
-- =============================================================================
CREATE TABLE config_achievements (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  description     TEXT        NOT NULL,
  icon            TEXT        NOT NULL,
  condition_type  TEXT        NOT NULL,
  condition_value INTEGER     NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO config_achievements (name, description, icon, condition_type, condition_value) VALUES
  ('Primeiro Passo',     'Complete sua primeira atividade',            '🎯', 'threshold',         1),
  ('Dedicado',           'Complete 10 atividades',                     '⭐', 'threshold',        10),
  ('Consistente',        'Complete 50 atividades',                     '🏅', 'threshold',        50),
  ('Centurião',          'Complete 100 atividades',                    '🏆', 'threshold',       100),
  ('Semana de Fogo',     'Mantenha um streak de 7 dias',              '🔥', 'streak',            7),
  ('Mês Inabalável',     'Mantenha um streak de 30 dias',             '💎', 'streak',           30),
  ('Subindo de Nível',   'Alcance o nível 5',                         '📈', 'level',             5),
  ('Polivalente',        'Use 5 categorias diferentes',               '🌈', 'category_count',    5),
  ('Semana Épica',       'Ganhe 200+ XP em uma semana',               '⚡', 'weekly_threshold', 200);

-- =============================================================================
-- config_tier_colors: visual scheme per tier
-- =============================================================================
CREATE TABLE config_tier_colors (
  tier   TEXT PRIMARY KEY,
  accent TEXT NOT NULL,
  glow   TEXT NOT NULL,
  badge  TEXT NOT NULL,
  ring   TEXT NOT NULL
);

INSERT INTO config_tier_colors (tier, accent, glow, badge, ring) VALUES
  ('bronze',  '#8899b0', '#8899b033', '#8899b0', '#8899b066'),
  ('silver',  '#4d8ef7', '#4d8ef733', '#4d8ef7', '#4d8ef766'),
  ('gold',    '#9b6ff8', '#9b6ff833', '#9b6ff8', '#9b6ff866'),
  ('diamond', '#f7b740', '#f7b74033', '#f7b740', '#f7b74066'),
  ('master',  '#f05555', '#f0555533', '#f05555', '#f0555566');

-- =============================================================================
-- config_weekly_bonuses: XP bonus thresholds
-- =============================================================================
CREATE TABLE config_weekly_bonuses (
  id        SERIAL  PRIMARY KEY,
  threshold INTEGER NOT NULL,
  bonus     INTEGER NOT NULL
);

INSERT INTO config_weekly_bonuses (threshold, bonus) VALUES
  ( 50, 10),
  (100, 25),
  (200, 50);

-- =============================================================================
-- Security: config tables are read-only for all authenticated/anon users
-- =============================================================================
GRANT SELECT ON config_ranks          TO anon, authenticated;
GRANT SELECT ON config_categories     TO anon, authenticated;
GRANT SELECT ON config_achievements   TO anon, authenticated;
GRANT SELECT ON config_tier_colors    TO anon, authenticated;
GRANT SELECT ON config_weekly_bonuses TO anon, authenticated;

REVOKE INSERT, UPDATE, DELETE ON config_ranks          FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON config_categories     FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON config_achievements   FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON config_tier_colors    FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON config_weekly_bonuses FROM anon, authenticated;
