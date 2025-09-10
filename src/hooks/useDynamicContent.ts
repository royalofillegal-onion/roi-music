import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DynamicSection {
  section_id: string;
  section_name: string;
  section_type: string;
  section_config: any;
  content_items: any[];
}

interface RawDynamicSection {
  content_items: any;
  section_config: any;
  section_id: string;
  section_name: string;
  section_type: string;
}

interface AppConfig {
  key: string;
  value: any;
}

export const useDynamicContent = () => {
  const [sections, setSections] = useState<DynamicSection[]>([]);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDynamicContent = async () => {
    try {
      setLoading(true);
      
      // Load dynamic homepage sections
      const { data: sectionsData, error: sectionsError } = await supabase.rpc('get_dynamic_homepage');
      
      if (sectionsError) throw sectionsError;
      
      // Load app configuration
      const { data: configData, error: configError } = await supabase
        .from('app_config')
        .select('key, value')
        .eq('is_public', true);
        
      if (configError) throw configError;
      
      // Transform the raw data to match our interface
      const transformedSections: DynamicSection[] = (sectionsData || []).map((raw: RawDynamicSection) => ({
        section_id: raw.section_id,
        section_name: raw.section_name,
        section_type: raw.section_type,
        section_config: raw.section_config,
        content_items: Array.isArray(raw.content_items) ? raw.content_items : []
      }));
      
      setSections(transformedSections);
      
      // Transform config into key-value object
      const configObject = configData?.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, any>) || {};
      
      setConfig(configObject);
      
    } catch (err: any) {
      console.error('Error loading dynamic content:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const trackInteraction = async (
    interactionType: string, 
    contentId?: string, 
    contentType?: string, 
    metadata?: any
  ) => {
    try {
      await supabase.rpc('track_interaction', {
        p_interaction_type: interactionType,
        p_content_id: contentId,
        p_content_type: contentType,
        p_metadata: metadata || {}
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  const getPersonalizedContent = async (limit: number = 20) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];
      
      const { data, error } = await supabase.rpc('get_personalized_content', {
        p_user_id: user.id,
        p_limit: limit
      });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error loading personalized content:', error);
      return [];
    }
  };

  useEffect(() => {
    loadDynamicContent();
  }, []);

  return {
    sections,
    config,
    loading,
    error,
    reload: loadDynamicContent,
    trackInteraction,
    getPersonalizedContent
  };
};

export const useUserInteractions = () => {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(false);

  const trackPlay = async (songId: string, metadata?: any) => {
    await supabase.rpc('track_interaction', {
      p_interaction_type: 'play',
      p_content_id: songId,
      p_content_type: 'song',
      p_metadata: metadata || {}
    });
  };

  const trackLike = async (songId: string) => {
    await supabase.rpc('track_interaction', {
      p_interaction_type: 'like',
      p_content_id: songId,
      p_content_type: 'song',
      p_metadata: {}
    });
  };

  const trackSearch = async (query: string, results?: number) => {
    await supabase.rpc('track_interaction', {
      p_interaction_type: 'search',
      p_content_id: null,
      p_content_type: 'query',
      p_metadata: { query, results }
    });
  };

  const trackView = async (contentId: string, contentType: string, duration?: number) => {
    await supabase.rpc('track_interaction', {
      p_interaction_type: 'view',
      p_content_id: contentId,
      p_content_type: contentType,
      p_metadata: { duration }
    });
  };

  return {
    interactions,
    loading,
    trackPlay,
    trackLike,
    trackSearch,
    trackView
  };
};