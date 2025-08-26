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
      
      // AGGRESSIVE CLEANUP: Remove ALL legacy dummy data patterns
      let shouldClearAll = false;
      
      // Check for any legacy patterns
      if (data.dailyData && typeof data.dailyData === 'object') {
        const hasLegacyData = Object.keys(data.dailyData).some(key => {
          const dayData = data.dailyData[key];
          return dayData && (
            dayData.sleepQuality || 
            dayData.morningMood || 
            dayData.goodDayVision ||
            dayData.habits?.length > 0 ||
            dayData.completedHabits?.length > 0 ||
            dayData.additionalTasks?.length > 0 ||
            dayData.peopleToMessage?.length > 0
          );
        });
        
        if (hasLegacyData) {
          shouldClearAll = true;
        }
      }
      
      // Also check for legacy totals
      if (data.totalPoints > 0 || data.currentStreak > 0) {
        shouldClearAll = true;
      }
      
      if (shouldClearAll) {
        localStorage.removeItem(STORAGE_KEY);
        console.info('[storage] Aggressively cleared ALL legacy data');
        return getEmptyAppData();
      }
      
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