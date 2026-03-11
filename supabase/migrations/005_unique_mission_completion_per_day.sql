-- Prevent duplicate mission completions on the same day
CREATE UNIQUE INDEX uq_mission_user_day
  ON user_mission_completions (mission_id, user_id, completed_at);
