/* eslint-disable */
export interface UserProfile {
  id: string; // UUID from Supabase Auth
  username: string;
  avatar_url?: string;
  created_at: string;
}

export interface GameScore {
  id: string; // UUID
  user_id: string; // Foreign key to UserProfile
  game_slug: string;
  score: number;
  created_at: string;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
}
