import { AppData } from '../types';
import { supabase, hasSupabaseConfig } from './supabase';

const STORAGE_KEY = 'twist-data';

export const getEmptyAppData = (): AppData => ({
  totalPoints: 0,
  currentStreak: 0,
  dailyData: {},
  habits: [],
  notes: []
});

export const loadAppData = async (): Promise<{ data: AppData; source: 'supabase' | 'localStorage' | 'empty' }> => {
  // Try Supabase first if configured
  if (hasSupabaseConfig) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.info('[storage] Attempting to load from Supabase for user:', user.id);
        const { data, error } = await supabase
          .from('user_data')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') { // PGRST116 = no rows returned
            console.info('[storage] No data found in Supabase, user is new');
          } else {
            console.error('Supabase load error:', error);
          }
        } else if (data && data.app_data) {
          console.info('[storage] Successfully loaded data from Supabase');
          return { data: data.app_data as AppData, source: 'supabase' };
        }
      } else {
        console.info('[storage] No authenticated user, falling back to localStorage');
      }
    } catch (error) {
      console.error('Supabase connection failed, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      console.info('[storage] Loaded data from localStorage');
      return { data: JSON.parse(stored) as AppData, source: 'localStorage' };
    }
  } catch (error) {
    console.error('Failed to load app data:', error);
  }
  return { data: getEmptyAppData(), source: 'empty' };
};

export const saveAppData = async (data: AppData): Promise<void> => {
  // Try Supabase first if configured
  if (hasSupabaseConfig) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.info('[storage] Attempting to save to Supabase for user:', user.id);
        // First try to get existing data
        const { data: existingData, error: selectError } = await supabase
          .from('user_data')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (selectError && selectError.code !== 'PGRST116') {
          console.error('Error checking existing data:', selectError);
        }

        let upsertError;
        if (existingData) {
          // Update existing record
          const { error } = await supabase
            .from('user_data')
            .update({
              app_data: data,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
          upsertError = error;
        } else {
          // Insert new record
          const { error } = await supabase
            .from('user_data')
            .insert({
              user_id: user.id,
              app_data: data,
              updated_at: new Date().toISOString()
            });
          upsertError = error;
        }

        if (upsertError) {
          console.error('Supabase save error:', upsertError);
        } else {
          console.info('[storage] Successfully saved data to Supabase');
          // Also save to localStorage as backup
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } catch (localError) {
            console.error('Failed to save to localStorage backup:', localError);
          }
          return;
        }
      } else {
        console.info('[storage] No authenticated user, saving to localStorage only');
      }
    } catch (error) {
      console.error('Supabase connection failed, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save app data:', error);
  }
};

export const clearAppData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('App data cleared successfully');
  } catch (error) {
    console.error('Failed to clear app data:', error);
  }
};

export const nuclearClearAllData = (): void => {
  try {
    // Clear all localStorage
    localStorage.clear();
    // Also clear sessionStorage just in case
    sessionStorage.clear();
    console.log('NUCLEAR CLEAR: All data wiped completely');
  } catch (error) {
    console.error('Failed to nuclear clear data:', error);
  }
};