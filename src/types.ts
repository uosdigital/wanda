export interface DailyData {
  sleepQuality?: number;
  bedTime?: string;
  wakeTime?: string;
  morningMood?: string;
  morningFeelings?: string;
  mainPriority?: string;
  firstStep?: string;
  additionalTasks?: string[];
  peopleToMessage?: string[];
  completedPeople?: boolean[];
  completedTasks?: boolean[];
  completedMainTask?: boolean;
  winOfDay?: string;
  obstacles?: string[];
  eveningMood?: number;
  completedHabits?: boolean[];
  focusBlocks?: number;
  goodStuff?: string[];
  habits?: string[];
  goodDayVision?: string;
  date?: string;
}

export interface AppData {
  totalPoints: number;
  currentStreak: number;
  dailyData: Record<string, DailyData>;
  habits: string[];
}