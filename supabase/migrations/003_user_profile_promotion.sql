-- 003_user_profile_promotion.sql
-- Add previous_position column to user_profiles

ALTER TABLE user_profiles ADD COLUMN previous_position TEXT;
