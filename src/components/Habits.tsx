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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Daily Habits</h1>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Track your daily habits and build consistency
            </p>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              isDarkMode ? 'text-orange-400' : 'text-orange-600'
            }`}>
              {getHabitProgress()}%
            </div>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Complete</p>
          </div>
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

      {/* Weekly Habits Tracking */}
      <div className={`backdrop-blur-sm rounded-2xl shadow-sm border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="text-orange-600" size={16} />
              </div>
              <h2 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Weekly Habits Tracking</h2>
            </div>
            {/* Week Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  currentWeekOffset <= -2 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
                disabled={currentWeekOffset <= -2}
              >
                <span className="text-sm">Previous</span>
              </button>
              <button
                onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  currentWeekOffset >= 2 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
                disabled={currentWeekOffset >= 2}
              >
                <span className="text-sm">Next</span>
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          {/* Weekly Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {getWeeklyHabitsData.map((day, index) => {
              const hasHabits = day.data.habits && day.data.habits.length > 0;
              const completedHabits = day.data.completedHabits || [];
              const completionRate = hasHabits ? (completedHabits.length / day.data.habits.length) * 100 : 0;
              
              return (
                <div
                  key={index}
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square rounded-lg border-2 p-2 transition-all duration-200 cursor-pointer hover:scale-105 ${
                    hasHabits
                      ? completionRate === 100
                        ? 'bg-green-100 border-green-300 hover:bg-green-200'
                        : completionRate > 0
                          ? 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200'
                          : 'bg-red-100 border-red-300 hover:bg-red-200'
                      : isDarkMode
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {day.dayName}
                    </div>
                    <div className={`text-lg font-bold ${
                      hasHabits
                        ? completionRate === 100
                          ? 'text-green-700'
                          : completionRate > 0
                            ? 'text-yellow-700'
                            : 'text-red-700'
                        : isDarkMode
                          ? 'text-gray-300'
                          : 'text-gray-600'
                    }`}>
                      {day.dayNumber}
                    </div>
                    {hasHabits && (
                      <div className={`text-xs font-medium ${
                        completionRate === 100
                          ? 'text-green-600'
                          : completionRate > 0
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}>
                        {Math.round(completionRate)}%
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            {/* Modal Header */}
            <div className={`p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedDay.date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Planned Habits
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:bg-gray-700' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Habits Section */}
              <div>
                <h4 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Planned Habits</h4>
                {selectedDay.data.habits && selectedDay.data.habits.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDay.data.habits.map((habitId: string) => {
                      const isCompleted = selectedDay.data.completedHabits?.includes(habitId) || false;
                      const imageSrc = habitImageMap[habitId];
                      const label = habitOptions.find(h => h.id === habitId)?.label || habitId;
                      
                      return (
                        <div key={habitId} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 rounded-md overflow-hidden bg-gray-200">
                              {imageSrc ? (
                                <img src={imageSrc} alt={label} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Target size={14} className="text-gray-500" />
                                </div>
                              )}
                            </div>
                            <span className={`font-medium ${
                              isCompleted 
                                ? 'text-green-600 line-through' 
                                : isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {label}
                            </span>
                          </div>
                          <span className={`text-sm ${
                            isCompleted 
                              ? 'text-green-600' 
                              : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {isCompleted ? 'Completed' : 'Not completed'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>No habits planned for this day</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Habits;
