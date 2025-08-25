import React from 'react';
import { ArrowLeft, TrendingUp, Calendar, Trophy, Flame, Moon, Clock, Target } from 'lucide-react';
import { AppData } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface WeeklyLogProps {
  appData: AppData;
  isDarkMode: boolean;
}

const WeeklyLog: React.FC<WeeklyLogProps> = ({ appData, isDarkMode }) => {
  const [currentWeekOffset, setCurrentWeekOffset] = React.useState(0);
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Helper functions
  const getMoodText = (mood?: number) => {
    if (!mood) return '—';
    const moods = ['Poor', 'Fair', 'Okay', 'Good', 'Great'];
    return moods[mood - 1] || '—';
  };

  const getCompletionRate = () => {
    const daysWithData = weekDataWithDetails.filter(day => day.data.mainPriority).length;
    const completedDays = weekDataWithDetails.filter(day => day.data.completedMainTask).length;
    return daysWithData > 0 ? Math.round((completedDays / daysWithData) * 100) : 0;
  };

  const getTotalWins = () => {
    return weekDataWithDetails.filter(day => day.data.winOfDay).length;
  };

  // Mood categorization helper functions
  const getMoodCategory = (mood: string) => {
    const positiveMoods = ['energised', 'ready', 'upbeat'];
    const negativeMoods = ['low', 'struggling', 'tough mood', 'anxious', 'overwhelmed', 'unmotivated', 'sad', 'irritable', 'stuck', 'exhausted', 'frustrated', 'lonely', 'hopeless'];
    const neutralMoods = ['flat', 'mixed', 'meh', 'okay', 'tired', 'neutral', 'stressed', 'distracted', 'restless', 'busy', 'unsure', 'low-key'];
    
    if (positiveMoods.includes(mood)) return 'positive';
    if (negativeMoods.includes(mood)) return 'negative';
    return 'neutral';
  };

  const getMoodCategoryColor = (category: string) => {
    switch (category) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMoodCategoryIcon = (category: string) => {
    switch (category) {
      case 'positive': return '';
      case 'negative': return '';
      case 'neutral': return '';
      default: return '';
    }
  };

  const calculateDailyPoints = (dayData: any) => {
    let points = 0;
    
    // Morning flow completion: 5 points
    if (dayData.sleepQuality && dayData.morningMood && dayData.mainPriority) {
      points += 5;
    }
    
    // Evening flow completion: 5 points
    if (dayData.eveningMood && dayData.winOfDay) {
      points += 5;
    }
    
    // Main priority completion: 50 points
    if (dayData.completedMainTask) {
      points += 50;
    }
    
    // Additional tasks: 10 points each
    if (dayData.completedTasks) {
      points += dayData.completedTasks.filter(Boolean).length * 10;
    }
    
    // People to message: 5 points each
    if (dayData.completedPeople) {
      points += dayData.completedPeople.filter(Boolean).length * 5;
    }
    
    // Habits completion: 15 points each
    if (dayData.completedHabits) {
      points += dayData.completedHabits.length * 15;
    }
    
    // Water glasses: 5 points each
    if (dayData.waterGlasses) {
      points += dayData.waterGlasses * 5;
    }
    
    return points;
  };

  const weekDataWithDetails = React.useMemo(() => {
    // Get 7 days of data based on week offset
    const getLast7Days = () => {
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
    };

    const baseWeekData = getLast7Days();

    // Create different dummy data based on the week offset
    const getDummyDataForWeek = (weekOffset: number) => {
      // Comprehensive mood data for the last month
      const moodData = {
        0: [ // Current week
          { sleepData: { sleepQuality: 4, bedTime: '23:30', wakeTime: '07:15', sleepHours: 7.75 }, morningMood: 'energised' },
          { sleepData: { sleepQuality: 3, bedTime: '00:15', wakeTime: '07:30', sleepHours: 7.25 }, morningMood: 'ready' },
          { sleepData: { sleepQuality: 5, bedTime: '22:45', wakeTime: '06:45', sleepHours: 8.0 }, morningMood: 'upbeat' },
          { sleepData: { sleepQuality: 2, bedTime: '01:00', wakeTime: '08:00', sleepHours: 7.0 }, morningMood: 'tired' },
          { sleepData: { sleepQuality: 4, bedTime: '23:15', wakeTime: '07:00', sleepHours: 7.75 }, morningMood: 'ready' },
          { sleepData: { sleepQuality: 3, bedTime: '00:30', wakeTime: '07:45', sleepHours: 7.25 }, morningMood: 'mixed' },
          { sleepData: { sleepQuality: 5, bedTime: '22:30', wakeTime: '06:30', sleepHours: 8.0 }, morningMood: 'energised' }
        ],
        '-1': [ // Last week
          { sleepData: { sleepQuality: 2, bedTime: '01:30', wakeTime: '08:30', sleepHours: 7.0 }, morningMood: 'tired' },
          { sleepData: { sleepQuality: 1, bedTime: '02:00', wakeTime: '09:00', sleepHours: 7.0 }, morningMood: 'exhausted' },
          { sleepData: { sleepQuality: 3, bedTime: '00:45', wakeTime: '07:15', sleepHours: 6.5 }, morningMood: 'flat' },
          { sleepData: { sleepQuality: 2, bedTime: '01:15', wakeTime: '08:15', sleepHours: 7.0 }, morningMood: 'stressed' },
          { sleepData: { sleepQuality: 1, bedTime: '02:30', wakeTime: '09:30', sleepHours: 7.0 }, morningMood: 'overwhelmed' },
          { sleepData: { sleepQuality: 2, bedTime: '01:00', wakeTime: '08:00', sleepHours: 7.0 }, morningMood: 'low' },
          { sleepData: { sleepQuality: 3, bedTime: '00:30', wakeTime: '07:00', sleepHours: 6.5 }, morningMood: 'meh' }
        ],
        '-2': [ // 2 weeks ago
          { sleepData: { sleepQuality: 5, bedTime: '22:00', wakeTime: '06:30', sleepHours: 8.5 }, morningMood: 'energised' },
          { sleepData: { sleepQuality: 4, bedTime: '22:30', wakeTime: '06:45', sleepHours: 8.25 }, morningMood: 'upbeat' },
          { sleepData: { sleepQuality: 5, bedTime: '21:45', wakeTime: '06:15', sleepHours: 8.5 }, morningMood: 'energised' },
          { sleepData: { sleepQuality: 4, bedTime: '22:15', wakeTime: '06:30', sleepHours: 8.25 }, morningMood: 'ready' },
          { sleepData: { sleepQuality: 5, bedTime: '22:00', wakeTime: '06:45', sleepHours: 8.75 }, morningMood: 'upbeat' },
          { sleepData: { sleepQuality: 4, bedTime: '22:30', wakeTime: '07:00', sleepHours: 8.5 }, morningMood: 'energised' },
          { sleepData: { sleepQuality: 5, bedTime: '21:30', wakeTime: '06:00', sleepHours: 8.5 }, morningMood: 'ready' }
        ],
        '-3': [ // 3 weeks ago
          { sleepData: { sleepQuality: 3, bedTime: '23:45', wakeTime: '07:30', sleepHours: 7.75 }, morningMood: 'mixed' },
          { sleepData: { sleepQuality: 4, bedTime: '23:15', wakeTime: '07:00', sleepHours: 7.75 }, morningMood: 'ready' },
          { sleepData: { sleepQuality: 4, bedTime: '22:45', wakeTime: '06:45', sleepHours: 8.0 }, morningMood: 'energised' },
          { sleepData: { sleepQuality: 3, bedTime: '00:00', wakeTime: '07:15', sleepHours: 7.25 }, morningMood: 'flat' },
          { sleepData: { sleepQuality: 4, bedTime: '23:30', wakeTime: '07:00', sleepHours: 7.5 }, morningMood: 'ready' },
          { sleepData: { sleepQuality: 5, bedTime: '22:30', wakeTime: '06:30', sleepHours: 8.0 }, morningMood: 'upbeat' },
          { sleepData: { sleepQuality: 4, bedTime: '23:00', wakeTime: '06:45', sleepHours: 7.75 }, morningMood: 'energised' }
        ],
        '-4': [ // 4 weeks ago
          { sleepData: { sleepQuality: 2, bedTime: '01:00', wakeTime: '08:00', sleepHours: 7.0 }, morningMood: 'stressed' },
          { sleepData: { sleepQuality: 1, bedTime: '02:15', wakeTime: '09:15', sleepHours: 7.0 }, morningMood: 'anxious' },
          { sleepData: { sleepQuality: 3, bedTime: '00:30', wakeTime: '07:00', sleepHours: 6.5 }, morningMood: 'tired' },
          { sleepData: { sleepQuality: 2, bedTime: '01:45', wakeTime: '08:45', sleepHours: 7.0 }, morningMood: 'overwhelmed' },
          { sleepData: { sleepQuality: 1, bedTime: '02:30', wakeTime: '09:30', sleepHours: 7.0 }, morningMood: 'exhausted' },
          { sleepData: { sleepQuality: 2, bedTime: '01:15', wakeTime: '08:15', sleepHours: 7.0 }, morningMood: 'low' },
          { sleepData: { sleepQuality: 3, bedTime: '00:45', wakeTime: '07:15', sleepHours: 6.5 }, morningMood: 'flat' }
        ],
        '1': [ // Next week
          { sleepData: { sleepQuality: 3, bedTime: '23:45', wakeTime: '07:30', sleepHours: 7.75 }, morningMood: 'ready' },
          { sleepData: { sleepQuality: 4, bedTime: '23:15', wakeTime: '07:00', sleepHours: 7.75 }, morningMood: 'energised' },
          { sleepData: { sleepQuality: 4, bedTime: '22:45', wakeTime: '06:45', sleepHours: 8.0 }, morningMood: 'upbeat' },
          { sleepData: { sleepQuality: 3, bedTime: '00:00', wakeTime: '07:15', sleepHours: 7.25 }, morningMood: 'ready' },
          { sleepData: { sleepQuality: 4, bedTime: '23:30', wakeTime: '07:00', sleepHours: 7.5 }, morningMood: 'energised' },
          { sleepData: { sleepQuality: 5, bedTime: '22:30', wakeTime: '06:30', sleepHours: 8.0 }, morningMood: 'upbeat' },
          { sleepData: { sleepQuality: 4, bedTime: '23:00', wakeTime: '06:45', sleepHours: 7.75 }, morningMood: 'ready' }
        ],
        '2': [ // 2 weeks in future
          { sleepData: { sleepQuality: 4, bedTime: '22:45', wakeTime: '06:45', sleepHours: 8.0 }, morningMood: 'energised' },
          { sleepData: { sleepQuality: 4, bedTime: '23:00', wakeTime: '07:00', sleepHours: 8.0 }, morningMood: 'ready' },
          { sleepData: { sleepQuality: 5, bedTime: '22:30', wakeTime: '06:30', sleepHours: 8.0 }, morningMood: 'upbeat' },
          { sleepData: { sleepQuality: 4, bedTime: '23:15', wakeTime: '07:15', sleepHours: 8.0 }, morningMood: 'energised' },
          { sleepData: { sleepQuality: 4, bedTime: '22:45', wakeTime: '06:45', sleepHours: 8.0 }, morningMood: 'ready' },
          { sleepData: { sleepQuality: 5, bedTime: '22:00', wakeTime: '06:00', sleepHours: 8.0 }, morningMood: 'upbeat' },
          { sleepData: { sleepQuality: 4, bedTime: '23:00', wakeTime: '07:00', sleepHours: 8.0 }, morningMood: 'energised' }
        ]
      };

      return moodData[weekOffset] || moodData[0];
    };

    const dummyData = getDummyDataForWeek(currentWeekOffset);

    return baseWeekData.map((day, index) => {
      // Only apply dummy data if there's no real data for this day
      const hasRealData = day.data && Object.keys(day.data).length > 0;
      
      if (!hasRealData) {
        const dummy = dummyData[index];
        if (dummy) {
          return {
            ...day,
            data: {
              sleepQuality: dummy.sleepData?.sleepQuality,
              bedTime: dummy.sleepData?.bedTime,
              wakeTime: dummy.sleepData?.wakeTime,
              sleepHours: dummy.sleepData?.sleepHours,
              morningMood: dummy.morningMood
            }
          };
        }
      }
      
      return day;
    });
  }, [currentWeekOffset]);

  const getSleepScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 bg-green-100';
    if (score >= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };



  const formatTime = (time: string) => {
    if (!time) return '—';
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const calculateSleepDuration = (bedTime: string, wakeTime: string) => {
    if (!bedTime || !wakeTime) return null;
    
    const [bedHour, bedMinute] = bedTime.split(':').map(Number);
    const [wakeHour, wakeMinute] = wakeTime.split(':').map(Number);
    
    let bedMinutes = bedHour * 60 + bedMinute;
    let wakeMinutes = wakeHour * 60 + wakeMinute;
    
    // If wake time is earlier than bed time, it means we slept past midnight
    if (wakeMinutes < bedMinutes) {
      wakeMinutes += 24 * 60; // Add 24 hours
    }
    
    const durationMinutes = wakeMinutes - bedMinutes;
    const durationHours = durationMinutes / 60;
    
    return Math.round(durationHours * 100) / 100; // Round to 2 decimal places
  };

  return (
    <div className={`max-w-4xl mx-auto ${isDarkMode ? 'text-white' : ''}`}>
      {/* Header with Week Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className={`text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Trends</h1>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Your productivity journey</p>
          </div>
        </div>
        
        {/* Week Navigation */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentWeekOffset(prev => prev - 1)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
              currentWeekOffset <= -2 
                ? 'text-gray-400 cursor-not-allowed' 
                : isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-800' 
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
            disabled={currentWeekOffset <= -2}
          >
            <ArrowLeft size={16} />
            <span>Previous Week</span>
          </button>
          
          <div className="text-center">
            <div className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {currentWeekOffset === 0 ? 'This Week' : 
               currentWeekOffset === -1 ? 'Last Week' : 
               `${Math.abs(currentWeekOffset)} weeks ago`}
            </div>
            <div className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {(() => {
                // Use the exact same logic as getLast7Days()
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - (6 - currentWeekOffset * 7));
                
                // The end date should be 6 days after the start date (7 days total)
                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6);
                
                return `${startDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })} - ${endDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}`;
              })()}
            </div>
          </div>
          
          <button
            onClick={() => setCurrentWeekOffset(prev => prev + 1)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
              currentWeekOffset >= 2 
                ? 'text-gray-400 cursor-not-allowed' 
                : isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-800' 
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
            disabled={currentWeekOffset >= 2}
          >
            <span>Next Week</span>
            <ArrowLeft size={16} className="rotate-180" />
          </button>
        </div>
      </div>

      {/* This Week's Progress - Separate card */}
      <div className={`rounded-2xl shadow-sm border mb-8 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className={`p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-green-600" size={16} />
            </div>
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>This Week's Progress</h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-7 gap-4">
            {weekDataWithDetails.map((day, index) => (
              <div 
                key={index} 
                className="text-center cursor-pointer transition-all duration-200 hover:scale-105"
                onClick={() => {
                  setSelectedDay(index);
                  setIsModalOpen(true);
                }}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {day.dayName}
                </div>
                <div 
                  className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-sm font-semibold mb-3 transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day.dayNumber}
                </div>
                
                <div className="mt-2">
                  <span className={`text-xs font-medium ${
                    calculateDailyPoints(day.data) > 0 
                      ? 'text-green-600' 
                      : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {calculateDailyPoints(day.data)} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* Priority Achievement Tracking */}
      <div className={`rounded-2xl shadow-sm border mb-8 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className={`p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="text-purple-600" size={16} />
            </div>
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Priority Achievement</h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-7 gap-4 mb-6">
            {weekDataWithDetails.map((day, index) => (
              <div key={index} className="text-center">
                <div className={`text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {day.dayName}
                </div>
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-lg font-bold ${
                  day.data.completedMainTask
                    ? 'bg-green-100 text-green-600 border-2 border-green-200'
                    : day.data.mainPriority
                      ? 'bg-yellow-100 text-yellow-600 border-2 border-yellow-200'
                      : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                }`}>
                  {day.data.completedMainTask ? '✓' : day.data.mainPriority ? '!' : '—'}
                </div>
                <div className={`text-xs mt-1 ${
                  day.data.completedMainTask
                    ? 'text-green-600 font-medium'
                    : day.data.mainPriority
                      ? 'text-yellow-600'
                      : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {day.data.completedMainTask ? 'Completed' : day.data.mainPriority ? 'Set' : 'No priority'}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-200 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs font-bold">✓</span>
              </div>
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-200 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-xs font-bold">!</span>
              </div>
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Set but not completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-xs">—</span>
              </div>
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>No priority set</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sleep Tracking Graph */}
      <div className={`rounded-2xl shadow-sm border mb-8 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className={`p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Moon className="text-blue-600" size={16} />
            </div>
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Sleep Tracking</h2>
          </div>
        </div>
        
        <div className="p-6">

            {/* Sleep Quality Score Chart */}
            <div className="mb-8">
              <h3 className={`text-lg font-medium mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Sleep Quality Score</h3>
              <div className="h-64 mb-4 rounded-xl p-4 bg-white">
              <Line
                data={{
                  labels: weekDataWithDetails.map(day => day.dayName),
                  datasets: [
                    {
                      label: 'Sleep Quality',
                      data: weekDataWithDetails.map(day => day.data.sleepQuality || null),
                      borderColor: '#3B82F6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderWidth: 3,
                      pointBackgroundColor: weekDataWithDetails.map((day, index) => {
                        const score = day.data.sleepQuality;
                        const isToday = index === weekDataWithDetails.length - 1;
                        if (isToday) return '#2563EB';
                        if (score >= 4) return '#10B981';
                        if (score >= 3) return '#F59E0B';
                        return '#EF4444';
                      }),
                      pointBorderColor: '#ffffff',
                      pointBorderWidth: 2,
                      pointRadius: 6,
                      pointHoverRadius: 8,
                      tension: 0.4,
                      fill: false,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#ffffff',
                      bodyColor: '#ffffff',
                      borderColor: '#3B82F6',
                      borderWidth: 1,
                      cornerRadius: 8,
                      displayColors: false,
                      callbacks: {
                        label: function(context) {
                          const score = context.parsed.y;
                          if (!score) return 'No data';
                          return `Sleep Quality: ${score}/5`;
                        }
                      }
                    },
                  },
                                     scales: {
                     y: {
                       beginAtZero: true,
                       max: 5.5,
                       min: 0,
                       ticks: {
                         stepSize: 1,
                         color: '#6B7280',
                         font: {
                           size: 12,
                         },
                         callback: function(value) {
                           return value === 5.5 ? '' : value;
                         }
                       },
                       grid: {
                         color: '#F3F4F6',
                         drawBorder: false,
                       },
                       border: {
                         color: '#E5E7EB',
                       },
                     },
                    x: {
                      ticks: {
                        color: '#6B7280',
                        font: {
                          size: 12,
                        },
                      },
                      grid: {
                        display: false,
                      },
                      border: {
                        color: '#E5E7EB',
                      },
                    },
                  },
                  elements: {
                    point: {
                      hoverBackgroundColor: '#3B82F6',
                    },
                  },
                }}
              />
            </div>
            <div className={`flex justify-center space-x-6 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <span>1 = Poor</span>
              <span>3 = Okay</span>
              <span>5 = Excellent</span>
            </div>
          </div>

          {/* Sleep Details Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <th className={`text-left py-3 px-4 text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Day</th>
                  <th className={`text-left py-3 px-4 text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Sleep Score</th>
                  <th className={`text-left py-3 px-4 text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Bed Time</th>
                  <th className={`text-left py-3 px-4 text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Wake Time</th>
                  <th className={`text-left py-3 px-4 text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Duration</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDarkMode ? 'divide-gray-700' : 'divide-gray-100'
              }`}>
                {weekDataWithDetails.map((day, index) => (
                  <tr key={index} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{day.dayName}</div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>{day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {day.data.sleepQuality ? (
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSleepScoreColor(day.data.sleepQuality)}`}>
                            {day.data.sleepQuality}/5
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Clock size={14} className="text-gray-400" />
                        <span className={`text-sm ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{formatTime(day.data.bedTime)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Clock size={14} className="text-gray-400" />
                        <span className={`text-sm ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{formatTime(day.data.wakeTime)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {(() => {
                        const duration = day.data.sleepHours ? 
                          day.data.sleepHours : 
                          (day.data.bedTime && day.data.wakeTime) ? 
                          calculateSleepDuration(day.data.bedTime, day.data.wakeTime) : null;
                        
                        if (duration === null) {
                          return <span className="text-gray-400">—</span>;
                        }
                        
                        const colorClass = duration >= 7 ? 
                          'text-green-600 font-semibold' : 
                          'text-red-600 font-semibold';
                        
                        return (
                          <span className={`text-sm ${colorClass}`}>
                            {duration}h
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Morning Mood Panel */}
      <div className={`rounded-2xl shadow-sm border mb-8 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className={`p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={16} />
            </div>
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Morning Mood</h2>
          </div>
        </div>
        
        <div className="p-6">
          {/* Mood Distribution Pie Chart */}
          <div className="mb-8">
            <h3 className={`text-lg font-medium mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Mood Distribution</h3>
            <div className="h-64 mb-4">
              <Doughnut
                data={{
                  labels: ['Positive', 'Neutral', 'Negative'],
                  datasets: [
                    {
                      data: [
                        weekDataWithDetails.filter(day => getMoodCategory(day.data.morningMood) === 'positive').length,
                        weekDataWithDetails.filter(day => getMoodCategory(day.data.morningMood) === 'neutral').length,
                        weekDataWithDetails.filter(day => getMoodCategory(day.data.morningMood) === 'negative').length,
                      ],
                      backgroundColor: [
                        '#10B981', // Green for positive
                        '#F59E0B', // Yellow for neutral
                        '#EF4444', // Red for negative
                      ],
                      borderColor: 'transparent',
                      borderWidth: 0,
                      hoverBorderWidth: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                                              legend: {
                            position: 'bottom',
                            labels: {
                              padding: 20,
                              usePointStyle: true,
                              color: '#ffffff',
                              font: {
                                size: 12,
                              },
                            },
                          },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#ffffff',
                      bodyColor: '#ffffff',
                      borderColor: '#8B5CF6',
                      borderWidth: 1,
                      cornerRadius: 8,
                      callbacks: {
                        label: function(context) {
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = ((context.parsed / total) * 100).toFixed(1);
                          return `${context.label}: ${context.parsed} days (${percentage}%)`;
                        }
                      }
                    },
                  },
                  cutout: '60%',
                }}
              />
            </div>
          </div>

          {/* Mood Details Table */}
          <div>
            <h3 className={`text-lg font-medium mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Daily Mood Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <th className={`text-left py-3 px-4 font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Day</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Mood</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Category</th>
                  </tr>
                </thead>
                                  <tbody className={`divide-y ${
                    isDarkMode ? 'divide-gray-700' : 'divide-gray-100'
                  }`}>
                    {weekDataWithDetails.map((day, index) => {
                      const moodCategory = getMoodCategory(day.data.morningMood);
                      return (
                        <tr key={index} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>{day.dayName}</span>
                            <span className={`text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>{day.dayNumber}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-sm capitalize ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>{day.data.morningMood}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMoodCategoryColor(moodCategory)}`}>
                            <span className="mr-1">{getMoodCategoryIcon(moodCategory)}</span>
                            {moodCategory.charAt(0).toUpperCase() + moodCategory.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Journal Entries */}
      <div className={`rounded-2xl shadow-sm border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className={`p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <h2 className={`text-xl font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Journal Entries</h2>
        </div>
        
        <div className={`divide-y ${
          isDarkMode ? 'divide-gray-700' : 'divide-gray-100'
        }`}>
          {weekDataWithDetails
            .filter(day => day.data.winOfDay || day.data.obstacles?.length)
            .reverse()
            .map((day, index) => (
            <div key={index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {day.date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <div className={`flex items-center space-x-4 text-sm mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <span>Morning: {getMoodText(day.data.morningMood)}</span>
                    <span>Evening: {getMoodText(day.data.eveningMood)}</span>
                    {day.data.completedMainTask && (
                      <span className="text-green-600 font-medium">Main task completed</span>
                    )}
                  </div>
                </div>
              </div>

              {day.data.winOfDay && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-green-700 mb-2">Win of the day:</h4>
                  <p className={`p-3 rounded-lg ${
                    isDarkMode 
                      ? 'text-gray-200 bg-green-900/20' 
                      : 'text-gray-700 bg-green-50'
                  }`}>
                    {day.data.winOfDay}
                  </p>
                </div>
              )}

              {day.data.obstacles && day.data.obstacles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-orange-700 mb-2">Obstacles:</h4>
                  <div className="flex flex-wrap gap-2">
                    {day.data.obstacles.map((obstacle, obstacleIndex) => (
                      <span 
                        key={obstacleIndex}
                        className={`px-3 py-1 rounded-full text-sm ${
                          isDarkMode 
                            ? 'bg-orange-900/30 text-orange-300' 
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {obstacle}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {weekDataWithDetails.filter(day => day.data.winOfDay || day.data.obstacles?.length).length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <p>No journal entries yet this week.</p>
              <p className="text-sm mt-1">Complete your daily reviews to see entries here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Day Details Modal */}
      {isModalOpen && selectedDay !== null && weekDataWithDetails[selectedDay] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white'
          }`}>
            <div className={`sticky top-0 px-6 py-4 flex items-center justify-between ${
              isDarkMode 
                ? 'bg-gray-800 border-b border-gray-700' 
                : 'bg-white border-b border-gray-200'
            }`}>
              <h3 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {weekDataWithDetails[selectedDay].dayName} - {weekDataWithDetails[selectedDay].date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Morning Flow Details */}
                <div>
                  <h4 className={`text-lg font-medium mb-4 flex items-center ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Morning Check-in
                  </h4>
                  {(weekDataWithDetails[selectedDay].data.sleepQuality || weekDataWithDetails[selectedDay].data.morningMood || weekDataWithDetails[selectedDay].data.mainPriority) ? (
                    <div className="space-y-4">
                      <div className={`rounded-lg p-4 ${
                        isDarkMode 
                          ? 'bg-blue-900/20 border border-blue-700/30' 
                          : 'bg-blue-50'
                      }`}>
                        <h5 className={`font-medium mb-2 ${
                          isDarkMode ? 'text-blue-300' : 'text-blue-900'
                        }`}>Sleep & Mood</h5>
                        <div className="space-y-2 text-sm">
                          {weekDataWithDetails[selectedDay].data.sleepQuality && (
                            <div className="flex justify-between">
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Sleep Rating:</span>
                              <span className={`font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{weekDataWithDetails[selectedDay].data.sleepQuality}/5</span>
                            </div>
                          )}
                          {weekDataWithDetails[selectedDay].data.bedTime && (
                            <div className="flex justify-between">
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Bed Time:</span>
                              <span className={`font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{formatTime(weekDataWithDetails[selectedDay].data.bedTime)}</span>
                            </div>
                          )}
                          {weekDataWithDetails[selectedDay].data.wakeTime && (
                            <div className="flex justify-between">
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Wake Time:</span>
                              <span className={`font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{formatTime(weekDataWithDetails[selectedDay].data.wakeTime)}</span>
                            </div>
                          )}
                          {weekDataWithDetails[selectedDay].data.morningMood && (
                            <div className="flex justify-between">
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Morning Mood:</span>
                              <span className={`font-medium capitalize ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{weekDataWithDetails[selectedDay].data.morningMood}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {weekDataWithDetails[selectedDay].data.mainPriority && (
                        <div className={`rounded-lg p-4 ${
                          isDarkMode 
                            ? 'bg-green-900/20 border border-green-700/30' 
                            : 'bg-green-50'
                        }`}>
                          <h5 className={`font-medium mb-2 ${
                            isDarkMode ? 'text-green-300' : 'text-green-900'
                          }`}>Daily Focus</h5>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Main Priority:</span>
                              <p className={`font-medium mt-1 ${
                                isDarkMode ? 'text-green-200' : 'text-green-900'
                              }`}>{weekDataWithDetails[selectedDay].data.mainPriority}</p>
                            </div>
                            {weekDataWithDetails[selectedDay].data.firstStep && (
                              <div>
                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>First Step:</span>
                                <p className={`font-medium mt-1 ${
                                  isDarkMode ? 'text-green-200' : 'text-green-900'
                                }`}>{weekDataWithDetails[selectedDay].data.firstStep}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {weekDataWithDetails[selectedDay].data.additionalTasks && weekDataWithDetails[selectedDay].data.additionalTasks.length > 0 && (
                        <div className={`rounded-lg p-4 ${
                          isDarkMode 
                            ? 'bg-purple-900/20 border border-purple-700/30' 
                            : 'bg-purple-50'
                        }`}>
                          <h5 className={`font-medium mb-2 ${
                            isDarkMode ? 'text-purple-300' : 'text-purple-900'
                          }`}>Additional Tasks</h5>
                          <div className="space-y-1">
                            {weekDataWithDetails[selectedDay].data.additionalTasks.map((task, idx) => (
                              <div key={idx} className="flex items-center text-sm">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                                <span className={isDarkMode ? 'text-purple-200' : 'text-purple-900'}>{task}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {weekDataWithDetails[selectedDay].data.peopleToMessage && weekDataWithDetails[selectedDay].data.peopleToMessage.length > 0 && (
                        <div className={`rounded-lg p-4 ${
                          isDarkMode 
                            ? 'bg-orange-900/20 border border-orange-700/30' 
                            : 'bg-orange-50'
                        }`}>
                          <h5 className={`font-medium mb-2 ${
                            isDarkMode ? 'text-orange-300' : 'text-orange-900'
                          }`}>People to Connect With</h5>
                          <div className="space-y-1">
                            {weekDataWithDetails[selectedDay].data.peopleToMessage.map((person, idx) => (
                              <div key={idx} className="flex items-center text-sm">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                                <span className={isDarkMode ? 'text-orange-200' : 'text-orange-900'}>{person}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {weekDataWithDetails[selectedDay].data.goodStuff && weekDataWithDetails[selectedDay].data.goodStuff.length > 0 && (
                        <div className={`rounded-lg p-4 ${
                          isDarkMode 
                            ? 'bg-indigo-900/20 border border-indigo-700/30' 
                            : 'bg-indigo-50'
                        }`}>
                          <h5 className={`font-medium mb-2 ${
                            isDarkMode ? 'text-indigo-300' : 'text-indigo-900'
                          }`}>Good Stuff Planned</h5>
                          <div className="flex flex-wrap gap-2">
                            {weekDataWithDetails[selectedDay].data.goodStuff.map((item, idx) => (
                              <span key={idx} className={`px-2 py-1 text-xs rounded-full ${
                                isDarkMode 
                                  ? 'bg-indigo-800 text-indigo-200' 
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {weekDataWithDetails[selectedDay].data.habits && weekDataWithDetails[selectedDay].data.habits.length > 0 && (
                        <div className={`rounded-lg p-4 ${
                          isDarkMode 
                            ? 'bg-teal-900/20 border border-teal-700/30' 
                            : 'bg-teal-50'
                        }`}>
                          <h5 className={`font-medium mb-2 ${
                            isDarkMode ? 'text-teal-300' : 'text-teal-900'
                          }`}>Daily Habits</h5>
                          <div className="space-y-2">
                            {weekDataWithDetails[selectedDay].data.habits.map((habitId, idx) => {
                              const habitLabels: { [key: string]: string } = {
                                'guitar': 'Guitar',
                                'write': 'Write',
                                'read': 'Read',
                                'exercise': 'Exercise',
                                'socialise': 'Socialise'
                              };
                              const habitLabel = habitLabels[habitId] || habitId;
                              const isCompleted = weekDataWithDetails[selectedDay].data.completedHabits?.includes(habitId) || false;
                              
                              return (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center">
                                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2"></div>
                                    <span className={isDarkMode ? 'text-teal-200' : 'text-teal-900'}>
                                      {habitLabel}
                                    </span>
                                  </div>
                                  <span className={`text-xs font-medium ${
                                    isCompleted 
                                      ? 'text-green-500' 
                                      : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    {isCompleted ? 'Completed' : 'Not completed'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {(weekDataWithDetails[selectedDay].data.morningFeelings || weekDataWithDetails[selectedDay].data.goodDayVision) && (
                        <div className={`rounded-lg p-4 ${
                          isDarkMode 
                            ? 'bg-gray-700/50 border border-gray-600/30' 
                            : 'bg-gray-50'
                        }`}>
                          <h5 className={`font-medium mb-2 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-900'
                          }`}>Morning Feelings & Vision</h5>
                          {weekDataWithDetails[selectedDay].data.morningFeelings && (
                            <p className={`text-sm mb-3 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>{weekDataWithDetails[selectedDay].data.morningFeelings}</p>
                          )}
                          {weekDataWithDetails[selectedDay].data.goodDayVision && (
                            <div>
                              <span className={`text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>Good Day Vision:</span>
                              <p className={`text-sm mt-1 ${
                                isDarkMode ? 'text-gray-200' : 'text-gray-900'
                              }`}>{weekDataWithDetails[selectedDay].data.goodDayVision}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`text-center py-8 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <p>No morning check-in data for this day</p>
                    </div>
                  )}
                </div>
                
                {/* Evening Flow Details */}
                <div>
                  <h4 className={`text-lg font-medium mb-4 flex items-center ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Evening Review
                  </h4>
                  {(weekDataWithDetails[selectedDay].data.eveningMood || weekDataWithDetails[selectedDay].data.winOfDay || weekDataWithDetails[selectedDay].data.completedMainTask) ? (
                    <div className="space-y-4">
                      {(weekDataWithDetails[selectedDay].data.completedMainTask !== undefined || weekDataWithDetails[selectedDay].data.eveningMood) && (
                        <div className={`rounded-lg p-4 ${
                          isDarkMode 
                            ? 'bg-red-900/20 border border-red-700/30' 
                            : 'bg-red-50'
                        }`}>
                          <h5 className={`font-medium mb-2 ${
                            isDarkMode ? 'text-red-300' : 'text-red-900'
                          }`}>Daily Outcome</h5>
                          <div className="space-y-2 text-sm">
                            {weekDataWithDetails[selectedDay].data.completedMainTask !== undefined && (
                              <div className="flex justify-between">
                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Main Task Completed:</span>
                                <span className={`font-medium ${weekDataWithDetails[selectedDay].data.completedMainTask ? 'text-green-500' : 'text-red-500'}`}>
                                  {weekDataWithDetails[selectedDay].data.completedMainTask ? 'Yes' : 'No'}
                                </span>
                              </div>
                            )}
                            {weekDataWithDetails[selectedDay].data.eveningMood && (
                              <div className="flex justify-between">
                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Evening Mood:</span>
                                <span className={`font-medium ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{weekDataWithDetails[selectedDay].data.eveningMood}/5</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {weekDataWithDetails[selectedDay].data.winOfDay && (
                        <div className={`rounded-lg p-4 ${
                          isDarkMode 
                            ? 'bg-green-900/20 border border-green-700/30' 
                            : 'bg-green-50'
                        }`}>
                          <h5 className={`font-medium mb-2 ${
                            isDarkMode ? 'text-green-300' : 'text-green-900'
                          }`}>Today's Win</h5>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-green-200' : 'text-green-900'
                          }`}>{weekDataWithDetails[selectedDay].data.winOfDay}</p>
                        </div>
                      )}
                      
                      {weekDataWithDetails[selectedDay].data.obstacles && weekDataWithDetails[selectedDay].data.obstacles.length > 0 && (
                        <div className={`rounded-lg p-4 ${
                          isDarkMode 
                            ? 'bg-yellow-900/20 border border-yellow-700/30' 
                            : 'bg-yellow-50'
                        }`}>
                          <h5 className={`font-medium mb-2 ${
                            isDarkMode ? 'text-yellow-300' : 'text-yellow-900'
                          }`}>Main Obstacles</h5>
                          <div className="space-y-1">
                            {weekDataWithDetails[selectedDay].data.obstacles.map((obstacle, idx) => (
                              <div key={idx} className="flex items-center text-sm">
                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2"></div>
                                <span className={isDarkMode ? 'text-yellow-200' : 'text-yellow-900'}>{obstacle}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`text-center py-8 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <p>No evening review data for this day</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyLog;