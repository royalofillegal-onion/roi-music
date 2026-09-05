CREATE TABLE public.user_library (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  liked_song_ids TEXT[] NOT NULL DEFAULT '{}',
  playlists JSONB NOT NULL DEFAULT '[]'::jsonb,
  liked_playlist_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_library TO authenticated;
GRANT ALL ON public.user_library TO service_role;
ALTER TABLE public.user_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own library" ON public.user_library FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER user_library_updated BEFORE UPDATE ON public.user_library FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();