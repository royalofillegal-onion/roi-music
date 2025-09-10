export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string
          query: string
          response: string
          timestamp: string
          user_id: string
        }
        Insert: {
          id?: string
          query: string
          response: string
          timestamp?: string
          user_id: string
        }
        Update: {
          id?: string
          query?: string
          response?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      global_likes: {
        Row: {
          created_at: string
          id: string
          song_id: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          song_id: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          song_id?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          created_at: string
          id: string
          position: number
          section_name: string
          song_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          section_name: string
          song_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          section_name?: string
          song_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      liked_songs: {
        Row: {
          created_at: string
          id: string
          song_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          song_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          song_id?: string
          user_id?: string
        }
        Relationships: []
      }
      live_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          live_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          live_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          live_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_comments_live_id_fkey"
            columns: ["live_id"]
            isOneToOne: false
            referencedRelation: "lives"
            referencedColumns: ["id"]
          },
        ]
      }
      live_likes: {
        Row: {
          created_at: string | null
          id: string
          live_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          live_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          live_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_likes_live_id_fkey"
            columns: ["live_id"]
            isOneToOne: false
            referencedRelation: "lives"
            referencedColumns: ["id"]
          },
        ]
      }
      lives: {
        Row: {
          created_at: string | null
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          scheduled_at: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
          video_url: string
          views: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          scheduled_at: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          video_url: string
          views?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          scheduled_at?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          video_url?: string
          views?: number | null
        }
        Relationships: []
      }
      playlist_songs: {
        Row: {
          created_at: string | null
          id: string
          playlist_id: string
          position: number
          song_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          playlist_id: string
          position: number
          song_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          playlist_id?: string
          position?: number
          song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_songs_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          cover_image: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      recent_plays: {
        Row: {
          id: string
          played_at: string | null
          song_id: string
          user_id: string
        }
        Insert: {
          id?: string
          played_at?: string | null
          song_id: string
          user_id: string
        }
        Update: {
          id?: string
          played_at?: string | null
          song_id?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_videos: {
        Row: {
          added_by: string | null
          created_at: string | null
          id: string
          scheduled_for: string
          status: string
          thumbnail_url: string | null
          title: string
          url: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string | null
          id?: string
          scheduled_for: string
          status?: string
          thumbnail_url?: string | null
          title: string
          url: string
        }
        Update: {
          added_by?: string | null
          created_at?: string | null
          id?: string
          scheduled_for?: string
          status?: string
          thumbnail_url?: string | null
          title?: string
          url?: string
        }
        Relationships: []
      }
      shared_songs: {
        Row: {
          clicks: number | null
          created_at: string
          created_by: string | null
          hash_code: string
          id: string
          song_id: string
        }
        Insert: {
          clicks?: number | null
          created_at?: string
          created_by?: string | null
          hash_code: string
          id?: string
          song_id: string
        }
        Update: {
          clicks?: number | null
          created_at?: string
          created_by?: string | null
          hash_code?: string
          id?: string
          song_id?: string
        }
        Relationships: []
      }
      song_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      song_category_relations: {
        Row: {
          category_id: string | null
          id: string
          song_id: string | null
        }
        Insert: {
          category_id?: string | null
          id?: string
          song_id?: string | null
        }
        Update: {
          category_id?: string | null
          id?: string
          song_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "song_category_relations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "song_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_category_relations_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          album: string | null
          approved_by: string | null
          approved_date: string | null
          artist: string
          audio_url: string
          category: string | null
          download_count: number | null
          duration: number
          genre: string | null
          id: string
          image_url: string | null
          lyrics: string | null
          mood: string | null
          play_count: number | null
          status: string
          tags: string[] | null
          title: string
          upload_date: string
          uploaded_by: string
          year: number | null
        }
        Insert: {
          album?: string | null
          approved_by?: string | null
          approved_date?: string | null
          artist: string
          audio_url: string
          category?: string | null
          download_count?: number | null
          duration: number
          genre?: string | null
          id?: string
          image_url?: string | null
          lyrics?: string | null
          mood?: string | null
          play_count?: number | null
          status?: string
          tags?: string[] | null
          title: string
          upload_date?: string
          uploaded_by: string
          year?: number | null
        }
        Update: {
          album?: string | null
          approved_by?: string | null
          approved_date?: string | null
          artist?: string
          audio_url?: string
          category?: string | null
          download_count?: number | null
          duration?: number
          genre?: string | null
          id?: string
          image_url?: string | null
          lyrics?: string | null
          mood?: string | null
          play_count?: number | null
          status?: string
          tags?: string[] | null
          title?: string
          upload_date?: string
          uploaded_by?: string
          year?: number | null
        }
        Relationships: []
      }
      time_based_content: {
        Row: {
          content_data: Json
          content_type: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          time_period: string
          updated_at: string
        }
        Insert: {
          content_data?: Json
          content_type: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          time_period: string
          updated_at?: string
        }
        Update: {
          content_data?: Json
          content_type?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          time_period?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_onboarding: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          preferences: Json | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          assistant_name: string | null
          created_at: string
          id: string
          theme_color: string | null
          updated_at: string
          user_id: string
          voice_name: string | null
          voice_speed: number | null
          wake_word: string | null
        }
        Insert: {
          assistant_name?: string | null
          created_at?: string
          id?: string
          theme_color?: string | null
          updated_at?: string
          user_id: string
          voice_name?: string | null
          voice_speed?: number | null
          wake_word?: string | null
        }
        Update: {
          assistant_name?: string | null
          created_at?: string
          id?: string
          theme_color?: string | null
          updated_at?: string
          user_id?: string
          voice_name?: string | null
          voice_speed?: number | null
          wake_word?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_time_period: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_song_like_count: {
        Args: { song_id_param: string }
        Returns: number
      }
      get_song_likers: {
        Args: { song_id_param: string }
        Returns: {
          user_id: string
          username: string
          created_at: string
        }[]
      }
      get_time_based_content: {
        Args: { content_type_param?: string }
        Returns: {
          id: string
          time_period: string
          content_type: string
          content_data: Json
          is_current_period: boolean
        }[]
      }
      get_trending_songs: {
        Args: { limit_count?: number }
        Returns: {
          id: string
          title: string
          artist: string
          album: string
          genre: string
          duration: number
          image_url: string
          audio_url: string
          play_count: number
          upload_date: string
        }[]
      }
      increment_click_count: {
        Args: { hash_code: string }
        Returns: undefined
      }
      increment_play_count: {
        Args: { song_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
