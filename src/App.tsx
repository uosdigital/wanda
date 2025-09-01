import { useState, useEffect } from 'react';
import { Sun, Moon, LogOut, X, Trophy } from 'lucide-react';
import MorningFlow from './components/MorningFlow';
import Dashboard from './components/Dashboard';
import EveningFlow from './components/EveningFlow';
import WeeklyLog from './components/WeeklyLog';
import TimerView from './components/TimerView';
import Habits from './components/Habits';
import Sidebar from './components/Sidebar';
import FullScreenModal from './components/FullScreenModal';
import Auth from './components/Auth';
import { AppData, DailyData, Note } from './types';
import { saveAppData, loadAppData, clearAppData, getEmptyAppData } from './utils/storage';
import { useToast } from './components/ToastProvider';
import Timeblocking from './components/Timeblocking';
import Points from './components/Points';
import Notes from './components/Notes';
import Basics from './components/Basics';
import Dread from './components/Dread';
import { TimeBlock } from './types';
import { supabase, hasSupabaseConfig } from './utils/supabase';
import visionImg from '../images/vision.jpg';
import priorityImg from '../images/priority.jpg';
import tasksImg from '../images/tasks.jpg';
import guitarImg from '../images/guitar.jpg';
import basicsImg from '../images/basics.jpg';
import connectImg from '../images/connect.jpg';
import monsterImg from '../images/monster.jpg';
import focusImg from '../images/focus.jpg';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

type View = 'dashboard' | 'morning' | 'evening' | 'weekly' | 'timer' | 'habits' | 'basics' | 'dread' | 'timeblocking' | 'points' | 'notes';

type AddPointsFn = (points: number, reason?: string) => void;

type Category = 'priority' | 'task' | 'habit' | 'connect' | 'custom';

