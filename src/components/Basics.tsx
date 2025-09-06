import React, { useState } from 'react';
import { DailyData, AppData } from '../types';
import { useToast } from './ToastProvider';
import healthyImg from '../../images/healthy.jpg';
import listenImg from '../../images/listen.jpg';
import mindfulImg from '../../images/mindful.jpg';
import runImg from '../../images/run.jpg';
import basicsImg from '../../images/basics.jpg';

interface BasicsProps {
  appData: AppData;
  todaysData: DailyData;
  onUpdateData: (data: Partial<DailyData>) => void;
  onAddPoints: (points: number, reason?: string) => void;
  isDarkMode: boolean;
  onTimeblock?: (label: string, category: 'priority' | 'task' | 'habit' | 'connect' | 'custom') => void;
}

const Basics: React.FC<BasicsProps> = ({
  appData,
  todaysData,
  onUpdateData,
  onAddPoints,
  isDarkMode,
  onTimeblock
}) => {
  const { showToast } = useToast();
  const [currentWeekOffset, setCurrentWeekOffset] = React.useState(0);
  const [selectedDay, setSelectedDay] = React.useState<{
    date: Date;
    dateStr: string;
    data: any;
    dayName: string;
    dayNumber: number;
  } | null>(null);

  // Map basic IDs to custom images
  const basicImageMap: { [key: string]: string } = {
    drankWater: basicsImg,
    ateHealthy: healthyImg,
    listenedToSomething: listenImg,
    wasMindful: mindfulImg,
    steps10k: runImg,
    sleep7h: basicsImg,
  };

  const basicOptions = [
    { id: 'drankWater', label: 'Drink enough water' },
    { id: 'ateHealthy', label: 'Eat healthy meals' },
    { id: 'listenedToSomething', label: 'Listen to something interesting' },
    { id: 'wasMindful', label: 'Be mindful' },
    { id: 'steps10k', label: '10k steps' },
    { id: 'sleep7h', label: '7+ hours sleep' }
  ];

  const toggleBasic = (basicId: string) => {
    const currentBasics = todaysData.basics || {};
    const isCompleted = currentBasics[basicId as keyof typeof currentBasics] || false;
    
    const newBasics = {
      ...currentBasics,
      [basicId]: !isCompleted
    };
    
    if (!isCompleted) {
      showToast('+10 points — Basic completed', 3000, 'Basic completed');
    } else {
      showToast('-10 points — Basic unchecked', 3000, 'Basic unchecked');
    }
    
    onUpdateData({ basics: newBasics });
  };

  const getBasicProgress = () => {
    const completedBasics = todaysData.basics || {};
    const completedCount = Object.values(completedBasics).filter(Boolean).length;
    return (completedCount / basicOptions.length) * 100;
  };

  // Get weekly basics data
  const getWeeklyBasicsData = React.useMemo(() => {
    const weekData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i + (currentWeekOffset * 7));
      const dateStr = date.toDateString();
      const dayData = appData.dailyData[dateStr];
      
      weekData.push({
        date,
        dateStr,
        data: dayData,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate()
      });
    }
    
    return weekData;
  }, [appData.dailyData, currentWeekOffset]);

  const getBasicStatusForDay = (dayData: any, basicId: string) => {
    if (!dayData || !dayData.basics) return false;
    return dayData.basics[basicId] || false;
  };

  const getBasicLabel = (basicId: string) => {
    const basic = basicOptions.find(b => b.id === basicId);
    return basic ? basic.label : basicId;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
        isDarkMode 
          ? 'bg-gray-800/80 border-gray-700' 
          : 'bg-white/80 border-gray-100'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Basics</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Track your daily fundamentals
            </p>
          </div>
          
          {/* Progress */}
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {Math.round(getBasicProgress())}%
            </div>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {Object.values(todaysData.basics || {}).filter(Boolean).length} of {basicOptions.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`w-full h-2 rounded-full overflow-hidden ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${getBasicProgress()}%` }}
          />
        </div>
      </div>

      {/* Today's Basics */}
      <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
        isDarkMode 
          ? 'bg-gray-800/80 border-gray-700' 
          : 'bg-white/80 border-gray-100'
      }`}>
        <h2 className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Today's Basics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {basicOptions.map((basic) => {
            const isCompleted = todaysData.basics?.[basic.id as keyof typeof todaysData.basics] || false;
            const image = basicImageMap[basic.id];
            
            return (
              <div
                key={basic.id}
                className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${
                  isCompleted
                    ? isDarkMode 
                      ? 'bg-green-900/20 border border-green-700' 
                      : 'bg-green-50 border border-green-200'
                    : isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => toggleBasic(basic.id)}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                  <img src={image} alt={basic.label} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${
                    isCompleted 
                      ? 'text-green-600 line-through' 
                      : isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {basic.label}
                  </div>
                  <div className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {isCompleted ? 'Completed' : 'Not done yet'}
                  </div>
                </div>
                
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isCompleted
                    ? 'bg-green-500 border-green-500'
                    : isDarkMode 
                      ? 'border-gray-500' 
                      : 'border-gray-300'
                }`}>
                  {isCompleted && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly View */}
      <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
        isDarkMode 
          ? 'bg-gray-800/80 border-gray-700' 
          : 'bg-white/80 border-gray-100'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Weekly Overview</h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentWeekOffset(prev => prev - 1)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ←
            </button>
            <button
              onClick={() => setCurrentWeekOffset(prev => prev + 1)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              →
            </button>
          </div>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {getWeeklyBasicsData.map((day, index) => {
            const completedBasics = Object.values(day.data?.basics || {}).filter(Boolean).length;
            const totalBasics = basicOptions.length;
            const completionRate = totalBasics > 0 ? (completedBasics / totalBasics) * 100 : 0;
            
            return (
              <div
                key={day.dateStr}
                className={`text-center p-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedDay?.dateStr === day.dateStr
                    ? isDarkMode 
                      ? 'bg-blue-900/50 border border-blue-700' 
                      : 'bg-blue-50 border border-blue-200'
                    : completionRate === 100
                      ? isDarkMode
                        ? 'bg-green-900/30 border border-green-700 hover:bg-green-900/40'
                        : 'bg-green-100 border border-green-300 hover:bg-green-200'
                      : completionRate >= 50
                        ? isDarkMode
                          ? 'bg-orange-900/30 border border-orange-700 hover:bg-orange-900/40'
                          : 'bg-orange-100 border border-orange-300 hover:bg-orange-200'
                        : completionRate > 0
                          ? isDarkMode
                            ? 'bg-red-900/30 border border-red-700 hover:bg-red-900/40'
                            : 'bg-red-100 border border-red-300 hover:bg-red-200'
                          : isDarkMode 
                            ? 'bg-gray-700 border border-gray-600 hover:bg-gray-600' 
                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedDay(day)}
              >
                <div className={`text-xs font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {day.dayName}
                </div>
                <div className={`text-lg font-bold ${
                  completionRate === 100
                    ? 'text-green-700'
                    : completionRate >= 50
                      ? 'text-orange-700'
                      : completionRate > 0
                        ? 'text-red-700'
                        : isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {day.dayNumber}
                </div>
                <div className={`text-xs ${
                  completionRate === 100
                    ? 'text-green-600'
                    : completionRate >= 50
                      ? 'text-orange-600'
                      : completionRate > 0
                        ? 'text-red-600'
                        : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {completedBasics}/{totalBasics}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Day Details */}
        {selectedDay && (
          <div className={`p-4 rounded-xl ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <h3 className={`font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {selectedDay.date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {basicOptions.map((basic) => {
                const isCompleted = getBasicStatusForDay(selectedDay.data, basic.id);
                const image = basicImageMap[basic.id];
                
                return (
                  <div
                    key={basic.id}
                    className={`flex items-center p-3 rounded-lg ${
                      isCompleted
                        ? isDarkMode 
                          ? 'bg-green-900/20' 
                          : 'bg-green-50'
                        : isDarkMode 
                          ? 'bg-gray-600' 
                          : 'bg-gray-100'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-md overflow-hidden mr-3">
                      <img src={image} alt={basic.label} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${
                        isCompleted 
                          ? 'text-green-600' 
                          : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {basic.label}
                      </div>
                    </div>
                    
                    <div className={`w-4 h-4 rounded-full border ${
                      isCompleted
                        ? 'bg-green-500 border-green-500'
                        : isDarkMode 
                          ? 'border-gray-500' 
                          : 'border-gray-300'
                    }`}>
                      {isCompleted && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Basics;
