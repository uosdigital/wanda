import React from 'react';
import { CheckCircle2, Circle, Target, ArrowLeft, ArrowRight } from 'lucide-react';
import { AppData, DailyData } from '../types';
import { useToast } from './ToastProvider';
import guitarImg from '../../images/guitar.jpg';
import writeImg from '../../images/write.jpg';
import socialiseImg from '../../images/socialise.jpg';
import runImg from '../../images/run.jpg';
import readImg from '../../images/read.jpg';

interface HabitsProps {
  appData: AppData;
  todaysData: DailyData;
  onUpdateData: (data: Partial<DailyData>) => void;
  onAddPoints: (points: number, reason?: string) => void;
  isDarkMode: boolean;
  onTimeblock?: (label: string, category: 'priority' | 'task' | 'habit' | 'connect' | 'custom') => void;
}

const Habits: React.FC<HabitsProps> = ({
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

  // Map habit IDs to custom images
  const habitImageMap: { [key: string]: string } = {
    guitar: guitarImg,
    write: writeImg,
    socialise: socialiseImg,
    exercise: runImg,
    read: readImg,
  };

  const habitOptions = [
    { id: 'guitar', label: 'Guitar' },
    { id: 'write', label: 'Write' },
    { id: 'read', label: 'Read' },
    { id: 'exercise', label: 'Exercise' },
    { id: 'socialise', label: 'Socialise' }
  ];

  const toggleHabit = (habitId: string) => {
    const completedHabits = todaysData.completedHabits || [];
    const isCompleted = completedHabits.includes(habitId);
    
    let updatedHabits;
    if (isCompleted) {
      updatedHabits = completedHabits.filter(id => id !== habitId);
      showToast('-30 points — Habit unchecked', 3000, 'Habit unchecked');
    } else {
      updatedHabits = [...completedHabits, habitId];
      showToast('+30 points — Habit completed', 3000, 'Habit completed');
    }
    
    onUpdateData({ completedHabits: updatedHabits });
  };

  const getHabitProgress = () => {
    const plannedHabits = todaysData.habits || [];
    const completedHabits = todaysData.completedHabits || [];
    return plannedHabits.length > 0 ? (completedHabits.length / plannedHabits.length) * 100 : 0;
  };

  // Get last completion date for a habit
  const getLastCompletionDate = (habitId: string) => {
    const dates = Object.keys(appData.dailyData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    for (const dateStr of dates) {
      const dayData = appData.dailyData[dateStr];
      if (dayData?.completedHabits?.includes(habitId)) {
        const date = new Date(dateStr);
        const now = new Date();
        const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        
        return {
          dateString: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
          }),
          hoursDiff
        };
      }
    }
    return null;
  };

  // Get weekly habits data
  const getWeeklyHabitsData = React.useMemo(() => {
    const days = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (6 - currentWeekOffset * 7));
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + (6 - i));
      const dateStr = date.toDateString();
      const dayData = appData.dailyData[dateStr];
      
      days.push({
        date: date,
        dateStr: dateStr,
        data: dayData || {},
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate()
      });
    }
    return days;
  }, [appData.dailyData, currentWeekOffset]);

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
            }`}>Habits</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Track your daily habits and build consistency
            </p>
          </div>
          
          {/* Progress */}
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {Math.round(getHabitProgress())}%
            </div>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {todaysData.completedHabits?.length || 0} of {todaysData.habits?.length || 0}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`w-full h-2 rounded-full overflow-hidden ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <div 
            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500 ease-out"
            style={{ width: `${getHabitProgress()}%` }}
          />
        </div>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habitOptions.map((habit) => {
          const isPlanned = todaysData.habits?.includes(habit.id) || false;
          const isCompleted = todaysData.completedHabits?.includes(habit.id) || false;
          const imageSrc = habitImageMap[habit.id];

          return (
            <div
              key={habit.id}
              className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800/80 border-gray-700' 
                  : 'bg-white/80 border-gray-100'
              } ${
                isCompleted 
                  ? 'ring-2 ring-green-500/50' 
                  : isPlanned 
                    ? 'ring-2 ring-orange-500/50' 
                    : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg overflow-hidden ${
                    isCompleted 
                      ? 'bg-green-500' 
                      : isPlanned 
                        ? 'bg-orange-500' 
                        : isDarkMode 
                          ? 'bg-gray-600' 
                          : 'bg-gray-200'
                  }`}>
                    {imageSrc ? (
                      <img src={imageSrc} alt={habit.label} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Target size={20} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {habit.label}
                      </h3>
                      {isPlanned && (
                        <button
                          onClick={() => toggleHabit(habit.id)}
                          className={`flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                            isCompleted
                              ? (isDarkMode ? 'text-green-400 bg-green-900/20' : 'text-green-700 bg-green-100')
                              : (isDarkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-700 bg-gray-100')
                          }`}
                          title={isCompleted ? 'Mark as pending' : 'Mark as done'}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Circle size={14} />
                          )}
                          <span>{isCompleted ? 'Done' : 'Pending'}</span>
                        </button>
                      )}
                    </div>
                    <p className={`text-xs ${
                      (() => {
                        const lastCompleted = getLastCompletionDate(habit.id);
                        if (!lastCompleted) {
                          return isDarkMode ? 'text-red-400' : 'text-red-600'; // Never completed - red
                        }
                        
                        const { hoursDiff } = lastCompleted;
                        if (hoursDiff <= 48) {
                          return isDarkMode ? 'text-green-400' : 'text-green-600'; // Within 48 hours - green
                        } else if (hoursDiff <= 96) {
                          return isDarkMode ? 'text-orange-400' : 'text-orange-600'; // 48-96 hours - orange
                        } else {
                          return isDarkMode ? 'text-red-400' : 'text-red-600'; // 96+ hours - red
                        }
                      })()
                    }`}>
                      {(() => {
                        const lastCompleted = getLastCompletionDate(habit.id);
                        return lastCompleted ? `Last completed on ${lastCompleted.dateString}` : 'Never completed';
                      })()}
                    </p>
                    <p className={`text-sm ${
                      isCompleted 
                        ? 'text-green-600' 
                        : isPlanned 
                          ? 'text-orange-600' 
                          : isDarkMode 
                            ? 'text-gray-400' 
                            : 'text-gray-500'
                    }`}>
                      {isCompleted ? 'Completed' : isPlanned ? 'Planned' : 'Not planned'}
                    </p>
                  </div>
                </div>

              </div>
              
              {!isPlanned ? (
                <button
                  onClick={() => onUpdateData({ 
                    habits: [...(todaysData.habits || []), habit.id] 
                  })}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Add to Today
                </button>
              ) : (
                <button
                  onClick={() => {
                    const updatedHabits = todaysData.habits?.filter(id => id !== habit.id) || [];
                    const updatedCompletedHabits = todaysData.completedHabits?.filter(id => id !== habit.id) || [];
                    onUpdateData({ 
                      habits: updatedHabits,
                      completedHabits: updatedCompletedHabits
                    });
                  }}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' 
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  Remove from today
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Summary */}
      {todaysData.habits && todaysData.habits.length > 0 && (
        <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
          isDarkMode 
            ? 'bg-gray-800/80 border-gray-700' 
            : 'bg-white/80 border-gray-100'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Today's Progress</h3>
          <div className="space-y-3">
            {todaysData.habits.map((habitId) => {
              const habit = habitOptions.find(h => h.id === habitId);
              const isCompleted = todaysData.completedHabits?.includes(habitId) || false;
              const imageSrc = habitImageMap[habitId];
              
              return (
                <div 
                  key={habitId} 
                  className="flex items-center justify-between cursor-pointer p-2 rounded-lg transition-colors"
                  onClick={() => {
                    const completedHabits = todaysData.completedHabits || [];
                    const newCompletedHabits = isCompleted
                      ? completedHabits.filter(id => id !== habitId)
                      : [...completedHabits, habitId];
                    
                    if (!isCompleted) {
                      onAddPoints(30, 'Habit completed');
                    }
                    
                    onUpdateData({ completedHabits: newCompletedHabits });
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {isCompleted ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <Circle size={16} className="text-gray-400" />
                    )}
                    <div className="w-6 h-6 rounded-md overflow-hidden bg-gray-200">
                      {imageSrc ? (
                        <img src={imageSrc} alt={habit?.label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Target size={14} className="text-gray-500" />
                        </div>
                      )}
                    </div>
                    <span className={`${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {habit?.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {onTimeblock && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onTimeblock(habit?.label || '', 'habit'); }}
                        className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Timeblock</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly Overview */}
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
          {getWeeklyHabitsData.map((day, index) => {
            const hasHabits = day.data.habits && day.data.habits.length > 0;
            const completedHabits = day.data.completedHabits || [];
            const completionRate = hasHabits ? (completedHabits.length / day.data.habits.length) * 100 : 0;
            
            return (
              <div
                key={day.dateStr}
                className={`text-center p-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedDay?.dateStr === day.dateStr
                    ? isDarkMode 
                      ? 'bg-blue-900/50 border border-blue-700' 
                      : 'bg-blue-50 border border-blue-200'
                    : hasHabits
                      ? completionRate === 100
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
                  hasHabits
                    ? completionRate === 100
                      ? 'text-green-700'
                      : completionRate >= 50
                        ? 'text-orange-700'
                        : completionRate > 0
                          ? 'text-red-700'
                          : isDarkMode ? 'text-white' : 'text-gray-900'
                    : isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {day.dayNumber}
                </div>
                <div className={`text-xs ${
                  hasHabits
                    ? completionRate === 100
                      ? 'text-green-600'
                      : completionRate >= 50
                        ? 'text-orange-600'
                        : completionRate > 0
                          ? 'text-red-600'
                          : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {hasHabits ? `${completedHabits.length}/${day.data.habits.length}` : '0/0'}
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
              {habitOptions.map((habit) => {
                const isPlanned = selectedDay.data.habits?.includes(habit.id) || false;
                const isCompleted = selectedDay.data.completedHabits?.includes(habit.id) || false;
                const imageSrc = habitImageMap[habit.id];
                
                return (
                  <div
                    key={habit.id}
                    className={`flex items-center p-3 rounded-lg ${
                      isCompleted
                        ? isDarkMode 
                          ? 'bg-green-900/20' 
                          : 'bg-green-50'
                        : isPlanned
                          ? isDarkMode 
                            ? 'bg-orange-900/20' 
                            : 'bg-orange-50'
                          : isDarkMode 
                            ? 'bg-gray-600' 
                            : 'bg-gray-100'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-md overflow-hidden mr-3">
                      {imageSrc ? (
                        <img src={imageSrc} alt={habit.label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Target size={16} className="text-gray-500" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${
                        isCompleted 
                          ? 'text-green-600' 
                          : isPlanned
                            ? 'text-orange-600'
                            : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {habit.label}
                      </div>
                    </div>
                    
                    <div className={`w-4 h-4 rounded-full border ${
                      isCompleted
                        ? 'bg-green-500 border-green-500'
                        : isPlanned
                          ? 'bg-orange-500 border-orange-500'
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

export default Habits;
