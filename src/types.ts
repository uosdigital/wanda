export interface DailyData {
  sleepQuality?: number;
  morningMood?: number;
  mainPriority?: string;
  additionalTasks?: string[];
  peopleToMessage?: string[];
  completedTasks?: boolean[];
  completedMainTask?: boolean;
  winOfDay?: string;
  obstacles?: string[];
  eveningMood?: number;
  completedHabits?: boolean[];
  focusBlocks?: number;
  date?: string;
}

export interface AppData {
  totalPoints: number;
  currentStreak: number;
  dailyData: Record<string, DailyData>;
  habits: string[];
}