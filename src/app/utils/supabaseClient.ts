import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

const isPlaceholder = 
  !supabaseUrl || 
  !supabaseAnonKey || 
  supabaseUrl.includes('your-project-id') || 
  supabaseAnonKey.includes('your-anonymous-public-anon-key') ||
  supabaseUrl.includes('placeholder-project-id');

// Fallback initialization to prevent crashes when environment variables are unconfigured
export const supabase = createClient(
  isPlaceholder ? 'https://placeholder-project-id.supabase.co' : supabaseUrl,
  isPlaceholder ? 'placeholder-anon-key' : supabaseAnonKey
);

export const isSupabaseConfigured = () => {
  return !isPlaceholder;
};