function App() {
  const { showToast } = useToast();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [morningFlowOpen, setMorningFlowOpen] = useState(false);
  const [eveningFlowOpen, setEveningFlowOpen] = useState(false);
  const [morningFlowCompleted, setMorningFlowCompleted] = useState(false);
  const [eveningFlowCompleted, setEveningFlowCompleted] = useState(false);
  const [appData, setAppData] = useState<AppData>(() => getEmptyAppData());
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('offline');

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setSyncStatus('syncing');
        const result = await loadAppData();
        setAppData(result.data);
        
        // Set sync status based on data source
        if (result.source === 'supabase') {
          setSyncStatus('synced');
        } else if (result.source === 'localStorage') {
          setSyncStatus('offline');
        } else {
          setSyncStatus('offline');
        }
      } catch (error) {
        console.error('Failed to load app data:', error);
        setSyncStatus('error');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      if (hasSupabaseConfig) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          console.log('[DEBUG] Auth check - user:', user);
          setIsAuthenticated(!!user);
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((
      _event: AuthChangeEvent,
      session: Session | null
    ) => {
      console.log('[DEBUG] Auth state change - session:', session);
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });
  const [timeblockIntent, setTimeblockIntent] = useState<{ label: string; category: Category } | null>(null);
  
  // Settings modal state
  const [showSettings, setShowSettings] = useState(false);
  const [showPointsReset, setShowPointsReset] = useState(false);
  const [pointsResetValue, setPointsResetValue] = useState('');
  const [showPointsBreakdown, setShowPointsBreakdown] = useState(false);
  
  // Global timer state
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerIsActive, setTimerIsActive] = useState(false);
  const [timerIsBreak, setTimerIsBreak] = useState(false);
  const [timerCompletedPomodoros, setTimerCompletedPomodoros] = useState(0);
  const [originalFocusMinutes, setOriginalFocusMinutes] = useState(25);

  useEffect(() => {
    // Only save if we have actual data (not just the initial empty state)
    if (Object.keys(appData.dailyData).length > 0 || (appData.notes && appData.notes.length > 0) || (appData.habits && appData.habits.length > 0)) {
      saveAppData(appData);
    }
  }, [appData]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Global timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerIsActive && (timerMinutes > 0 || timerSeconds > 0)) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(timerSeconds - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes(timerMinutes - 1);
          setTimerSeconds(59);
        }
      }, 1000);
    } else if (timerMinutes === 0 && timerSeconds === 0 && timerIsActive) {
      // Timer finished - play sound and show notification
      setTimerIsActive(false);
      
      // Play notification sound with better error handling
      try {
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
        audio.volume = 0.5;
        audio.play().catch(e => {
          console.log('Audio play failed:', e);
          // Fallback: try to play a simple beep using Web Audio API
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
          } catch (fallbackError) {
            console.log('Fallback audio also failed:', fallbackError);
          }
        });
      } catch (error) {
        console.log('Audio creation failed:', error);
      }
      
      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(timerIsBreak ? 'Break Complete!' : 'Focus Session Complete!', {
          body: timerIsBreak ? 'Time to get back to work!' : 'Great job! Take a break.',
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      }
      
      // Show toast notification
      showToast(timerIsBreak ? 'Break complete! Time to focus.' : 'Focus session complete! Take a break.');
      
      if (!timerIsBreak) {
        // Completed a focus session
        setTimerCompletedPomodoros(prev => prev + 1);
        // Play completion sound
        try {
          const audio = new Audio('/sounds/notify.wav');
          audio.volume = 0.5;
          audio.play().catch(e => {
            console.log('Timer audio play failed:', e);
          });
        } catch (error) {
          console.log('Timer audio creation failed:', error);
        }
        addPoints(15, 'Pomodoro focus session completed');
        setTimerIsBreak(true);
        setTimerMinutes(5);
        setTimerSeconds(0);
      } else {
        // Completed a break
        setTimerIsBreak(false);
        setTimerMinutes(originalFocusMinutes);
        setTimerSeconds(0);
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerIsActive, timerMinutes, timerSeconds, timerIsBreak, showToast]);

  // Timer control functions
  const toggleTimer = () => {
    // Request notification permission on first timer start
    if (!timerIsActive && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setTimerIsActive(!timerIsActive);
  };

  const resetTimer = () => {
    setTimerIsActive(false);
    setTimerIsBreak(false);
    setTimerMinutes(25);
    setTimerSeconds(0);
    setOriginalFocusMinutes(25);
  };

  const setCustomTimer = (minutes: number) => {
    setTimerIsActive(false);
    setTimerIsBreak(false);
    setTimerMinutes(minutes);
    setTimerSeconds(0);
    setOriginalFocusMinutes(minutes);
  };

  // Reset completion states when modals close
  useEffect(() => {
    if (!morningFlowOpen) {
      setMorningFlowCompleted(false);
    }
  }, [morningFlowOpen]);

  useEffect(() => {
    if (!eveningFlowOpen) {
      setEveningFlowCompleted(false);
    }
  }, [eveningFlowOpen]);

  const handleResetData = () => {
    clearAppData();
    setAppData({
      totalPoints: 0,
      currentStreak: 0,
      dailyData: {},
      habits: [],
      notes: []
    });
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const updateDailyData = async (data: Partial<DailyData>) => {
    const today = new Date().toDateString();
    console.log('updateDailyData called with:', { today, data });
    console.log('appData.dailyData[today] before:', appData.dailyData[today]);
    
    const updatedData = {
      ...appData,
      dailyData: {
        ...appData.dailyData,
        [today]: {
          ...appData.dailyData[today],
          ...data,
        }
      }
    };
    
    console.log('updatedData.dailyData[today] after:', updatedData.dailyData[today]);
    
    setAppData(updatedData);
    
    // Update sync status
    setSyncStatus('syncing');
    try {
      await saveAppData(updatedData);
      setSyncStatus('synced');
    } catch (error) {
      console.error('Failed to save data:', error);
      setSyncStatus('error');
    }
  };

  const calculateTotalPoints = () => {
    let total = 0;
    Object.values(appData.dailyData).forEach(dayData => {
      total += calculatePointsForDay(dayData);
    });
    return total;
  };

  const calculateTodaysPoints = (): number => {
    const dayData = getTodaysData();
    let points = 0;
    
    // Morning check-in completed
    if (dayData.sleepQuality && dayData.morningMood && dayData.mainPriority) points += 10;
    // Evening review completed
    if (dayData.eveningMood && dayData.dayDescription) points += 10;
    // Top priority completed
    if (dayData.completedMainTask) points += 50;
    // Tasks completed
    if (dayData.completedTasks) points += dayData.completedTasks.filter(Boolean).length * 25;
    // Connected with people
    if (dayData.completedPeople) points += dayData.completedPeople.filter(Boolean).length * 30;
    // Habits completed
    if (dayData.completedHabits) points += dayData.completedHabits.length * 30;
    // Basics (each 10 points)
    if (dayData.basics) {
      const { drankWater, ateHealthy, listenedToSomething, wasMindful, steps10k, sleep7h } = dayData.basics;
      points += (drankWater ? 10 : 0)
        + (ateHealthy ? 10 : 0)
        + (listenedToSomething ? 10 : 0)
        + (wasMindful ? 10 : 0)
        + (steps10k ? 10 : 0)
        + (sleep7h ? 10 : 0);
    }
    // Add points from onAddPoints calls (dread, reframes, etc.)
    if (dayData.points) {
      points += dayData.points;
    }
    
    return points;
  };

  const calculatePointsForDay = (dayData?: DailyData): number => {
    if (!dayData) return 0;
    let points = 0;
    
    // Morning check-in completed
    if (dayData.sleepQuality && dayData.morningMood && dayData.mainPriority) points += 10;
    // Evening review completed
    if (dayData.eveningMood && dayData.dayDescription) points += 10;
    // Top priority completed
    if (dayData.completedMainTask) points += 50;
    // Tasks completed
    if (dayData.completedTasks) points += dayData.completedTasks.filter(Boolean).length * 25;
    // Connected with people
    if (dayData.completedPeople) points += dayData.completedPeople.filter(Boolean).length * 30;
    // Habits completed
    if (dayData.completedHabits) points += dayData.completedHabits.length * 30;
    // Basics (each 10 points)
    if (dayData.basics) {
      const { drankWater, ateHealthy, listenedToSomething, wasMindful, steps10k, sleep7h } = dayData.basics;
      points += (drankWater ? 10 : 0)
        + (ateHealthy ? 10 : 0)
        + (listenedToSomething ? 10 : 0)
        + (wasMindful ? 10 : 0)
        + (steps10k ? 10 : 0)
        + (sleep7h ? 10 : 0);
    }
    // Add points from onAddPoints calls (dread, reframes, etc.)
    if (dayData.points) {
      points += dayData.points;
    }
    
    return points;
  };

  const calculatePointsBreakdown = () => {
    const dayData = getTodaysData();
    const breakdown = {
      morningCheckin: 0,
      eveningReview: 0,
      priorityTask: 0,
      tasks: 0,
      habits: 0,
      basics: 0,
      connections: 0,
      dread: 0,
      pomodoro: 0
    };

    // Morning check-in completed
    if (dayData.sleepQuality && dayData.morningMood && dayData.mainPriority) {
      breakdown.morningCheckin = 10;
    }

    // Evening review completed
    if (dayData.eveningMood && dayData.dayDescription) {
      breakdown.eveningReview = 10;
    }

    // Top priority completed
    if (dayData.completedMainTask) {
      breakdown.priorityTask = 50;
    }

    // Tasks completed
    if (dayData.completedTasks) {
      breakdown.tasks = dayData.completedTasks.filter(Boolean).length * 25;
    }

    // Connected with people
    if (dayData.completedPeople) {
      breakdown.connections = dayData.completedPeople.filter(Boolean).length * 30;
    }

    // Habits completed
    if (dayData.completedHabits) {
      breakdown.habits = dayData.completedHabits.length * 30;
    }

    // Basics (each 10 points)
    if (dayData.basics) {
      const { drankWater, ateHealthy, listenedToSomething, wasMindful, steps10k, sleep7h } = dayData.basics;
      breakdown.basics = (drankWater ? 10 : 0)
        + (ateHealthy ? 10 : 0)
        + (listenedToSomething ? 10 : 0)
        + (wasMindful ? 10 : 0)
        + (steps10k ? 10 : 0)
        + (sleep7h ? 10 : 0);
    }

    // Points from onAddPoints calls (dread, reframes, pomodoro, etc.)
    if (dayData.points) {
      // We'll need to track these separately, but for now we'll show them as "dread"
      // This is a simplified approach - in a real app you might want to track each type separately
      breakdown.dread = dayData.points;
    }

    return breakdown;
  };

  const handlePointsReset = () => {
    const newPoints = parseInt(pointsResetValue);
    if (!isNaN(newPoints) && newPoints >= 0) {
      // Update today's points to the new value
      const today = new Date().toDateString();
      updateDailyData({ points: newPoints });
      
      // Reset the input and hide the reset section
      setPointsResetValue('');
      setShowPointsReset(false);
      setShowSettings(false);
    }
  };

  const addPoints: AddPointsFn = (points, reason) => {
    if (points !== 0) {
      // Store points in today's daily data
      const today = getTodaysKey();
      
      // Use a callback to get the most up-to-date state
      setAppData(prevAppData => {
        const todaysData = prevAppData.dailyData[today] || {};
        const currentPoints = todaysData.points || 0;
        
        const updatedData = {
          ...prevAppData,
          dailyData: {
            ...prevAppData.dailyData,
            [today]: {
              ...todaysData,
              points: currentPoints + points
            }
          }
        };
        
        return updatedData;
      });
      
      // Show toast
      const sign = points > 0 ? '+' : '';
      showToast(`${sign}${points} points${reason ? ` — ${reason}` : ''}`, 3000, reason);
    }
  };

  const getTodaysData = (): DailyData => {
    const today = new Date().toDateString();
    return appData.dailyData[today] || {};
  };

  const hasCompletedMorningFlow = () => {
    const todaysData = getTodaysData();
    return !!(todaysData.sleepQuality && todaysData.morningMood && todaysData.mainPriority);
  };

  const hasCompletedEveningFlow = () => {
    const todaysData = getTodaysData();
    return !!(todaysData.eveningMood && todaysData.dayDescription);
  };

  const calculateMorningStreak = (): number => {
    let streak = 0;
    const date = new Date();

    const isMorningComplete = (data: DailyData | undefined): boolean => {
      if (!data) return false;
      return !!(data.sleepQuality && data.morningMood && data.mainPriority);
    };

    // Count consecutive days ending today where morning check-in is complete
    while (true) {
      const key = date.toDateString();
      const dayData = appData.dailyData[key];
      if (isMorningComplete(dayData)) {
        streak += 1;
        // Move to previous day
        date.setDate(date.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const calculateLongestMorningStreak = (): number => {
    // Build a set of date-only strings for days with completed morning
    const completeDays = new Set<string>();
    Object.entries(appData.dailyData).forEach(([key, data]) => {
      if (data && data.sleepQuality && data.morningMood && data.mainPriority) {
        completeDays.add(new Date(key).toDateString());
      }
    });

    const allDates = Array.from(completeDays)
      .map(d => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime());

    let longest = 0;
    let current = 0;
    let prev: Date | null = null;
    for (const d of allDates) {
      if (prev) {
        const prevNext = new Date(prev);
        prevNext.setDate(prevNext.getDate() + 1);
        if (prevNext.toDateString() === d.toDateString()) {
          current += 1;
        } else {
          current = 1;
        }
      } else {
        current = 1;
      }
      if (current > longest) longest = current;
      prev = d;
    }
    return longest;
  };

  const calculatePreviousHighScore = (): number => {
    // Highest score before today
    let high = 0;
    const todayKey = new Date().toDateString();
    Object.entries(appData.dailyData).forEach(([key, day]) => {
      if (key === todayKey) return;
      high = Math.max(high, calculatePointsForDay(day));
    });
    return high;
  };

  const getTodaysKey = () => new Date().toDateString();

  const saveTimeBlocks = async (blocks: TimeBlock[]) => {
    const key = getTodaysKey();
    const updatedData = {
      ...appData,
      dailyData: {
        ...appData.dailyData,
        [key]: {
          ...appData.dailyData[key],
          timeBlocks: blocks,
        }
      }
    };
    setAppData(updatedData);
    
    // Update sync status
    setSyncStatus('syncing');
    try {
      await saveAppData(updatedData);
      setSyncStatus('synced');
    } catch (error) {
      console.error('Failed to save time blocks:', error);
      setSyncStatus('error');
    }
  };

  const triggerTimeblock = (label: string, category: Category) => {
    setTimeblockIntent({ label, category });
    setCurrentView('timeblocking');
  };

  const saveNotes = async (updater: (prev: Note[]) => Note[]) => {
    const nextNotes = updater(appData.notes || []);
    const updated = { ...appData, notes: nextNotes };
    console.log('[DEBUG] Saving notes, updated appData:', updated);
    setAppData(updated);
    
    // Update sync status
    setSyncStatus('syncing');
    try {
      await saveAppData(updated);
      setSyncStatus('synced');
    } catch (error) {
      console.error('Failed to save notes:', error);
      setSyncStatus('error');
    }
  };

  const addNote = (text: string, color: string) => {
    const now = new Date().toISOString();
    console.log('[DEBUG] Adding note:', { text, color, now });
    saveNotes(prev => {
      const newNotes = [{ id: crypto.randomUUID(), text, color, createdAt: now }, ...prev];
      console.log('[DEBUG] New notes array:', newNotes);
      return newNotes;
    });
  };

  const updateNote = (id: string, text: string, color: string) => {
    const now = new Date().toISOString();
    saveNotes(prev => prev.map(n => n.id === id ? { ...n, text, color, updatedAt: now } : n));
  };

  const deleteNote = (id: string) => {
    saveNotes(prev => prev.filter(n => n.id !== id));
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if Supabase is configured and user is not authenticated
  if (hasSupabaseConfig && !isAuthenticated) {
    return <Auth isDarkMode={isDarkMode} onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
    }`}>
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        totalPoints={calculateTotalPoints()}
        currentStreak={calculateMorningStreak()}
        longestStreak={calculateLongestMorningStreak()}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        todaysPoints={calculateTodaysPoints()}
        highScore={calculatePreviousHighScore()}
        pointsDeltaFromHigh={calculateTodaysPoints() - calculatePreviousHighScore()}
        onSignOut={handleSignOut}
        isMobileOpen={mobileSidebarOpen}
        onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        timerIsActive={timerIsActive}
        timerIsBreak={timerIsBreak}
        timerMinutes={timerMinutes}
        timerSeconds={timerSeconds}
        onToggleTimer={toggleTimer}
        syncStatus={syncStatus}
        originalFocusMinutes={originalFocusMinutes}
        onUpdateDailyData={updateDailyData}
        onOpenSettings={() => setShowSettings(true)}
        onOpenPointsBreakdown={() => setShowPointsBreakdown(true)}
        pointsBreakdown={calculatePointsBreakdown()}
      />

      {/* Points Breakdown Modal */}
      {showPointsBreakdown && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPointsBreakdown(false)}
          />
          
          {/* Modal */}
          <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl border animate-slide-up ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div>
                <h3 className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Today's Points Breakdown</h3>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Total: {calculateTodaysPoints()} points</p>
              </div>
              <button
                onClick={() => setShowPointsBreakdown(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {calculatePointsBreakdown() ? (
                <>
                  {/* Morning Check-in */}
                  {calculatePointsBreakdown().morningCheckin > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-lg overflow-hidden">
                          <img src={visionImg} alt="Morning Check-in" className="w-full h-full object-cover" />
                        </div>
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Morning Check-in</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">+{calculatePointsBreakdown().morningCheckin}</span>
                    </div>
                  )}

                  {/* Evening Review */}
                  {calculatePointsBreakdown().eveningReview > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-lg overflow-hidden">
                          <img src={visionImg} alt="Evening Review" className="w-full h-full object-cover" />
                        </div>
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Evening Review</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">+{calculatePointsBreakdown().eveningReview}</span>
                    </div>
                  )}

                  {/* Priority Task */}
                  {calculatePointsBreakdown().priorityTask > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-lg overflow-hidden">
                          <img src={priorityImg} alt="Priority Task" className="w-full h-full object-cover" />
                        </div>
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Priority Task</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">+{calculatePointsBreakdown().priorityTask}</span>
                    </div>
                  )}

                  {/* Tasks */}
                  {calculatePointsBreakdown().tasks > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-lg overflow-hidden">
                          <img src={tasksImg} alt="Tasks" className="w-full h-full object-cover" />
                        </div>
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Tasks Completed</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">+{calculatePointsBreakdown().tasks}</span>
                    </div>
                  )}

                  {/* Habits */}
                  {calculatePointsBreakdown().habits > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-lg overflow-hidden">
                          <img src={guitarImg} alt="Habits" className="w-full h-full object-cover" />
                        </div>
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Habits Completed</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">+{calculatePointsBreakdown().habits}</span>
                    </div>
                  )}

                  {/* Basics */}
                  {calculatePointsBreakdown().basics > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-lg overflow-hidden">
                          <img src={basicsImg} alt="Basics" className="w-full h-full object-cover" />
                        </div>
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Basics Completed</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">+{calculatePointsBreakdown().basics}</span>
                    </div>
                  )}

                  {/* Connections */}
                  {calculatePointsBreakdown().connections > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-lg overflow-hidden">
                          <img src={connectImg} alt="Connections" className="w-full h-full object-cover" />
                        </div>
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Connections</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">+{calculatePointsBreakdown().connections}</span>
                    </div>
                  )}

                  {/* Dread */}
                  {calculatePointsBreakdown().dread > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-lg overflow-hidden">
                          <img src={monsterImg} alt="Dread" className="w-full h-full object-cover" />
                        </div>
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Dread Management</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">+{calculatePointsBreakdown().dread}</span>
                    </div>
                  )}

                  {/* Pomodoro */}
                  {calculatePointsBreakdown().pomodoro > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-lg overflow-hidden">
                          <img src={focusImg} alt="Pomodoro" className="w-full h-full object-cover" />
                        </div>
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Pomodoro Sessions</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">+{calculatePointsBreakdown().pomodoro}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className={`text-center py-8 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No points breakdown available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <header className={`fixed top-0 left-0 right-0 z-30 md:hidden ${
        (morningFlowOpen || eveningFlowOpen) ? 'hidden' : ''
      } ${
        isDarkMode 
          ? 'bg-gray-900/90 backdrop-blur-sm border-b border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm border-b border-gray-200'
      }`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-blue-500/30">
              <img src={visionImg} alt="Twist" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Twist</h1>
              <p className={`text-xs ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} · {calculateTodaysPoints()} pts
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'text-gray-300 hover:bg-gray-800' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={`transition-all duration-300 ml-0 ${
        sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
      } px-4 py-4 pt-20 md:pt-8`}>
        {currentView === 'dashboard' && (
          <Dashboard
            todaysData={getTodaysData()}
            onStartMorning={() => setMorningFlowOpen(true)}
            onStartEvening={() => setEveningFlowOpen(true)}
            onUpdateData={updateDailyData}
            onAddPoints={addPoints}
            hasCompletedMorning={hasCompletedMorningFlow()}
            hasCompletedEvening={hasCompletedEveningFlow()}
            onResetData={handleResetData}
            isDarkMode={isDarkMode}
            onTimeblock={(label: string, category: Category) => triggerTimeblock(label, category)}
          />
        )}

        {/* Morning Flow Modal */}
        <FullScreenModal
          isOpen={morningFlowOpen}
          onClose={() => setMorningFlowOpen(false)}
          isCompleted={morningFlowCompleted}
          isDarkMode={isDarkMode}
        >
          <MorningFlow
            onComplete={(data) => {
              updateDailyData(data);
              setMorningFlowCompleted(true);
              // Show toast for morning check-in completion
              showToast('+10 points — Morning check-in completed', 3000, 'Morning check-in completed');
            }}
            onBack={() => setMorningFlowOpen(false)}
            existingData={getTodaysData()}
            isDarkMode={isDarkMode}
          />
        </FullScreenModal>

        {/* Evening Flow Modal */}
        <FullScreenModal
          isOpen={eveningFlowOpen}
          onClose={() => setEveningFlowOpen(false)}
          isCompleted={eveningFlowCompleted}
          isDarkMode={isDarkMode}
        >
          <EveningFlow
            onComplete={(data) => {
              updateDailyData(data);
              setEveningFlowCompleted(true);
              // Show toast for evening review completion
              showToast('+10 points — Evening review completed', 3000, 'Evening review completed');
            }}
            onBack={() => setEveningFlowOpen(false)}
            existingData={getTodaysData()}
            isDarkMode={isDarkMode}
          />
        </FullScreenModal>

        {currentView === 'weekly' && (
          <WeeklyLog
            appData={appData}
            isDarkMode={isDarkMode}
          />
        )}

        {currentView === 'habits' && (
          <Habits
            appData={appData}
            todaysData={getTodaysData()}
            onUpdateData={updateDailyData}
            onAddPoints={addPoints}
            isDarkMode={isDarkMode}
            onTimeblock={(label: string, category: Category) => triggerTimeblock(label, category)}
          />
        )}

        {currentView === 'basics' && (
          <Basics
            appData={appData}
            todaysData={getTodaysData()}
            onUpdateData={updateDailyData}
            onAddPoints={addPoints}
            isDarkMode={isDarkMode}
            onTimeblock={(label: string, category: Category) => triggerTimeblock(label, category)}
          />
        )}

        {currentView === 'dread' && (
          <Dread
            appData={appData}
            todaysData={getTodaysData()}
            onUpdateData={updateDailyData}
            onAddPoints={addPoints}
            isDarkMode={isDarkMode}
            onTimeblock={(label: string, category: Category) => triggerTimeblock(label, category)}
          />
        )}

        {currentView === 'timer' && (
          <TimerView
            onBack={() => setCurrentView('dashboard')}
            onAddPoints={addPoints}
            isDarkMode={isDarkMode}
            timerMinutes={timerMinutes}
            timerSeconds={timerSeconds}
            timerIsActive={timerIsActive}
            timerIsBreak={timerIsBreak}
            timerCompletedPomodoros={timerCompletedPomodoros}
            onToggleTimer={toggleTimer}
            onResetTimer={resetTimer}
            onSetCustomTimer={setCustomTimer}
            originalFocusMinutes={originalFocusMinutes}
          />
        )}

        {currentView === 'timeblocking' && (
          <Timeblocking
            isDarkMode={isDarkMode}
            todaysDate={new Date()}
            timeBlocks={getTodaysData().timeBlocks || []}
            onSaveBlocks={saveTimeBlocks}
            presetIntent={timeblockIntent}
            onConsumeIntent={() => setTimeblockIntent(null)}
          />
        )}

        {currentView === 'points' && (
          <Points
            onBack={() => setCurrentView('dashboard')}
            isDarkMode={isDarkMode}
          />
        )}

        {currentView === 'notes' && (
          <Notes
            notes={appData.notes || []}
            onAdd={addNote}
            onUpdate={updateNote}
            onDelete={deleteNote}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={`w-full max-w-md rounded-2xl shadow-xl border transform transition-all duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h2>
              </div>
              <div className="p-5 space-y-4">
                {/* Dark Mode Toggle */}
                <button
                  onClick={() => {
                    setIsDarkMode(!isDarkMode);
                    setShowSettings(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-yellow-400' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  <span className="font-medium">
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </button>

                {/* Points Reset Section */}
                <div className={`p-4 rounded-lg border ${
                  isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Reset Today's Points</h3>
                    <button
                      onClick={() => setShowPointsReset(!showPointsReset)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        isDarkMode 
                          ? 'text-blue-400 hover:text-blue-300' 
                          : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      {showPointsReset ? 'Cancel' : 'Reset'}
                    </button>
                  </div>
                  
                  {showPointsReset && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={pointsResetValue}
                          onChange={(e) => setPointsResetValue(e.target.value)}
                          placeholder="Enter new points total"
                          className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                            isDarkMode 
                              ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          min="0"
                        />
                        <button
                          onClick={handlePointsReset}
                          disabled={!pointsResetValue.trim()}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            pointsResetValue.trim()
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Set
                        </button>
                      </div>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Current: {calculateTodaysPoints()} points • This will overwrite today's points total
                      </p>
                    </div>
                  )}
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={() => {
                    handleSignOut();
                    setShowSettings(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-red-400' 
                      : 'hover:bg-gray-100 text-red-600'
                  }`}
                >
                  <LogOut size={20} />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
              <div className={`px-5 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setShowSettings(false)}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;