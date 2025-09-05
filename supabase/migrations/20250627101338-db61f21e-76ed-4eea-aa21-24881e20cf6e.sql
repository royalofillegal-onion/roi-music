
-- Create onboarding status tracking table
CREATE TABLE IF NOT EXISTS public.user_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  completed BOOLEAN NOT NULL DEFAULT false,
  username TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for user_onboarding
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own onboarding" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can insert own onboarding" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can update own onboarding" ON public.user_onboarding;

-- Users can only see and modify their own onboarding data
CREATE POLICY "Users can view own onboarding" 
  ON public.user_onboarding 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding" 
  ON public.user_onboarding 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding" 
  ON public.user_onboarding 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Enable RLS for existing playlists table
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- Drop existing playlist policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can create own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can update own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can delete own playlists" ON public.playlists;

-- Create policies for playlists
CREATE POLICY "Users can view own playlists" 
  ON public.playlists 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own playlists" 
  ON public.playlists 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists" 
  ON public.playlists 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists" 
  ON public.playlists 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS for playlist_songs table
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

-- Drop existing playlist_songs policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view songs in their playlists" ON public.playlist_songs;
DROP POLICY IF EXISTS "Users can add songs to their playlists" ON public.playlist_songs;
DROP POLICY IF EXISTS "Users can remove songs from their playlists" ON public.playlist_songs;

-- Create policies for playlist_songs (users can manage songs in their playlists)
CREATE POLICY "Users can view songs in their playlists" 
  ON public.playlist_songs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_songs.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add songs to their playlists" 
  ON public.playlist_songs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_songs.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove songs from their playlists" 
  ON public.playlist_songs 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_songs.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

-- Create time-based content management table for admins
CREATE TABLE IF NOT EXISTS public.time_based_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  time_period TEXT NOT NULL CHECK (time_period IN ('morning', 'afternoon', 'evening', 'night')),
  content_type TEXT NOT NULL CHECK (content_type IN ('featured_songs', 'featured_playlists', 'banner')),
  content_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for time_based_content
ALTER TABLE public.time_based_content ENABLE ROW LEVEL SECURITY;

-- Drop existing time_based_content policies if they exist and recreate them
DROP POLICY IF EXISTS "Only admins can manage time-based content" ON public.time_based_content;
DROP POLICY IF EXISTS "Everyone can view active time-based content" ON public.time_based_content;

-- Only admins can manage time-based content
CREATE POLICY "Only admins can manage time-based content" 
  ON public.time_based_content 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Everyone can view active time-based content
CREATE POLICY "Everyone can view active time-based content" 
  ON public.time_based_content 
  FOR SELECT 
  USING (is_active = true);

-- Create function to get current time period
CREATE OR REPLACE FUNCTION public.get_current_time_period()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT CASE 
    WHEN EXTRACT(HOUR FROM NOW() AT TIME ZONE 'UTC') BETWEEN 5 AND 11 THEN 'morning'
    WHEN EXTRACT(HOUR FROM NOW() AT TIME ZONE 'UTC') BETWEEN 12 AND 17 THEN 'afternoon'
    WHEN EXTRACT(HOUR FROM NOW() AT TIME ZONE 'UTC') BETWEEN 18 AND 21 THEN 'evening'
    ELSE 'night'
  END;
$$;

-- Create function to get time-based content
CREATE OR REPLACE FUNCTION public.get_time_based_content(content_type_param TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  time_period TEXT,
  content_type TEXT,
  content_data JSONB,
  is_current_period BOOLEAN
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    tbc.id,
    tbc.time_period,
    tbc.content_type,
    tbc.content_data,
    (tbc.time_period = public.get_current_time_period()) as is_current_period
  FROM public.time_based_content tbc
  WHERE tbc.is_active = true
    AND (content_type_param IS NULL OR tbc.content_type = content_type_param)
  ORDER BY is_current_period DESC, tbc.updated_at DESC;
$$;
