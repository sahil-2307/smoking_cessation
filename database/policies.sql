-- RLS Policies for smoking cessation app

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Quit progress policies
CREATE POLICY "Users can view their own progress" ON quit_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON quit_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON quit_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own progress" ON quit_progress FOR DELETE USING (auth.uid() = user_id);

-- Cravings policies
CREATE POLICY "Users can view their own cravings" ON cravings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cravings" ON cravings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cravings" ON cravings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cravings" ON cravings FOR DELETE USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view their own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Journal entries policies
CREATE POLICY "Users can view their own journal entries" ON journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journal entries" ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries" ON journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal entries" ON journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Community posts policies
CREATE POLICY "Anyone can view community posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON community_posts FOR DELETE USING (auth.uid() = user_id);

-- Post comments policies
CREATE POLICY "Anyone can view comments" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON post_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON post_comments FOR DELETE USING (auth.uid() = user_id);

-- Post likes policies
CREATE POLICY "Anyone can view likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like posts" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike their own likes" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Buddy connections policies
CREATE POLICY "Users can view their own connections" ON buddy_connections
FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create connection requests" ON buddy_connections
FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update connections they're involved in" ON buddy_connections
FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can delete their own connection requests" ON buddy_connections
FOR DELETE USING (auth.uid() = requester_id);

-- Buddy messages policies
CREATE POLICY "Users can view messages in their connections" ON buddy_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM buddy_connections
    WHERE id = connection_id
    AND (requester_id = auth.uid() OR addressee_id = auth.uid())
    AND status = 'accepted'
  )
);

CREATE POLICY "Users can send messages in their accepted connections" ON buddy_messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM buddy_connections
    WHERE id = connection_id
    AND (requester_id = auth.uid() OR addressee_id = auth.uid())
    AND status = 'accepted'
  )
);

CREATE POLICY "Users can update their own messages" ON buddy_messages
FOR UPDATE USING (auth.uid() = sender_id);

-- User settings policies
CREATE POLICY "Users can view their own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create views for easier data access
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
  COALESCE(qp.current_streak, 0) as current_streak,
  COALESCE(c.total_cravings, 0) as total_cravings,
  COALESCE(c.resisted_cravings, 0) as resisted_cravings,
  COALESCE(a.achievement_count, 0) as achievement_count
FROM profiles p
LEFT JOIN (
  SELECT
    user_id,
    COUNT(*) as current_streak
  FROM quit_progress
  WHERE is_smoke_free = true
    AND date >= (
      SELECT MAX(date)
      FROM quit_progress qp2
      WHERE qp2.user_id = quit_progress.user_id
        AND is_smoke_free = false
    )
  GROUP BY user_id
) qp ON p.id = qp.user_id
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

-- Create a view for community posts with profile information
CREATE OR REPLACE VIEW community_posts_with_profiles AS
SELECT
  cp.*,
  CASE
    WHEN cp.is_anonymous THEN NULL
    ELSE p.username
  END as username,
  CASE
    WHEN cp.is_anonymous THEN NULL
    ELSE p.full_name
  END as full_name,
  CASE
    WHEN cp.is_anonymous THEN NULL
    ELSE p.avatar_url
  END as avatar_url
FROM community_posts cp
LEFT JOIN profiles p ON cp.user_id = p.id;

-- Create a view for post comments with profile information
CREATE OR REPLACE VIEW post_comments_with_profiles AS
SELECT
  pc.*,
  CASE
    WHEN pc.is_anonymous THEN NULL
    ELSE p.username
  END as username,
  CASE
    WHEN pc.is_anonymous THEN NULL
    ELSE p.full_name
  END as full_name,
  CASE
    WHEN pc.is_anonymous THEN NULL
    ELSE p.avatar_url
  END as avatar_url
FROM post_comments pc
LEFT JOIN profiles p ON pc.user_id = p.id;

-- Grant permissions on views
GRANT SELECT ON user_stats TO authenticated;
GRANT SELECT ON community_posts_with_profiles TO authenticated;
GRANT SELECT ON post_comments_with_profiles TO authenticated;

-- RLS policies for views
CREATE POLICY "Users can view their own stats" ON user_stats FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Anyone can view community posts with profiles" ON community_posts_with_profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can view comments with profiles" ON post_comments_with_profiles FOR SELECT USING (true);

ALTER VIEW user_stats ENABLE ROW LEVEL SECURITY;
ALTER VIEW community_posts_with_profiles ENABLE ROW LEVEL SECURITY;
ALTER VIEW post_comments_with_profiles ENABLE ROW LEVEL SECURITY;