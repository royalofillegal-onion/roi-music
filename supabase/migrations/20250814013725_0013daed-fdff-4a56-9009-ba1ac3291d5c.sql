-- Create offline playlists table for downloaded songs
CREATE TABLE public.offline_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create offline songs table for downloaded songs data
CREATE TABLE public.offline_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL,
  song_id TEXT NOT NULL,
  song_data JSONB NOT NULL, -- Store complete song object
  audio_blob_url TEXT, -- Local blob URL for offline playback
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.offline_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_songs ENABLE ROW LEVEL SECURITY;

-- Create policies for offline playlists
CREATE POLICY "Users can manage their offline playlists" 
ON public.offline_playlists 
FOR ALL 
USING (auth.uid() = user_id);

-- Create policies for offline songs
CREATE POLICY "Users can manage their offline songs" 
ON public.offline_songs 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM offline_playlists 
  WHERE offline_playlists.id = offline_songs.playlist_id 
  AND offline_playlists.user_id = auth.uid()
));

-- Add foreign key constraint
ALTER TABLE public.offline_songs 
ADD CONSTRAINT fk_offline_songs_playlist 
FOREIGN KEY (playlist_id) REFERENCES public.offline_playlists(id) 
ON DELETE CASCADE;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_offline_playlists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_offline_playlists_updated_at
BEFORE UPDATE ON public.offline_playlists
FOR EACH ROW
EXECUTE FUNCTION public.update_offline_playlists_updated_at();