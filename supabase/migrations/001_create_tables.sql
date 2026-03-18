-- Songs table
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  album TEXT NOT NULL,
  album_order INT NOT NULL,
  track_number INT NOT NULL,
  is_vault BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(album, track_number)
);

CREATE INDEX idx_songs_album_track ON songs(album, track_number);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_public BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_users_username ON users(username);

-- Tier entries table
CREATE TABLE tier_entries (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('S', 'A', 'B', 'C', 'D', 'F')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, song_id)
);

CREATE INDEX idx_tier_entries_user ON tier_entries(user_id);

-- RLS policies
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_entries ENABLE ROW LEVEL SECURITY;

-- Songs: anyone can read
CREATE POLICY "Songs are viewable by everyone"
  ON songs FOR SELECT
  USING (true);

-- Users: anyone can read
CREATE POLICY "User profiles are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Users: insert own row only
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users: update own row only
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Tier entries: viewable if user is public or you're the owner
CREATE POLICY "Tier entries viewable if public or own"
  ON tier_entries FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users WHERE users.id = tier_entries.user_id AND users.is_public = true
    )
  );

-- Tier entries: insert/update/delete own only
CREATE POLICY "Users can insert own tier entries"
  ON tier_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tier entries"
  ON tier_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tier entries"
  ON tier_entries FOR DELETE
  USING (auth.uid() = user_id);
