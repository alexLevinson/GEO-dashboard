import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface ChatGPTScrape {
  id: string;
  customer: string;
  query: string;
  created_at: string;
  customer_mentioned: boolean;
  customer_top_ranked: boolean;
  cited_sources: string[];
  candidates: string[];
}

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  customer_name: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      chatgpt_scrapes: {
        Row: ChatGPTScrape;
        Insert: Omit<ChatGPTScrape, 'id' | 'created_at'>;
        Update: Partial<Omit<ChatGPTScrape, 'id'>>;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'user_id'>>;
      };
    };
  };
};