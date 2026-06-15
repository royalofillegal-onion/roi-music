
-- Devices table: one row per device id
CREATE TABLE public.devices (
  device_id text PRIMARY KEY,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.devices TO anon;
GRANT ALL ON public.devices TO service_role;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read devices" ON public.devices FOR SELECT USING (true);
CREATE POLICY "anyone can add devices" ON public.devices FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can update devices" ON public.devices FOR UPDATE USING (true) WITH CHECK (true);

-- Plays: aggregated play counts per device + song
CREATE TABLE public.plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  song_id text NOT NULL,
  title text NOT NULL,
  artist text,
  image_url text,
  play_count integer NOT NULL DEFAULT 1,
  last_played_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_id, song_id)
);
GRANT SELECT, INSERT, UPDATE ON public.plays TO anon;
GRANT ALL ON public.plays TO service_role;
ALTER TABLE public.plays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read plays" ON public.plays FOR SELECT USING (true);
CREATE POLICY "anyone can add plays" ON public.plays FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can update plays" ON public.plays FOR UPDATE USING (true) WITH CHECK (true);

-- Likes: one row per device + liked song
CREATE TABLE public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  song_id text NOT NULL,
  title text NOT NULL,
  artist text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_id, song_id)
);
GRANT SELECT, INSERT, DELETE ON public.likes TO anon;
GRANT ALL ON public.likes TO service_role;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "anyone can add likes" ON public.likes FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can remove likes" ON public.likes FOR DELETE USING (true);

-- Searches: one row per search query per device
CREATE TABLE public.searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  query text NOT NULL,
  searched_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.searches TO anon;
GRANT ALL ON public.searches TO service_role;
ALTER TABLE public.searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read searches" ON public.searches FOR SELECT USING (true);
CREATE POLICY "anyone can add searches" ON public.searches FOR INSERT WITH CHECK (true);

CREATE INDEX idx_plays_device ON public.plays (device_id);
CREATE INDEX idx_plays_song ON public.plays (song_id);
CREATE INDEX idx_likes_device ON public.likes (device_id);
CREATE INDEX idx_searches_device ON public.searches (device_id);
