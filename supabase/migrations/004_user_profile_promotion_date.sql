-- 004_user_profile_promotion_date.sql
-- Add last_promotion_at column to user_profiles

ALTER TABLE user_profiles ADD COLUMN last_promotion_at TIMESTAMPTZ;
