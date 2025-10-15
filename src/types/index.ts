export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  quit_date?: string;
  cigarettes_per_day?: number;
  years_smoking?: number;
  cost_per_pack?: number;
  cigarettes_per_pack?: number;
  quit_method?: 'cold_turkey' | 'gradual' | 'nrt' | 'prescription';
  reasons_for_quitting?: string[];
  created_at: string;
  updated_at: string;
}

export interface QuitProgress {
  id: string;
  user_id: string;
  date: string;
  is_smoke_free: boolean;
  cigarettes_smoked: number;
  notes?: string;
  mood?: 'excellent' | 'good' | 'okay' | 'difficult' | 'terrible';
  created_at: string;
}

export interface Craving {
  id: string;
  user_id: string;
  intensity: number; // 1-10
  trigger: 'stress' | 'social' | 'routine' | 'boredom' | 'alcohol' | 'other';
  coping_strategy?: string;
  resisted: boolean;
  notes?: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  earned_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  mood?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  topic?: 'general' | 'first_day' | 'milestone' | 'struggle' | 'success';
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface BuddyConnection {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface QuitStatistics {
  days_smoke_free: number;
  money_saved: number;
  cigarettes_not_smoked: number;
  time_regained_hours: number;
  current_streak: number;
}

export interface HealthMilestone {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  achieved: boolean;
  achievement_date?: string;
}

export interface OnboardingData {
  cigarettes_per_day: number;
  years_smoking: number;
  cost_per_pack: number;
  cigarettes_per_pack: number;
  quit_date: string;
  quit_method: string;
  previous_attempts: number;
  primary_triggers: string[];
  reasons_for_quitting: string[];
}

export interface CravingTrigger {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface DistractionActivity {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  type: 'breathing' | 'physical' | 'mental' | 'creative';
}

export interface NotificationSettings {
  daily_reminders: boolean;
  milestone_alerts: boolean;
  craving_support: boolean;
  community_updates: boolean;
  buddy_messages: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'hi';
  currency: 'INR' | 'USD';
  notifications: NotificationSettings;
  privacy_level: 'public' | 'friends' | 'private';
}