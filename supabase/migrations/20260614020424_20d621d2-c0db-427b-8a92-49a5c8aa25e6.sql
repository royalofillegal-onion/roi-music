
-- 1. Role enum + user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. App users (custom App ID + secret code auth, no Supabase Auth)
CREATE TABLE public.app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id TEXT NOT NULL UNIQUE,
  app_id_lower TEXT NOT NULL UNIQUE,
  secret_hash TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX app_users_last_seen_idx ON public.app_users(last_seen_at DESC);

GRANT ALL ON public.app_users TO service_role;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
-- No public policies: all access goes through edge functions using the service role.

-- 3. User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
-- No public policies: roles are read server-side only.

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Liked songs
CREATE TABLE public.liked_songs (
  user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL,
  title TEXT,
  artist TEXT,
  album TEXT,
  genre TEXT,
  sync TEXT,
  language TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, song_id)
);
CREATE INDEX liked_songs_song_idx ON public.liked_songs(song_id);
GRANT ALL ON public.liked_songs TO service_role;
ALTER TABLE public.liked_songs ENABLE ROW LEVEL SECURITY;

-- 5. Play events
CREATE TABLE public.play_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL,
  title TEXT,
  artist TEXT,
  album TEXT,
  genre TEXT,
  sync TEXT,
  language TEXT,
  listened_seconds INT NOT NULL DEFAULT 0,
  skipped BOOLEAN NOT NULL DEFAULT false,
  played_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX play_events_user_idx ON public.play_events(user_id, played_at DESC);
CREATE INDEX play_events_song_idx ON public.play_events(song_id);
CREATE INDEX play_events_played_at_idx ON public.play_events(played_at DESC);
GRANT ALL ON public.play_events TO service_role;
ALTER TABLE public.play_events ENABLE ROW LEVEL SECURITY;

-- 6. Broadcasts (admin messages, 24h expiry, readable by everyone)
CREATE TABLE public.broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  created_by UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);
CREATE INDEX broadcasts_expires_idx ON public.broadcasts(expires_at);

GRANT SELECT ON public.broadcasts TO anon, authenticated;
GRANT ALL ON public.broadcasts TO service_role;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Broadcasts are publicly readable while active"
ON public.broadcasts FOR SELECT
USING (expires_at > now());

-- Realtime for broadcasts
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcasts;
