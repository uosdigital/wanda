import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : (null as any);

// Notes for future integration:
// - Store per-user data in tables (e.g., profiles, daily_data, habits, notes, timeblocks)
// - Add auth (magic link or OAuth). On sign-in, load data and hydrate local state
// - Implement bidirectional sync with conflict resolution (updated_at per record)
// - Wrap load/save functions to prefer Supabase when configured, fallback to localStorage


