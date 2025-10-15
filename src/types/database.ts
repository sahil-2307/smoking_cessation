export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          quit_date: string | null
          cigarettes_per_day: number | null
          years_smoking: number | null
          cost_per_pack: number | null
          cigarettes_per_pack: number | null
          quit_method: 'cold_turkey' | 'gradual' | 'nrt' | 'prescription' | null
          reasons_for_quitting: string[] | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          quit_date?: string | null
          cigarettes_per_day?: number | null
          years_smoking?: number | null
          cost_per_pack?: number | null
          cigarettes_per_pack?: number | null
          quit_method?: 'cold_turkey' | 'gradual' | 'nrt' | 'prescription' | null
          reasons_for_quitting?: string[] | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          quit_date?: string | null
          cigarettes_per_day?: number | null
          years_smoking?: number | null
          cost_per_pack?: number | null
          cigarettes_per_pack?: number | null
          quit_method?: 'cold_turkey' | 'gradual' | 'nrt' | 'prescription' | null
          reasons_for_quitting?: string[] | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      quit_progress: {
        Row: {
          id: string
          user_id: string
          date: string
          is_smoke_free: boolean
          cigarettes_smoked: number
          notes: string | null
          mood: 'excellent' | 'good' | 'okay' | 'difficult' | 'terrible' | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          is_smoke_free?: boolean
          cigarettes_smoked?: number
          notes?: string | null
          mood?: 'excellent' | 'good' | 'okay' | 'difficult' | 'terrible' | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          is_smoke_free?: boolean
          cigarettes_smoked?: number
          notes?: string | null
          mood?: 'excellent' | 'good' | 'okay' | 'difficult' | 'terrible' | null
          created_at?: string
        }
      }
      cravings: {
        Row: {
          id: string
          user_id: string
          intensity: number
          trigger: 'stress' | 'social' | 'routine' | 'boredom' | 'alcohol' | 'other' | null
          coping_strategy: string | null
          resisted: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          intensity: number
          trigger?: 'stress' | 'social' | 'routine' | 'boredom' | 'alcohol' | 'other' | null
          coping_strategy?: string | null
          resisted: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          intensity?: number
          trigger?: 'stress' | 'social' | 'routine' | 'boredom' | 'alcohol' | 'other' | null
          coping_strategy?: string | null
          resisted?: boolean
          notes?: string | null
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          achievement_type: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_type: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_type?: string
          earned_at?: string
        }
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          title: string | null
          content: string
          mood: string | null
          tags: string[] | null
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          content: string
          mood?: string | null
          tags?: string[] | null
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          content?: string
          mood?: string | null
          tags?: string[] | null
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      community_posts: {
        Row: {
          id: string
          user_id: string
          content: string
          topic: 'general' | 'first_day' | 'milestone' | 'struggle' | 'success' | null
          likes_count: number
          comments_count: number
          is_anonymous: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          topic?: 'general' | 'first_day' | 'milestone' | 'struggle' | 'success' | null
          likes_count?: number
          comments_count?: number
          is_anonymous?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          topic?: 'general' | 'first_day' | 'milestone' | 'struggle' | 'success' | null
          likes_count?: number
          comments_count?: number
          is_anonymous?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          is_anonymous: boolean
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          is_anonymous?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          is_anonymous?: boolean
          created_at?: string
        }
      }
      post_likes: {
        Row: {
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      buddy_connections: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: 'pending' | 'accepted' | 'rejected' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          addressee_id: string
          status?: 'pending' | 'accepted' | 'rejected' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          addressee_id?: string
          status?: 'pending' | 'accepted' | 'rejected' | 'blocked'
          created_at?: string
          updated_at?: string
        }
      }
      buddy_messages: {
        Row: {
          id: string
          connection_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          connection_id: string
          sender_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          connection_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          user_id: string
          theme: 'light' | 'dark' | 'system'
          language: 'en' | 'hi'
          currency: 'INR' | 'USD'
          notifications: Json
          privacy_level: 'public' | 'friends' | 'private'
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          theme?: 'light' | 'dark' | 'system'
          language?: 'en' | 'hi'
          currency?: 'INR' | 'USD'
          notifications?: Json
          privacy_level?: 'public' | 'friends' | 'private'
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          theme?: 'light' | 'dark' | 'system'
          language?: 'en' | 'hi'
          currency?: 'INR' | 'USD'
          notifications?: Json
          privacy_level?: 'public' | 'friends' | 'private'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      user_stats: {
        Row: {
          id: string | null
          quit_date: string | null
          cigarettes_per_day: number | null
          cost_per_pack: number | null
          cigarettes_per_pack: number | null
          days_smoke_free: number | null
          current_streak: number | null
          total_cravings: number | null
          resisted_cravings: number | null
          achievement_count: number | null
        }
      }
      community_posts_with_profiles: {
        Row: {
          id: string | null
          user_id: string | null
          content: string | null
          topic: string | null
          likes_count: number | null
          comments_count: number | null
          is_anonymous: boolean | null
          created_at: string | null
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
        }
      }
      post_comments_with_profiles: {
        Row: {
          id: string | null
          post_id: string | null
          user_id: string | null
          content: string | null
          is_anonymous: boolean | null
          created_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}