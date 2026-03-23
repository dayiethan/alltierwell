-- Drop existing comparison_log (auto-created with wrong schema) and recreate
DROP TABLE IF EXISTS comparison_log CASCADE;

-- Comparison log: caches compatibility scores between user pairs
-- user1_id < user2_id is enforced so each pair has exactly one row
CREATE TABLE comparison_log (
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  compatibility_score INT NOT NULL DEFAULT 0,
  compared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user1_id, user2_id),
  CHECK (user1_id < user2_id)
);

CREATE INDEX idx_comparison_log_user1 ON comparison_log(user1_id);
CREATE INDEX idx_comparison_log_user2 ON comparison_log(user2_id);

ALTER TABLE comparison_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comparison log readable by everyone"
  ON comparison_log FOR SELECT USING (true);

CREATE POLICY "Comparison log insertable by anyone"
  ON comparison_log FOR INSERT WITH CHECK (true);

CREATE POLICY "Comparison log updatable by anyone"
  ON comparison_log FOR UPDATE USING (true);

-- Drop existing user_events if auto-created
DROP TABLE IF EXISTS user_events CASCADE;

-- User events: general analytics / activity tracking
CREATE TABLE user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_events_actor ON user_events(actor_id);
CREATE INDEX idx_user_events_type ON user_events(event_type);

ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User events insertable by anyone"
  ON user_events FOR INSERT WITH CHECK (true);

CREATE POLICY "User events readable by everyone"
  ON user_events FOR SELECT USING (true);
