
-- Password OTP table for Firebase-auth password resets
CREATE TABLE IF NOT EXISTS public.password_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_otps_email ON public.password_otps(email);
CREATE INDEX IF NOT EXISTS idx_password_otps_expires ON public.password_otps(expires_at);

-- Service role only; no anon/authenticated access
GRANT ALL ON public.password_otps TO service_role;
ALTER TABLE public.password_otps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON public.password_otps FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Add firebase_uid columns to existing user-data tables
ALTER TABLE public.profiles      ADD COLUMN IF NOT EXISTS firebase_uid TEXT;
ALTER TABLE public.playlists     ADD COLUMN IF NOT EXISTS firebase_uid TEXT;
ALTER TABLE public.user_likes    ADD COLUMN IF NOT EXISTS firebase_uid TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_firebase_uid   ON public.profiles(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_playlists_firebase_uid  ON public.playlists(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_user_likes_firebase_uid ON public.user_likes(firebase_uid);

-- Make user_id nullable since Firebase users won't have a Supabase UUID
ALTER TABLE public.profiles   ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.playlists  ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.user_likes ALTER COLUMN user_id DROP NOT NULL;

-- Disable RLS on user-data tables (Firebase auth is client-side; no auth.uid() to scope by).
-- This is a deliberate trade-off: anon key can now read/write these tables.
-- App code must always filter by firebase_uid.
ALTER TABLE public.profiles       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_likes     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs DISABLE ROW LEVEL SECURITY;

-- Grant anon access since RLS is off and Firebase users hit the API with the anon key
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles       TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlists      TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_likes     TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlist_songs TO anon;
