
import { Database } from './types';

export type ExtendedDatabase = Database & {
  public: Database['public'] & {
    Tables: Database['public']['Tables'] & {
      scheduled_videos: {
        Row: {
          id: string;
          url: string;
          title: string;
          scheduled_for: string;
          status: string;
          thumbnail_url: string | null;
          added_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          title: string;
          scheduled_for: string;
          status?: string;
          thumbnail_url?: string | null;
          added_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          url?: string;
          title?: string;
          scheduled_for?: string;
          status?: string;
          thumbnail_url?: string | null;
          added_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
  };
};
