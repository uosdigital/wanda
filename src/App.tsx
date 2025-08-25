import React, { useState, useEffect } from 'react';
import { Sun, Moon, BarChart3, Play, Pause, RotateCcw } from 'lucide-react';
import MorningFlow from './components/MorningFlow';
import Dashboard from './components/Dashboard';
import EveningFlow from './components/EveningFlow';
import WeeklyLog from './components/WeeklyLog';
import { AppData, DailyData } from './types';
import { initializeAppData, saveAppData, loadAppData } from './utils/storage';

type View = 'dashboard' | 'morning' | 'evening' | 'weekly';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [appData, setAppData] = useState<AppData>(() => loadAppData());

  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

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
  };

  const addPoints = (points: number) => {
    setAppData(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + points
    }));
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FlowFocus</h1>
                <p className="text-sm text-gray-600">{appData.totalPoints} points · Day {appData.currentStreak}</p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentView === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('weekly')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  currentView === 'weekly' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 size={18} />
                <span>Weekly</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {currentView === 'dashboard' && (
          <Dashboard
            appData={appData}
            todaysData={getTodaysData()}
            onStartMorning={() => setCurrentView('morning')}
            onStartEvening={() => setCurrentView('evening')}
            onUpdateData={updateDailyData}
            onAddPoints={addPoints}
            hasCompletedMorning={hasCompletedMorningFlow()}
            hasCompletedEvening={hasCompletedEveningFlow()}
          />
        )}

        {currentView === 'morning' && (
          <MorningFlow
            onComplete={(data) => {
              updateDailyData(data);
              addPoints(5);
              setCurrentView('dashboard');
            }}
            onBack={() => setCurrentView('dashboard')}
            existingData={getTodaysData()}
          />
        )}

        {currentView === 'evening' && (
          <EveningFlow
            onComplete={(data) => {
              updateDailyData(data);
              addPoints(5);
              setCurrentView('dashboard');
            }}
            onBack={() => setCurrentView('dashboard')}
            existingData={getTodaysData()}
          />
        )}

        {currentView === 'weekly' && (
          <WeeklyLog
            appData={appData}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
      </main>
    </div>
  );
}

export default App;