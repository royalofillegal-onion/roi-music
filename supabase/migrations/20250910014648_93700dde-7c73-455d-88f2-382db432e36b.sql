-- Create comprehensive dynamic content management system

-- Dynamic sections for homepage
CREATE TABLE public.dynamic_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'hero', 'slider', 'grid', 'featured'
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dynamic content items (songs, playlists, artists, etc.)
CREATE TABLE public.dynamic_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'song', 'playlist', 'artist', 'banner'
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  media_url TEXT,
  thumbnail_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Section content relationships
CREATE TABLE public.section_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES public.dynamic_sections(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.dynamic_content(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dynamic app configuration
CREATE TABLE public.app_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User behavior tracking
CREATE TABLE public.user_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  interaction_type TEXT NOT NULL, -- 'play', 'like', 'share', 'search', 'view'
  content_id UUID,
  content_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dynamic playlists with auto-generation rules
CREATE TABLE public.auto_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rules JSONB NOT NULL, -- Auto-generation rules
  max_songs INTEGER DEFAULT 50,
  refresh_interval TEXT DEFAULT '1 day', -- '1 hour', '1 day', '1 week'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dynamic_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_playlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dynamic sections
CREATE POLICY "Everyone can view active sections" ON public.dynamic_sections
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage sections" ON public.dynamic_sections
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for dynamic content
CREATE POLICY "Everyone can view active content" ON public.dynamic_content
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage content" ON public.dynamic_content
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for section content
CREATE POLICY "Everyone can view active section content" ON public.section_content
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage section content" ON public.section_content
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for app config
CREATE POLICY "Everyone can view public config" ON public.app_config
FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage all config" ON public.app_config
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for user interactions
CREATE POLICY "Users can insert own interactions" ON public.user_interactions
FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own interactions" ON public.user_interactions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all interactions" ON public.user_interactions
FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for auto playlists
CREATE POLICY "Everyone can view active auto playlists" ON public.auto_playlists
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage auto playlists" ON public.auto_playlists
FOR ALL USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_dynamic_sections_position ON public.dynamic_sections(position, is_active);
CREATE INDEX idx_dynamic_content_type ON public.dynamic_content(content_type, is_active);
CREATE INDEX idx_dynamic_content_featured ON public.dynamic_content(is_featured, is_active);
CREATE INDEX idx_section_content_section ON public.section_content(section_id, position);
CREATE INDEX idx_user_interactions_user ON public.user_interactions(user_id, created_at);
CREATE INDEX idx_user_interactions_content ON public.user_interactions(content_id, interaction_type);

-- Functions for dynamic content management
CREATE OR REPLACE FUNCTION public.get_dynamic_homepage()
RETURNS TABLE(
  section_id UUID,
  section_name TEXT,
  section_type TEXT,
  section_config JSONB,
  content_items JSONB
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    ds.id,
    ds.name,
    ds.type,
    ds.config,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', dc.id,
          'title', dc.title,
          'description', dc.description,
          'metadata', dc.metadata,
          'media_url', dc.media_url,
          'thumbnail_url', dc.thumbnail_url,
          'content_type', dc.content_type,
          'tags', dc.tags
        ) ORDER BY sc.position
      ) FILTER (WHERE dc.id IS NOT NULL),
      '[]'::jsonb
    ) as content_items
  FROM public.dynamic_sections ds
  LEFT JOIN public.section_content sc ON ds.id = sc.section_id AND sc.is_active = true
  LEFT JOIN public.dynamic_content dc ON sc.content_id = dc.id AND dc.is_active = true
  WHERE ds.is_active = true
  GROUP BY ds.id, ds.name, ds.type, ds.config, ds.position
  ORDER BY ds.position;
$$;

-- Function to track user interactions
CREATE OR REPLACE FUNCTION public.track_interaction(
  p_interaction_type TEXT,
  p_content_id UUID DEFAULT NULL,
  p_content_type TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_interactions (
    user_id,
    interaction_type,
    content_id,
    content_type,
    metadata
  ) VALUES (
    auth.uid(),
    p_interaction_type,
    p_content_id,
    p_content_type,
    p_metadata
  );
END;
$$;

-- Function to get personalized recommendations
CREATE OR REPLACE FUNCTION public.get_personalized_content(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
  content_id UUID,
  title TEXT,
  content_type TEXT,
  score NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  WITH user_preferences AS (
    SELECT 
      content_type,
      COUNT(*) as interaction_count
    FROM public.user_interactions 
    WHERE user_id = p_user_id 
      AND interaction_type IN ('play', 'like', 'share')
      AND created_at > NOW() - INTERVAL '30 days'
    GROUP BY content_type
  ),
  content_scores AS (
    SELECT 
      dc.id,
      dc.title,
      dc.content_type,
      COALESCE(up.interaction_count, 0) * 1.0 as preference_score,
      CASE WHEN dc.is_featured THEN 2.0 ELSE 1.0 END as feature_score,
      EXTRACT(EPOCH FROM (NOW() - dc.created_at)) / 86400.0 as age_penalty
    FROM public.dynamic_content dc
    LEFT JOIN user_preferences up ON dc.content_type = up.content_type
    WHERE dc.is_active = true
  )
  SELECT 
    id,
    title,
    content_type,
    (preference_score + feature_score - (age_penalty * 0.1)) as score
  FROM content_scores
  ORDER BY score DESC
  LIMIT p_limit;
$$;

-- Insert initial configuration
INSERT INTO public.app_config (key, value, description, is_public) VALUES
('site_title', '"ROI MUSIC - Dynamic Experience"', 'Site title', true),
('hero_config', '{"title": "Experience Music Dynamically", "subtitle": "Personalized content just for you"}', 'Hero section configuration', true),
('theme_config', '{"primary_color": "#7B2CBF", "accent_color": "#9A3B3B"}', 'Theme configuration', true),
('features', '{"auto_recommendations": true, "personalized_playlists": true, "dynamic_sections": true}', 'Feature flags', true);

-- Insert sample dynamic sections
INSERT INTO public.dynamic_sections (name, type, position, config) VALUES
('Hero Section', 'hero', 0, '{"layout": "banner", "autoplay": true}'),
('Trending Now', 'slider', 1, '{"items_per_view": 4, "autoplay": false}'),
('Recommended For You', 'grid', 2, '{"columns": 3, "personalized": true}'),
('New Releases', 'slider', 3, '{"items_per_view": 5, "show_date": true}'),
('Featured Artists', 'grid', 4, '{"columns": 6, "show_follow_button": true}');