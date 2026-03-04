-- 002_user_tables.sql
-- User tables with RLS, trigger, and indexes

-- =============================================================================
-- user_state: scalar state per user (XP, streak, counters)
-- =============================================================================
CREATE TABLE user_state (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  xp                    INTEGER     NOT NULL DEFAULT 0,
  streak                INTEGER     NOT NULL DEFAULT 0,
  best_streak           INTEGER     NOT NULL DEFAULT 0,
  total_tasks           INTEGER     NOT NULL DEFAULT 0,
  unlocked_achievements TEXT[]      NOT NULL DEFAULT '{}',
  current_week_start    DATE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own state"
  ON user_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own state"
  ON user_state FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- user_profiles: profile info + denormalized xp/level for quick reads
-- =============================================================================
CREATE TABLE user_profiles (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username         TEXT,
  name             TEXT,
  job_title        TEXT,
  current_position TEXT,
  bio              TEXT,
  picture_url      TEXT,
  xp               INTEGER     NOT NULL DEFAULT 0,
  level            INTEGER     NOT NULL DEFAULT 1,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own profile"
  ON user_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- user_activities: activity log
-- =============================================================================
CREATE TABLE user_activities (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category   TEXT        NOT NULL,
  note       TEXT,
  xp         INTEGER     NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own activities"
  ON user_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own activities"
  ON user_activities FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- user_missions: weekly missions
-- =============================================================================
CREATE TABLE user_missions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  icon        TEXT        NOT NULL,
  category    TEXT        NOT NULL,
  day_of_week SMALLINT,
  is_fixed    BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own missions"
  ON user_missions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own missions"
  ON user_missions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- user_mission_completions: mission completion records
-- =============================================================================
CREATE TABLE user_mission_completions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id   UUID NOT NULL REFERENCES user_missions(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id  UUID NOT NULL REFERENCES user_activities(id) ON DELETE CASCADE,
  completed_at DATE NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE user_mission_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own completions"
  ON user_mission_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own completions"
  ON user_mission_completions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- user_weekly_data: weekly summaries
-- =============================================================================
CREATE TABLE user_weekly_data (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number         INTEGER     NOT NULL,
  week_start          DATE        NOT NULL,
  week_end            DATE        NOT NULL,
  xp_earned           INTEGER     NOT NULL DEFAULT 0,
  bonus_xp            INTEGER     NOT NULL DEFAULT 0,
  category_breakdown  JSONB       NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_number)
);

ALTER TABLE user_weekly_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own weekly data"
  ON user_weekly_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own weekly data"
  ON user_weekly_data FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- user_skill_snapshots: weekly skill snapshots per category
-- =============================================================================
CREATE TABLE user_skill_snapshots (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category        TEXT        NOT NULL,
  week_number     INTEGER     NOT NULL,
  completion_rate REAL        NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, category, week_number)
);

ALTER TABLE user_skill_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own snapshots"
  ON user_skill_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own snapshots"
  ON user_skill_snapshots FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- Trigger: auto-create user_state and user_profiles on signup
-- =============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_state (user_id)
  VALUES (NEW.id);

  INSERT INTO user_profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'name', ''));

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- Indexes for common query patterns
-- =============================================================================
CREATE INDEX idx_user_activities_user_date
  ON user_activities (user_id, created_at DESC);

CREATE INDEX idx_user_missions_user
  ON user_missions (user_id);

CREATE INDEX idx_user_mission_completions_user_date
  ON user_mission_completions (user_id, completed_at);

CREATE INDEX idx_user_weekly_data_user_week
  ON user_weekly_data (user_id, week_number);

CREATE INDEX idx_user_skill_snapshots_user_cat_week
  ON user_skill_snapshots (user_id, category, week_number);
