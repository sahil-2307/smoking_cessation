-- SIMPLIFIED DATABASE SETUP - NO RLS POLICIES
-- This removes all Row Level Security to get the app working first
-- Run this in Supabase SQL Editor

-- ========================================
-- STEP 1: Enable UUID extension
-- ========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- STEP 2: Drop existing tables and functions (clean slate)
-- ========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Drop tables if they exist
DROP TABLE IF EXISTS buddy_messages CASCADE;
DROP TABLE IF EXISTS buddy_connections CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS cravings CASCADE;
DROP TABLE IF EXISTS quit_progress CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop views if they exist
DROP VIEW IF EXISTS user_stats CASCADE;
DROP VIEW IF EXISTS community_posts_with_profiles CASCADE;
DROP VIEW IF EXISTS post_comments_with_profiles CASCADE;

-- ========================================
-- STEP 3: Create tables WITHOUT RLS
-- ========================================

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  quit_date TIMESTAMP WITH TIME ZONE,
  cigarettes_per_day INTEGER,
  years_smoking INTEGER,
  cost_per_pack DECIMAL(10,2),
  cigarettes_per_pack INTEGER DEFAULT 20,
  quit_method TEXT CHECK (quit_method IN ('cold_turkey', 'gradual', 'nrt', 'prescription')),
  reasons_for_quitting TEXT[],
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quit_progress table
CREATE TABLE quit_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  is_smoke_free BOOLEAN DEFAULT TRUE,
  cigarettes_smoked INTEGER DEFAULT 0,
  notes TEXT,
  mood TEXT CHECK (mood IN ('excellent', 'good', 'okay', 'difficult', 'terrible')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create cravings table
CREATE TABLE cravings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10) NOT NULL,
  trigger TEXT CHECK (trigger IN ('stress', 'social', 'routine', 'boredom', 'alcohol', 'other')),
  coping_strategy TEXT,
  resisted BOOLEAN NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  achievement_type TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- Create journal_entries table
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[],
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_posts table
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  topic TEXT CHECK (topic IN ('general', 'first_day', 'milestone', 'struggle', 'success')),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE user_settings (
  user_id UUID REFERENCES auth.users PRIMARY KEY,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'hi')),
  currency TEXT DEFAULT 'INR' CHECK (currency IN ('INR', 'USD')),
  notifications JSONB DEFAULT '{
    "daily_reminders": true,
    "milestone_alerts": true,
    "craving_support": true,
    "community_updates": true,
    "buddy_messages": true
  }'::jsonb,
  privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'friends', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 4: Create indexes for performance
-- ========================================
CREATE INDEX idx_quit_progress_user_date ON quit_progress(user_id, date DESC);
CREATE INDEX idx_cravings_user_created ON cravings(user_id, created_at DESC);
CREATE INDEX idx_cravings_trigger ON cravings(trigger);
CREATE INDEX idx_journal_entries_user_created ON journal_entries(user_id, created_at DESC);
CREATE INDEX idx_community_posts_created ON community_posts(created_at DESC);

-- ========================================
-- STEP 5: Create trigger functions
-- ========================================

-- Function to create user profile and settings on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Function to update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- STEP 6: Create triggers
-- ========================================

-- Trigger to handle new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ========================================
-- STEP 7: Grant permissions (no RLS needed)
-- ========================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ========================================
-- STEP 8: Create simple views (no RLS)
-- ========================================

-- Create a simple user stats view
CREATE OR REPLACE VIEW user_stats AS
SELECT
  p.id,
  p.quit_date,
  p.cigarettes_per_day,
  p.cost_per_pack,
  p.cigarettes_per_pack,
  CASE
    WHEN p.quit_date IS NULL THEN 0
    ELSE EXTRACT(DAY FROM NOW() - p.quit_date)::INTEGER
  END as days_smoke_free,
  COALESCE(c.total_cravings, 0) as total_cravings,
  COALESCE(c.resisted_cravings, 0) as resisted_cravings,
  COALESCE(a.achievement_count, 0) as achievement_count
FROM profiles p
LEFT JOIN (
  SELECT
    user_id,
    COUNT(*) as total_cravings,
    COUNT(*) FILTER (WHERE resisted = true) as resisted_cravings
  FROM cravings
  GROUP BY user_id
) c ON p.id = c.user_id
LEFT JOIN (
  SELECT
    user_id,
    COUNT(*) as achievement_count
  FROM achievements
  GROUP BY user_id
) a ON p.id = a.user_id;

-- Grant permissions on views
GRANT SELECT ON user_stats TO authenticated;

-- ========================================
-- FINAL: Verify setup
-- ========================================
SELECT 'Setup completed! Tables created:' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'user_settings', 'cravings', 'quit_progress') ORDER BY table_name;