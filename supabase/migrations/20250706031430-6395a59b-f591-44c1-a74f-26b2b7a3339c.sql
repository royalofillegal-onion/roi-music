
-- Add a global_likes table to track all likes with user information
CREATE TABLE public.global_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  song_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(song_id, user_id)
);

-- Enable RLS for global_likes
ALTER TABLE public.global_likes ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to insert their own likes
CREATE POLICY "Users can insert their own global likes" 
  ON public.global_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own likes
CREATE POLICY "Users can delete their own global likes" 
  ON public.global_likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Policy to allow everyone to view all likes (for global visibility)
CREATE POLICY "Everyone can view global likes" 
  ON public.global_likes 
  FOR SELECT 
  USING (true);

-- Add categories and tags to songs table
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS mood TEXT;

-- Create function to get global like count for a song
CREATE OR REPLACE FUNCTION public.get_song_like_count(song_id_param TEXT)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.global_likes
  WHERE song_id = song_id_param;
$$;

-- Create function to get users who liked a song
CREATE OR REPLACE FUNCTION public.get_song_likers(song_id_param TEXT)
RETURNS TABLE(user_id UUID, username TEXT, created_at TIMESTAMP WITH TIME ZONE)
LANGUAGE SQL
STABLE
AS $$
  SELECT gl.user_id, gl.username, gl.created_at
  FROM public.global_likes gl
  WHERE gl.song_id = song_id_param
  ORDER BY gl.created_at DESC;
$$;

-- Enable realtime for global_likes table
ALTER TABLE public.global_likes REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.global_likes;
