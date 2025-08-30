export interface TimeBlock {
  id: string;
  start: string; // ISO datetime
  end: string;   // ISO datetime
  category: 'priority' | 'task' | 'habit' | 'connect' | 'custom';
  label: string;
}

export interface Note {
  id: string;
  text: string;
  color: string; // tailwind color class or hex
  createdAt: string; // ISO datetime
  updatedAt?: string; // ISO datetime
}

export interface WorryEntry {
  id: string;
  createdAt: string; // ISO datetime
  worry: string;
  evidence: string;
  physicalThoughts: string;
  previousExperience: string;
  balancedPerspective: string;
  friendAdvice: string;
  selfKindness: string;
  reframe?: string; // Added later when reviewing
  reframeDate?: string; // When reframe was added
}

export interface WorryReframe {
  worryId: string;
  reframe: string;
  reframeDate: string; // ISO datetime
}

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
  priorityTasks?: Array<{ label: string; completed: boolean }>;
  winOfDay?: string;
  obstacles?: string[];
  eveningMood?: string | number;
  completedHabits?: string[];
  habitDetails?: Record<string, string>;
  focusBlocks?: number;
  goodStuff?: string[];
  habits?: string[];
  goodDayVision?: string;
  dayDescription?: string;
  waterGlasses?: number;
  basics?: {
    drankWater?: boolean;
    ateHealthy?: boolean;
    listenedToSomething?: boolean;
    wasMindful?: boolean;
    steps10k?: boolean;
    sleep7h?: boolean;
  };
  date?: string;
  timeBlocks?: TimeBlock[];
  meetings?: Array<{
    title: string;
    startTime: string;
    endTime: string;
  }>;
  worries?: WorryEntry[];
  points?: number; // Daily points total from onAddPoints calls
}

export interface AppData {
  totalPoints: number;
  currentStreak: number;
  dailyData: Record<string, DailyData>;
  habits: string[];
  notes?: Note[];
}

export type View = 'dashboard' | 'morning' | 'evening' | 'weekly' | 'timer' | 'habits' | 'basics' | 'dread' | 'timeblocking' | 'points' | 'notes';