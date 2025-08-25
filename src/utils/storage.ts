import { AppData } from '../types';

const STORAGE_KEY = 'twist-data';

export const initializeAppData = (): AppData => {
  // Generate dummy data for the last week
  const dummyData: { [key: string]: any } = {};
  const today = new Date();
  
  // Create data for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toDateString();
    
    // Random habits for each day
    const allHabits = ['guitar', 'write', 'read', 'exercise', 'socialise'];
    const plannedHabits = allHabits.filter(() => Math.random() > 0.3); // 70% chance of planning each habit
    const completedHabits = plannedHabits.filter(() => Math.random() > 0.4); // 60% chance of completing planned habits
    
    dummyData[dateStr] = {
      habits: plannedHabits,
      completedHabits: completedHabits,
      morningMood: ['Energetic', 'Focused', 'Calm', 'Motivated', 'Peaceful'][Math.floor(Math.random() * 5)],
      sleepQuality: Math.floor(Math.random() * 5) + 1,
      bedTime: `${Math.floor(Math.random() * 3) + 22}:${Math.random() > 0.5 ? '00' : '30'}`,
      wakeTime: `${Math.floor(Math.random() * 2) + 6}:${Math.random() > 0.5 ? '00' : '30'}`,
      mainPriority: ['Complete project proposal', 'Exercise routine', 'Read 30 minutes', 'Practice guitar', 'Call family'][Math.floor(Math.random() * 5)],
      additionalTasks: ['Review emails', 'Plan tomorrow', 'Clean workspace'][Math.floor(Math.random() * 3)],
      peopleToMessage: ['Mom', 'Work colleague', 'Friend from college'][Math.floor(Math.random() * 3)],
      completedPeople: [Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5],
      goodDayVision: ['Feel productive and accomplished', 'Have meaningful conversations', 'Learn something new', 'Help someone today'][Math.floor(Math.random() * 4)]
    };
  }

  return {
    totalPoints: 125,
    currentStreak: 3,
    dailyData: dummyData,
    habits: [
      'Exercise',
      'Meditation',
      'Reading',
      'Journaling',
      'Drink 8 glasses of water'
    ]
  };
};

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

export const clearAppData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('App data cleared successfully');
  } catch (error) {
    console.error('Failed to clear app data:', error);
  }
};

export const resetToDummyData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    const dummyData = initializeAppData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyData));
    console.log('Reset to dummy data successfully');
  } catch (error) {
    console.error('Failed to reset to dummy data:', error);
  }
};