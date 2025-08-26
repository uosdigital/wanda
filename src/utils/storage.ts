import { AppData } from '../types';
import { supabase, hasSupabaseConfig } from './supabase';

const STORAGE_KEY = 'twist-data';

export const getEmptyAppData = (): AppData => ({
  totalPoints: 0,
  currentStreak: 0,
  dailyData: {},
  habits: []
});

export const loadAppData = async (): Promise<AppData> => {
  // Try Supabase first if configured
  if (hasSupabaseConfig) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_data')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Supabase load error:', error);
        } else if (data) {
          console.info('[storage] Loaded data from Supabase');
          return data.app_data as AppData;
        }
      }
    } catch (error) {
      console.error('Supabase connection failed, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // NUCLEAR CLEAR: Remove app data but preserve dark mode preference
      const darkModePreference = localStorage.getItem('darkMode');
      localStorage.clear();
      sessionStorage.clear();
      // Restore dark mode preference
      if (darkModePreference) {
        localStorage.setItem('darkMode', darkModePreference);
      }
      console.info('[storage] NUCLEAR CLEAR: Complete fresh start forced (preserved dark mode)');
      return getEmptyAppData();
    }
  } catch (error) {
    console.error('Failed to load app data:', error);
  }
  return getEmptyAppData();
};

export const saveAppData = async (data: AppData): Promise<void> => {
  // Try Supabase first if configured
  if (hasSupabaseConfig) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('user_data')
          .upsert({
            user_id: user.id,
            app_data: data,
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          console.error('Supabase save error:', error);
        } else {
          console.info('[storage] Saved data to Supabase');
          return; // Success, don't fall back to localStorage
        }
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