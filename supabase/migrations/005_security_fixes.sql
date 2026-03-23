-- ============================================================
-- Security fixes: RLS policies, missing columns, account deletion
-- ============================================================

-- 1. Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_era TEXT DEFAULT 'default';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- 2. Add missing tags column to songs table
ALTER TABLE songs ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 3. Add DELETE policy on users (allows account deletion)
CREATE POLICY "Users can delete own profile"
  ON users FOR DELETE
  USING (auth.uid() = id);

-- 4. Fix comparison_log RLS: restrict INSERT/UPDATE to authenticated participants
DROP POLICY IF EXISTS "Comparison log insertable by anyone" ON comparison_log;
DROP POLICY IF EXISTS "Comparison log updatable by anyone" ON comparison_log;

CREATE POLICY "Comparison log insertable by participants"
  ON comparison_log FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (auth.uid() = user1_id OR auth.uid() = user2_id)
  );

CREATE POLICY "Comparison log updatable by participants"
  ON comparison_log FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Explicitly deny deletion of audit data
CREATE POLICY "Comparison log not deletable"
  ON comparison_log FOR DELETE
  USING (false);

-- 5. Fix user_events RLS: require authentication for insertion
DROP POLICY IF EXISTS "User events insertable by anyone" ON user_events;

CREATE POLICY "User events insertable by authenticated users"
  ON user_events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Explicitly deny deletion of audit data
CREATE POLICY "User events not deletable"
  ON user_events FOR DELETE
  USING (false);
