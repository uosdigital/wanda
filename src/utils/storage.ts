import { AppData } from '../types';

const STORAGE_KEY = 'flowfocus-data';

export const initializeAppData = (): AppData => ({
  totalPoints: 0,
  currentStreak: 1,
  dailyData: {},
  habits: [
    'Exercise',
    'Meditation',
    'Reading',
    'Journaling',
    'Drink 8 glasses of water'
  ]
});

export const loadAppData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Ensure all required properties exist
      return {
        ...initializeAppData(),
        ...data
      };
    }
  } catch (error) {
    console.error('Failed to load app data:', error);
  }
  return initializeAppData();
};

export const saveAppData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save app data:', error);
  }
};