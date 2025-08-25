import React, { useState, useEffect } from 'react';
import { Sun, Moon, BarChart3, Play, Pause, RotateCcw } from 'lucide-react';
import MorningFlow from './components/MorningFlow';
import Dashboard from './components/Dashboard';
import EveningFlow from './components/EveningFlow';
import WeeklyLog from './components/WeeklyLog';
import TimerView from './components/TimerView';
import Habits from './components/Habits';
import Sidebar from './components/Sidebar';
import FullScreenModal from './components/FullScreenModal';
import { AppData, DailyData } from './types';
import { initializeAppData, saveAppData, loadAppData, clearAppData } from './utils/storage';

type View = 'dashboard' | 'morning' | 'evening' | 'weekly' | 'timer';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [morningFlowOpen, setMorningFlowOpen] = useState(false);
  const [eveningFlowOpen, setEveningFlowOpen] = useState(false);
  const [morningFlowCompleted, setMorningFlowCompleted] = useState(false);
  const [eveningFlowCompleted, setEveningFlowCompleted] = useState(false);
  const [appData, setAppData] = useState<AppData>(() => loadAppData());
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

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
    setAppData(initializeAppData());
  };

  const updateDailyData = (data: Partial<DailyData>) => {
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
    saveAppData(updatedData);
  };

  const calculateTotalPoints = () => {
    let total = 0;
    
    // Calculate points from all daily data
    Object.values(appData.dailyData).forEach(dayData => {
      // Morning flow completion: 5 points
      if (dayData.sleepQuality && dayData.morningMood && dayData.mainPriority) {
        total += 5;
      }
      
      // Evening flow completion: 5 points
      if (dayData.eveningMood && dayData.winOfDay) {
        total += 5;
      }
      
      // Main priority completion: 50 points
      if (dayData.completedMainTask) {
        total += 50;
      }
      
      // Additional tasks: 10 points each
      if (dayData.completedTasks) {
        total += dayData.completedTasks.filter(Boolean).length * 10;
      }
      
      // People to message: 5 points each
      if (dayData.completedPeople) {
        total += dayData.completedPeople.filter(Boolean).length * 5;
      }
      
      // Habits completion: 15 points each
      if (dayData.completedHabits) {
        total += dayData.completedHabits.length * 15;
      }
      
      // Water glasses: 5 points each
      if (dayData.waterGlasses) {
        total += dayData.waterGlasses * 5;
      }
    });
    
    return total;
  };

  const addPoints = (points: number) => {
    // This function is kept for backward compatibility but points are now calculated automatically
    console.log(`Points calculation is now automatic. ${points} points would have been added.`);
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
    return !!(todaysData.eveningMood && todaysData.winOfDay);
  };

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
      />

      {/* Main Content */}
      <main className={`max-w-6xl mx-auto px-4 py-8 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {currentView === 'dashboard' && (
          <Dashboard
            appData={appData}
            todaysData={getTodaysData()}
            onStartMorning={() => setMorningFlowOpen(true)}
            onStartEvening={() => setEveningFlowOpen(true)}
            onUpdateData={updateDailyData}
            onAddPoints={addPoints}
            hasCompletedMorning={hasCompletedMorningFlow()}
            hasCompletedEvening={hasCompletedEveningFlow()}
            onResetData={handleResetData}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Morning Flow Modal */}
        <FullScreenModal
          isOpen={morningFlowOpen}
          onClose={() => setMorningFlowOpen(false)}
          isCompleted={morningFlowCompleted}
        >
          <MorningFlow
            onComplete={(data) => {
              updateDailyData(data);
              addPoints(5);
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
        >
          <EveningFlow
            onComplete={(data) => {
              updateDailyData(data);
              addPoints(5);
              setEveningFlowCompleted(true);
            }}
            onBack={() => setEveningFlowOpen(false)}
            existingData={getTodaysData()}
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
          />
        )}

        {currentView === 'timer' && (
          <TimerView
            onBack={() => setCurrentView('dashboard')}
            onAddPoints={addPoints}
            isDarkMode={isDarkMode}
          />
        )}
      </main>
    </div>
  );
}

export default App;