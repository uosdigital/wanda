import { useState, useEffect } from 'react';
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
import { TimeBlock } from './types';
import { supabase, hasSupabaseConfig } from './utils/supabase';

type View = 'dashboard' | 'morning' | 'evening' | 'weekly' | 'timer' | 'habits' | 'timeblocking' | 'points' | 'notes';

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

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadAppData();
        setAppData(data);
      } catch (error) {
        console.error('Failed to load app data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      if (hasSupabaseConfig) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          setIsAuthenticated(!!user);
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });
  const [timeblockIntent, setTimeblockIntent] = useState<{ label: string; category: Category } | null>(null);

  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
      habits: []
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
    setAppData(updatedData);
    await saveAppData(updatedData);
  };

  const calculateTotalPoints = () => {
    let total = 0;
    Object.values(appData.dailyData).forEach(dayData => {
      // Morning check-in completed
      if (dayData.sleepQuality && dayData.morningMood && dayData.mainPriority) total += 10;
      // Evening review completed (use dayDescription instead of winOfDay per current flow)
      if (dayData.eveningMood && dayData.dayDescription) total += 10;
      // Top priority completed
      if (dayData.completedMainTask) total += 50;
      // Tasks completed
      if (dayData.completedTasks) total += dayData.completedTasks.filter(Boolean).length * 25;
      // Connected with people
      if (dayData.completedPeople) total += dayData.completedPeople.filter(Boolean).length * 30;
      // Habits completed
      if (dayData.completedHabits) total += dayData.completedHabits.length * 30;
      // Basics (each 10 points)
      if (dayData.basics) {
        const { drankWater, ateHealthy, listenedToSomething, wasMindful, steps10k, sleep7h } = dayData.basics;
        total += (drankWater ? 10 : 0)
          + (ateHealthy ? 10 : 0)
          + (listenedToSomething ? 10 : 0)
          + (wasMindful ? 10 : 0)
          + (steps10k ? 10 : 0)
          + (sleep7h ? 10 : 0);
      }
    });
    return total;
  };

  const calculateTodaysPoints = (): number => {
    const dayData = getTodaysData();
    let points = 0;
    if (dayData.sleepQuality && dayData.morningMood && dayData.mainPriority) points += 10;
    if (dayData.eveningMood && dayData.dayDescription) points += 10;
    if (dayData.completedMainTask) points += 50;
    if (dayData.completedTasks) points += dayData.completedTasks.filter(Boolean).length * 25;
    if (dayData.completedPeople) points += dayData.completedPeople.filter(Boolean).length * 30;
    if (dayData.completedHabits) points += dayData.completedHabits.length * 30;
    if (dayData.basics) {
      const { drankWater, ateHealthy, listenedToSomething, wasMindful, steps10k, sleep7h } = dayData.basics;
      points += (drankWater ? 10 : 0)
        + (ateHealthy ? 10 : 0)
        + (listenedToSomething ? 10 : 0)
        + (wasMindful ? 10 : 0)
        + (steps10k ? 10 : 0)
        + (sleep7h ? 10 : 0);
    }
    return points;
  };

  const addPoints: AddPointsFn = (points, reason) => {
    if (points && points > 0) {
      showToast(`+${points} points${reason ? ` — ${reason}` : ''}`);
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
    await saveAppData(updatedData);
  };

  const triggerTimeblock = (label: string, category: Category) => {
    setTimeblockIntent({ label, category });
    setCurrentView('timeblocking');
  };

  const saveNotes = async (updater: (prev: Note[]) => Note[]) => {
    const nextNotes = updater(appData.notes || []);
    const updated = { ...appData, notes: nextNotes };
    setAppData(updated);
    await saveAppData(updated);
  };

  const addNote = (text: string, color: string) => {
    const now = new Date().toISOString();
    saveNotes(prev => [{ id: crypto.randomUUID(), text, color, createdAt: now }, ...prev]);
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
        currentStreak={appData.currentStreak}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        todaysPoints={calculateTodaysPoints()}
        onSignOut={handleSignOut}
        isMobileOpen={mobileSidebarOpen}
        onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Main Content */}
      <main className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      } md:ml-64 px-4 py-4 pt-16 md:pt-8`}>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className={`fixed top-4 left-4 z-30 p-3 rounded-lg transition-colors md:hidden ${
            isDarkMode 
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          } shadow-lg border ${
            isDarkMode ? 'border-gray-600' : 'border-gray-200'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
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
              addPoints(10, 'Morning check-in completed');
              setMorningFlowCompleted(true);
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
              addPoints(10, 'Evening review completed');
              setEveningFlowCompleted(true);
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

        {currentView === 'timer' && (
          <TimerView
            onBack={() => setCurrentView('dashboard')}
            onAddPoints={addPoints}
            isDarkMode={isDarkMode}
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
      </main>
    </div>
  );
}

export default App;