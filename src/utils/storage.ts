import { AppData } from '../types';

const STORAGE_KEY = 'twist-data';

export const getEmptyAppData = (): AppData => ({
  totalPoints: 0,
  currentStreak: 0,
  dailyData: {},
  habits: []
});

export const loadAppData = (): AppData => {
  // NUCLEAR OPTION: Force complete fresh start
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

export const saveAppData = (data: AppData): void => {
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