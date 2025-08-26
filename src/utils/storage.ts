import { AppData } from '../types';

const STORAGE_KEY = 'twist-data';

export const getEmptyAppData = (): AppData => ({
  totalPoints: 0,
  currentStreak: 0,
  dailyData: {},
  habits: []
});

export const loadAppData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Detect legacy dummy seeded data from previous versions and purge
      try {
        const isLegacyDummy = (
          (data.totalPoints === 125 && data.currentStreak === 3) ||
          (data.dailyData && typeof data.dailyData === 'object' && Object.keys(data.dailyData).length > 0 &&
            // heuristic: contains historical days (not today) and classic fields like goodDayVision
            Object.keys(data.dailyData).some((k) => {
              const d = data.dailyData[k];
              return d && (d.goodDayVision || d.sleepQuality || d.morningMood);
            })
          )
        );
        if (isLegacyDummy) {
          localStorage.removeItem(STORAGE_KEY);
          console.info('[storage] Cleared legacy dummy data');
          return getEmptyAppData();
        }
      } catch {}
      // Ensure all required properties exist with safe defaults
      return {
        ...getEmptyAppData(),
        ...data
      } as AppData;
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