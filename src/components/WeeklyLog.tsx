import React from 'react';
import { Clock } from 'lucide-react';
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
import priorityImg from '../../images/priority.jpg';
import tasksImg from '../../images/tasks.jpg';
import guitarImg from '../../images/guitar.jpg';
import connectImg from '../../images/connect.jpg';
import basicsImg from '../../images/basics.jpg';
import visionImg from '../../images/vision.jpg';
import mindfulImg from '../../images/mindful.jpg';

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

  // Helper types
  type DummyDay = {
    sleepData: { sleepQuality: number; bedTime: string; wakeTime: string; sleepHours: number };
    morningMood: string;
  };

  // Mood categorization helper functions
  const getMoodCategory = (mood: string) => {
    if (!mood || mood.trim() === '') return '';
    
    const positiveMoods = ['energised', 'ready', 'upbeat', 'motivated', 'excited', 'confident', 'calm', 'focused', 'optimistic', 'happy', 'productive', 'content'];
    const negativeMoods = ['low', 'struggling', 'tough mood', 'anxious', 'overwhelmed', 'unmotivated', 'sad', 'irritable', 'stuck', 'exhausted', 'frustrated', 'lonely', 'hopeless', 'tired', 'stressed', 'distracted', 'restless'];
    
    if (positiveMoods.includes(mood)) return 'positive';
    if (negativeMoods.includes(mood)) return 'negative';
    return 'neutral';
  };

  const getMoodCategoryColor = (category: string) => {
    if (!category || category === '') return 'text-gray-400 bg-gray-100';
    switch (category) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMoodCategoryIcon = (category: string) => {
    if (!category || category === '') return '';
    switch (category) {
      case 'positive': return '';
      case 'negative': return '';
      case 'neutral': return '';
      default: return '';
    }
  };

  const calculateDailyPoints = (dayData: any) => {
    let points = 0;
    
    // Morning flow completion: 10 points
    if (dayData.sleepQuality && dayData.morningMood && dayData.mainPriority) {
      points += 10;
    }
    
    // Evening flow completion: 10 points (use dayDescription per current flow)
    if (dayData.eveningMood && dayData.dayDescription) {
      points += 10;
    }
    
    // Main priority completion: 50 points
    if (dayData.completedMainTask) {
      points += 50;
    }
    
    // Additional tasks: 25 points each
    if (dayData.completedTasks) {
      points += dayData.completedTasks.filter(Boolean).length * 25;
    }
    
    // People to message: 30 points each
    if (dayData.completedPeople) {
      points += dayData.completedPeople.filter(Boolean).length * 30;
    }
    
    // Habits completion: 30 points each
    if (dayData.completedHabits) {
      points += dayData.completedHabits.length * 30;
    }
    
    // Basics: each 10 points
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

  const weekDataWithDetails = React.useMemo(() => {
    // Get 7 days of data based on week offset, aligned Sunday -> Saturday
  const getLast7Days = () => {
      const days = [] as Array<{ date: Date; dateStr: string; data: any; dayName: string; dayNumber: number }>; 
      // Reference date shifted by week offset
      const ref = new Date();
      ref.setHours(0, 0, 0, 0);
      ref.setDate(ref.getDate() + currentWeekOffset * 7);
      // Find Sunday of that week
      const sunday = new Date(ref);
      sunday.setDate(ref.getDate() - ref.getDay()); // 0 is Sunday

      for (let i = 0; i < 7; i++) {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);
      const dateStr = date.toDateString();
      const dayData = appData.dailyData[dateStr];
      days.push({
          date,
          dateStr,
        data: dayData || {},
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate()
      });
    }
    return days;
  };

    const baseWeekData = getLast7Days();

    return baseWeekData.map((day, index) => {
      // Return only real data, no dummy data
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
            }`}>Trends</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Your productivity journey
            </p>
          </div>
          
          {/* Week Navigation */}
          <div className="flex items-center space-x-2">
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
            
            <div className="text-center px-3">
              <div className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {currentWeekOffset === 0 ? 'This Week' : 
                 currentWeekOffset === -1 ? 'Last Week' : 
                 currentWeekOffset === 1 ? 'Next Week' : 
                 `${Math.abs(currentWeekOffset)} weeks ${currentWeekOffset < 0 ? 'ago' : 'ahead'}`}
              </div>
              <div className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {(() => {
                  // Compute Sunday -> Saturday range for currentWeekOffset
                  const ref = new Date();
                  ref.setHours(0, 0, 0, 0);
                  ref.setDate(ref.getDate() + currentWeekOffset * 7);
                  const sunday = new Date(ref);
                  sunday.setDate(ref.getDate() - ref.getDay());
                  const saturday = new Date(sunday);
                  saturday.setDate(sunday.getDate() + 6);
                  return `${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${saturday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                })()}
              </div>
            </div>
            
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
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src={visionImg} alt="This Week" className="w-full h-full object-cover" />
            </div>
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>This Week</h2>
          </div>
        </div>

        <div className="p-6">
          {/* Desktop Grid View */}
          <div className="hidden md:grid md:grid-cols-7 gap-4">
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

          {/* Mobile Vertical List View */}
          <div className="md:hidden space-y-3">
            {weekDataWithDetails.map((day, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 ${
                  isDarkMode 
                    ? 'border-gray-700 bg-gray-800 hover:bg-gray-700' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
                onClick={() => {
                  setSelectedDay(index);
                  setIsModalOpen(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {day.dayNumber}
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {day.dayName}
                      </div>
                      <div className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      calculateDailyPoints(day.data) > 0 
                        ? 'text-green-600' 
                        : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {calculateDailyPoints(day.data)} pts
                    </div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {day.date.toLocaleDateString('en-US', { weekday: 'long' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>



      {/* Priority Achievement Tracking */}
      <div className={`rounded-2xl shadow-sm border mb-12 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className={`p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src={priorityImg} alt="Priority" className="w-full h-full object-cover" />
            </div>
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Priority</h2>
            </div>
          </div>
        
        <div className="p-6">
          {/* Desktop Grid View */}
          <div className="hidden md:grid md:grid-cols-7 gap-4 mb-6">
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
                <div className={`text-[11px] mt-1 ${
                  day.data.completedMainTask
                    ? (isDarkMode ? 'text-green-300' : 'text-green-600')
                    : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {day.data.completedMainTask ? '+50 pts' : '+0 pts'}
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

          {/* Mobile Vertical List View */}
          <div className="md:hidden space-y-3">
            {weekDataWithDetails.map((day, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                isDarkMode 
                  ? 'border-gray-700 bg-gray-800' 
                  : 'border-gray-200 bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                      day.data.completedMainTask
                        ? 'bg-green-100 text-green-600 border-2 border-green-200'
                        : day.data.mainPriority
                          ? 'bg-yellow-100 text-yellow-600 border-2 border-yellow-200'
                          : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                    }`}>
                      {day.data.completedMainTask ? '✓' : day.data.mainPriority ? '!' : '—'}
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {day.dayName}
                      </div>
                      <div className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      day.data.completedMainTask
                        ? (isDarkMode ? 'text-green-300' : 'text-green-600')
                        : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {day.data.completedMainTask ? '+50 pts' : '+0 pts'}
                    </div>
                    <div className={`text-xs ${
                      day.data.completedMainTask
                        ? 'text-green-600 font-medium'
                        : day.data.mainPriority
                          ? 'text-yellow-600'
                          : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {day.data.completedMainTask ? 'Completed' : day.data.mainPriority ? 'Set' : 'No priority'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>

      {/* Additional Tasks Completed */}
      <div className={`rounded-2xl shadow-sm border mb-8 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className={`p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src={tasksImg} alt="Tasks" className="w-full h-full object-cover" />
            </div>
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Tasks</h2>
            </div>
          </div>
        <div className="p-6">
          {/* Desktop Grid View */}
          <div className="hidden md:grid md:grid-cols-7 gap-4 mb-6">
            {weekDataWithDetails.map((day, index) => {
              const completedCount = Array.isArray(day.data.completedTasks)
                ? day.data.completedTasks.filter(Boolean).length
                : 0;
              const totalTasks = Array.isArray(day.data.additionalTasks) ? day.data.additionalTasks.length : 0;
              const remaining = Math.max(totalTasks - completedCount, 0);
              const hasTasks = totalTasks > 0;
              const stateClass = completedCount > 0
                ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200'
                : hasTasks
                  ? 'bg-yellow-100 text-yellow-600 border-2 border-yellow-200'
                  : 'bg-gray-100 text-gray-400 border-2 border-gray-200';
              return (
                <div key={index} className="text-center">
                  <div className={`text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {day.dayName}
                  </div>
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-lg font-bold ${stateClass}`}>
                    {hasTasks ? completedCount : '—'}
                  </div>
                  <div className={`text-[11px] mt-2 ${
                    completedCount > 0
                      ? (isDarkMode ? 'text-indigo-300' : 'text-indigo-600')
                      : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {completedCount > 0 ? `+${completedCount * 25} pts` : '+0 pts'}
                  </div>
                  <div className={`text-xs mt-2 ${
                    completedCount > 0
                      ? (isDarkMode ? 'text-indigo-300 font-medium' : 'text-indigo-700 font-medium')
                      : hasTasks
                        ? 'text-yellow-600'
                        : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {completedCount > 0 ? `${completedCount} done` : hasTasks ? 'No tasks done' : 'No tasks set'}
                  </div>
                  {hasTasks && (
                    <div className={`text-[11px] mt-1 ${
                      remaining > 0
                        ? (isDarkMode ? 'text-yellow-300' : 'text-yellow-700')
                        : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {remaining > 0 ? `${remaining} not done` : 'All done'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Vertical List View */}
          <div className="md:hidden space-y-3">
            {weekDataWithDetails.map((day, index) => {
              const completedCount = Array.isArray(day.data.completedTasks)
                ? day.data.completedTasks.filter(Boolean).length
                : 0;
              const totalTasks = Array.isArray(day.data.additionalTasks) ? day.data.additionalTasks.length : 0;
              const remaining = Math.max(totalTasks - completedCount, 0);
              const hasTasks = totalTasks > 0;
              const stateClass = completedCount > 0
                ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200'
                : hasTasks
                  ? 'bg-yellow-100 text-yellow-600 border-2 border-yellow-200'
                  : 'bg-gray-100 text-gray-400 border-2 border-gray-200';
              return (
                <div key={index} className={`p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'border-gray-700 bg-gray-800' 
                    : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${stateClass}`}>
                        {hasTasks ? completedCount : '—'}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {day.dayName}
                        </div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        completedCount > 0
                          ? (isDarkMode ? 'text-indigo-300' : 'text-indigo-600')
                          : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {completedCount > 0 ? `+${completedCount * 25} pts` : '+0 pts'}
                      </div>
                      <div className={`text-xs ${
                        completedCount > 0
                          ? (isDarkMode ? 'text-indigo-300 font-medium' : 'text-indigo-700 font-medium')
                          : hasTasks
                            ? 'text-yellow-600'
                            : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {completedCount > 0 ? `${completedCount} done` : hasTasks ? 'No tasks done' : 'No tasks set'}
                      </div>
                      {hasTasks && (
                        <div className={`text-xs ${
                          remaining > 0
                            ? (isDarkMode ? 'text-yellow-300' : 'text-yellow-700')
                            : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {remaining > 0 ? `${remaining} not done` : 'All done'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Habits Completed */}
      <div className={`rounded-2xl shadow-sm border mb-8 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className={`p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src={guitarImg} alt="Habits" className="w-full h-full object-cover" />
            </div>
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Habits</h2>
          </div>
        </div>
        <div className="p-6">
          {/* Desktop Grid View */}
          <div className="hidden md:grid md:grid-cols-7 gap-4 mb-6">
            {weekDataWithDetails.map((day, index) => {
              const completedCount = Array.isArray(day.data.completedHabits)
                ? day.data.completedHabits.length
                : 0;
              const totalHabits = Array.isArray(day.data.habits) ? day.data.habits.length : 0;
              const remaining = Math.max(totalHabits - completedCount, 0);
              const hasHabits = totalHabits > 0;
              const stateClass = completedCount > 0
                ? 'bg-teal-100 text-teal-700 border-2 border-teal-200'
                : hasHabits
                  ? 'bg-yellow-100 text-yellow-600 border-2 border-yellow-200'
                  : 'bg-gray-100 text-gray-400 border-2 border-gray-200';
              return (
                <div key={index} className="text-center">
                  <div className={`text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {day.dayName}
                  </div>
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-lg font-bold ${stateClass}`}>
                    {hasHabits ? completedCount : '—'}
                  </div>
                  <div className={`text-[11px] mt-2 ${
                    completedCount > 0
                      ? (isDarkMode ? 'text-teal-300' : 'text-teal-700')
                      : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {completedCount > 0 ? `+${completedCount * 30} pts` : '+0 pts'}
                  </div>
                  <div className={`text-xs mt-2 ${
                    completedCount > 0
                      ? (isDarkMode ? 'text-teal-300 font-medium' : 'text-teal-700 font-medium')
                      : hasHabits
                        ? 'text-yellow-600'
                        : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {completedCount > 0 ? `${completedCount} done` : hasHabits ? 'No habits done' : 'No habits set'}
                  </div>
                  {hasHabits && (
                    <div className={`text-[11px] mt-1 ${
                      remaining > 0
                        ? (isDarkMode ? 'text-yellow-300' : 'text-yellow-700')
                        : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {remaining > 0 ? `${remaining} not done` : 'All done'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Vertical List View */}
          <div className="md:hidden space-y-3">
            {weekDataWithDetails.map((day, index) => {
              const completedCount = Array.isArray(day.data.completedHabits)
                ? day.data.completedHabits.length
                : 0;
              const totalHabits = Array.isArray(day.data.habits) ? day.data.habits.length : 0;
              const remaining = Math.max(totalHabits - completedCount, 0);
              const hasHabits = totalHabits > 0;
              const stateClass = completedCount > 0
                ? 'bg-teal-100 text-teal-700 border-2 border-teal-200'
                : hasHabits
                  ? 'bg-yellow-100 text-yellow-600 border-2 border-yellow-200'
                  : 'bg-gray-100 text-gray-400 border-2 border-gray-200';
              return (
                <div key={index} className={`p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'border-gray-700 bg-gray-800' 
                    : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${stateClass}`}>
                        {hasHabits ? completedCount : '—'}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {day.dayName}
                        </div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        completedCount > 0
                          ? (isDarkMode ? 'text-teal-300' : 'text-teal-700')
                          : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {completedCount > 0 ? `+${completedCount * 30} pts` : '+0 pts'}
                      </div>
                      <div className={`text-xs ${
                        completedCount > 0
                          ? (isDarkMode ? 'text-teal-300 font-medium' : 'text-teal-700 font-medium')
                          : hasHabits
                            ? 'text-yellow-600'
                            : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {completedCount > 0 ? `${completedCount} done` : hasHabits ? 'No habits done' : 'No habits set'}
                      </div>
                      {hasHabits && (
                        <div className={`text-xs ${
                          remaining > 0
                            ? (isDarkMode ? 'text-yellow-300' : 'text-yellow-700')
                            : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {remaining > 0 ? `${remaining} not done` : 'All done'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
        
      {/* Connect Completed */}
      <div className={`rounded-2xl shadow-sm border mb-8 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className={`p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src={connectImg} alt="Connect" className="w-full h-full object-cover" />
                  </div>
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Connect</h2>
                  </div>
                </div>
        <div className="p-6">
          {/* Desktop Grid View */}
          <div className="hidden md:grid md:grid-cols-7 gap-4 mb-6">
            {weekDataWithDetails.map((day, index) => {
              const completedCount = Array.isArray(day.data.completedPeople)
                ? day.data.completedPeople.filter(Boolean).length
                : 0;
              const totalPeople = Array.isArray(day.data.peopleToMessage) ? day.data.peopleToMessage.length : 0;
              const remaining = Math.max(totalPeople - completedCount, 0);
              const hasPeople = totalPeople > 0;
              const stateClass = completedCount > 0
                ? 'bg-orange-100 text-orange-700 border-2 border-orange-200'
                : hasPeople
                  ? 'bg-yellow-100 text-yellow-600 border-2 border-yellow-200'
                  : 'bg-gray-100 text-gray-400 border-2 border-gray-200';
              return (
                <div key={index} className="text-center">
                  <div className={`text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {day.dayName}
                  </div>
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-lg font-bold ${stateClass}`}>
                    {hasPeople ? completedCount : '—'}
                  </div>
                  <div className={`text-xs mt-2 ${
                    completedCount > 0
                      ? (isDarkMode ? 'text-orange-300 font-medium' : 'text-orange-700 font-medium')
                      : hasPeople
                        ? 'text-yellow-600'
                        : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {completedCount > 0 ? `${completedCount} done` : hasPeople ? 'No connections done' : 'No connections set'}
                  </div>
                  {hasPeople && (
                    <div className={`text-[11px] mt-1 ${
                      remaining > 0
                        ? (isDarkMode ? 'text-yellow-300' : 'text-yellow-700')
                        : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {remaining > 0 ? `${remaining} not done` : 'All done'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Vertical List View */}
          <div className="md:hidden space-y-3">
            {weekDataWithDetails.map((day, index) => {
              const completedCount = Array.isArray(day.data.completedPeople)
                ? day.data.completedPeople.filter(Boolean).length
                : 0;
              const totalPeople = Array.isArray(day.data.peopleToMessage) ? day.data.peopleToMessage.length : 0;
              const remaining = Math.max(totalPeople - completedCount, 0);
              const hasPeople = totalPeople > 0;
              const stateClass = completedCount > 0
                ? 'bg-orange-100 text-orange-700 border-2 border-orange-200'
                : hasPeople
                  ? 'bg-yellow-100 text-yellow-600 border-2 border-yellow-200'
                  : 'bg-gray-100 text-gray-400 border-2 border-gray-200';
              return (
                <div key={index} className={`p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'border-gray-700 bg-gray-800' 
                    : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${stateClass}`}>
                        {hasPeople ? completedCount : '—'}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {day.dayName}
                        </div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        completedCount > 0
                          ? (isDarkMode ? 'text-orange-300 font-medium' : 'text-orange-700 font-medium')
                          : hasPeople
                            ? 'text-yellow-600'
                            : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {completedCount > 0 ? `${completedCount} done` : hasPeople ? 'No connections done' : 'No connections set'}
                      </div>
                      {hasPeople && (
                        <div className={`text-xs ${
                          remaining > 0
                            ? (isDarkMode ? 'text-yellow-300' : 'text-yellow-700')
                            : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {remaining > 0 ? `${remaining} not done` : 'All done'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
                
      {/* Basics Completed */}
      <div className={`rounded-2xl shadow-sm border mb-8 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className={`p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src={basicsImg} alt="Basics" className="w-full h-full object-cover" />
                  </div>
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Basics</h2>
                  </div>
                </div>
        <div className="p-6">
          {/* Desktop Grid View */}
          <div className="hidden md:grid md:grid-cols-7 gap-4 mb-6">
            {weekDataWithDetails.map((day, index) => {
              const basics = day.data.basics || {};
              const achievedCount = ['drankWater','ateHealthy','listenedToSomething','wasMindful','steps10k','sleep7h']
                .map(k => (basics as any)[k])
                .filter(Boolean).length;
              const totalBasics = 6;
              const remaining = totalBasics - achievedCount;
              const hasBasics = Boolean(day.data.basics);
              const stateClass = achievedCount > 0
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                : hasBasics
                  ? 'bg-yellow-100 text-yellow-600 border-2 border-yellow-200'
                  : 'bg-gray-100 text-gray-400 border-2 border-gray-200';
              return (
                <div key={index} className="text-center">
                  <div className={`text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {day.dayName}
                  </div>
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-lg font-bold ${stateClass}`}>
                    {hasBasics ? achievedCount : '—'}
                  </div>
                  <div className={`text-[11px] mt-2 ${
                    achievedCount > 0
                      ? (isDarkMode ? 'text-blue-300' : 'text-blue-700')
                      : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {achievedCount > 0 ? `+${achievedCount * 10} pts` : '+0 pts'}
                  </div>
                  <div className={`text-xs mt-2 ${
                    achievedCount > 0
                      ? (isDarkMode ? 'text-blue-300 font-medium' : 'text-blue-700 font-medium')
                      : hasBasics
                        ? 'text-yellow-600'
                        : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {achievedCount > 0 ? `${achievedCount} done` : hasBasics ? 'No basics done' : 'No basics set'}
                  </div>
                  {hasBasics && (
                    <div className={`text-[11px] mt-1 ${
                      remaining > 0
                        ? (isDarkMode ? 'text-yellow-300' : 'text-yellow-700')
                        : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {remaining > 0 ? `${remaining} not done` : 'All done'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Vertical List View */}
          <div className="md:hidden space-y-3">
            {weekDataWithDetails.map((day, index) => {
              const basics = day.data.basics || {};
              const achievedCount = ['drankWater','ateHealthy','listenedToSomething','wasMindful','steps10k','sleep7h']
                .map(k => (basics as any)[k])
                .filter(Boolean).length;
              const totalBasics = 6;
              const remaining = totalBasics - achievedCount;
              const hasBasics = Boolean(day.data.basics);
              const stateClass = achievedCount > 0
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                : hasBasics
                  ? 'bg-yellow-100 text-yellow-600 border-2 border-yellow-200'
                  : 'bg-gray-100 text-gray-400 border-2 border-gray-200';
              return (
                <div key={index} className={`p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'border-gray-700 bg-gray-800' 
                    : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${stateClass}`}>
                        {hasBasics ? achievedCount : '—'}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {day.dayName}
                        </div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        achievedCount > 0
                          ? (isDarkMode ? 'text-blue-300' : 'text-blue-700')
                          : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {achievedCount > 0 ? `+${achievedCount * 10} pts` : '+0 pts'}
                      </div>
                      <div className={`text-xs ${
                        achievedCount > 0
                          ? (isDarkMode ? 'text-blue-300 font-medium' : 'text-blue-700 font-medium')
                          : hasBasics
                            ? 'text-yellow-600'
                            : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {achievedCount > 0 ? `${achievedCount} done` : hasBasics ? 'No basics done' : 'No basics set'}
                      </div>
                      {hasBasics && (
                        <div className={`text-xs ${
                          remaining > 0
                            ? (isDarkMode ? 'text-yellow-300' : 'text-yellow-700')
                            : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {remaining > 0 ? `${remaining} not done` : 'All done'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src={mindfulImg} alt="Sleep Tracking" className="w-full h-full object-cover" />
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
                       },
                       border: {
                         color: '#E5E7EB',
                         display: false,
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
            {/* Desktop Table View */}
            <div className="hidden md:block">
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {weekDataWithDetails.map((day, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                }`}>
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{day.dayName}</span>
                      <span className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>{day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    {day.data.sleepQuality && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSleepScoreColor(day.data.sleepQuality)}`}>
                        {day.data.sleepQuality}/5
                      </span>
                    )}
                  </div>
                  
                  {/* Sleep Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Bed Time</span>
                      <div className="flex items-center space-x-2">
                        <Clock size={14} className="text-gray-400" />
                        <span className={`text-sm ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{formatTime(day.data.bedTime) || '—'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Wake Time</span>
                      <div className="flex items-center space-x-2">
                        <Clock size={14} className="text-gray-400" />
                        <span className={`text-sm ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{formatTime(day.data.wakeTime) || '—'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Duration</span>
                      {(() => {
                        const duration = day.data.sleepHours ? 
                          day.data.sleepHours : 
                          (day.data.bedTime && day.data.wakeTime) ? 
                          calculateSleepDuration(day.data.bedTime, day.data.wakeTime) : null;
                        
                        if (duration === null) {
                          return <span className="text-sm text-gray-400">—</span>;
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
                    </div>
                  </div>
                </div>
              ))}
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
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src={mindfulImg} alt="Morning Mood" className="w-full h-full object-cover" />
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
              {/* Desktop Table View */}
              <div className="hidden md:block">
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
                            {day.data.morningMood ? (
                              <span className={`text-sm capitalize ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{day.data.morningMood}</span>
                            ) : null}
                          </td>
                          <td className="py-3 px-4">
                            {moodCategory ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMoodCategoryColor(moodCategory)}`}>
                                <span className="mr-1">{getMoodCategoryIcon(moodCategory)}</span>
                                {moodCategory.charAt(0).toUpperCase() + moodCategory.slice(1)}
                              </span>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {weekDataWithDetails.map((day, index) => {
                  const moodCategory = getMoodCategory(day.data.morningMood);
                  return (
                    <div key={index} className={`p-4 rounded-lg border ${
                      isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                    }`}>
                      {/* Day Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>{day.dayName}</span>
                          <span className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>{day.dayNumber}</span>
                        </div>
                        {moodCategory && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMoodCategoryColor(moodCategory)}`}>
                            <span className="mr-1">{getMoodCategoryIcon(moodCategory)}</span>
                            {moodCategory.charAt(0).toUpperCase() + moodCategory.slice(1)}
                          </span>
                        )}
                      </div>
                      
                      {/* Mood Details */}
                      {day.data.morningMood && (
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Mood</span>
                          <span className={`text-sm capitalize ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>{day.data.morningMood}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evening Mood Panel */}
      <div className={`rounded-2xl shadow-sm border mb-8 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className={`p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src={mindfulImg} alt="Evening Mood" className="w-full h-full object-cover" />
            </div>
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Evening Mood</h2>
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
                        weekDataWithDetails.filter(day => getMoodCategory(String(day.data.eveningMood || '').toLowerCase()) === 'positive').length,
                        weekDataWithDetails.filter(day => getMoodCategory(String(day.data.eveningMood || '').toLowerCase()) === 'neutral').length,
                        weekDataWithDetails.filter(day => getMoodCategory(String(day.data.eveningMood || '').toLowerCase()) === 'negative').length,
                      ],
                      backgroundColor: [
                        '#10B981',
                        '#F59E0B',
                        '#EF4444',
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
                        font: { size: 12 },
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
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = total ? ((context.parsed / total) * 100).toFixed(1) : '0.0';
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
              {/* Desktop Table View */}
              <div className="hidden md:block">
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
                      const moodValue = String(day.data.eveningMood || '').toLowerCase();
                      const moodCategory = getMoodCategory(moodValue);
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
                            {day.data.eveningMood ? (
                              <span className={`text-sm capitalize ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{day.data.eveningMood}</span>
                            ) : null}
                          </td>
                          <td className="py-3 px-4">
                            {moodCategory ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMoodCategoryColor(moodCategory)}`}>
                                <span className="mr-1">{getMoodCategoryIcon(moodCategory)}</span>
                                {moodCategory.charAt(0).toUpperCase() + moodCategory.slice(1)}
                              </span>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {weekDataWithDetails.map((day, index) => {
                  const moodValue = String(day.data.eveningMood || '').toLowerCase();
                  const moodCategory = getMoodCategory(moodValue);
                  return (
                    <div key={index} className={`p-4 rounded-lg border ${
                      isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                    }`}>
                      {/* Day Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>{day.dayName}</span>
                          <span className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>{day.dayNumber}</span>
                        </div>
                        {moodCategory && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMoodCategoryColor(moodCategory)}`}>
                            <span className="mr-1">{getMoodCategoryIcon(moodCategory)}</span>
                            {moodCategory.charAt(0).toUpperCase() + moodCategory.slice(1)}
                          </span>
                        )}
                      </div>
                      
                      {/* Mood Details */}
                      {day.data.eveningMood && (
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Mood</span>
                          <span className={`text-sm capitalize ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>{day.data.eveningMood}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Day Details Modal */}
      {isModalOpen && selectedDay !== null && weekDataWithDetails[selectedDay] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${
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
                {/* Daily Overview */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Sleep */}
                    {(weekDataWithDetails[selectedDay].data.bedTime || weekDataWithDetails[selectedDay].data.wakeTime || weekDataWithDetails[selectedDay].data.sleepQuality) && (
                      <div className={`rounded-lg p-4 ${
                        isDarkMode 
                          ? 'bg-blue-900/20 border border-blue-700/30' 
                          : 'bg-blue-50'
                      }`}>
                        <h5 className={`font-medium mb-3 ${
                          isDarkMode ? 'text-blue-300' : 'text-blue-900'
                        }`}>Sleep</h5>
                        <div className="space-y-3 text-sm">
                          {weekDataWithDetails[selectedDay].data.bedTime && (
                            <div className="flex justify-between">
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Bed Time:</span>
                              <span className={`font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {formatTime(weekDataWithDetails[selectedDay].data.bedTime)}
                              </span>
                            </div>
                          )}
                          {weekDataWithDetails[selectedDay].data.wakeTime && (
                            <div className="flex justify-between">
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Wake Time:</span>
                              <span className={`font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {formatTime(weekDataWithDetails[selectedDay].data.wakeTime)}
                              </span>
                  </div>
                          )}
                          {(weekDataWithDetails[selectedDay].data.bedTime && weekDataWithDetails[selectedDay].data.wakeTime) && (
                            <div className="flex justify-between">
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Sleep Duration:</span>
                              <span className={`font-medium ${
                                (() => {
                                  const duration = calculateSleepDuration(weekDataWithDetails[selectedDay].data.bedTime!, weekDataWithDetails[selectedDay].data.wakeTime!);
                                  return duration && duration >= 7 ? 'text-green-600' : 'text-red-600';
                                })()
                              }`}>
                                {(() => {
                                  const duration = calculateSleepDuration(weekDataWithDetails[selectedDay].data.bedTime!, weekDataWithDetails[selectedDay].data.wakeTime!);
                                  return duration ? `${duration}h` : '—';
                                })()}
                              </span>
                </div>
                          )}
                          {weekDataWithDetails[selectedDay].data.sleepQuality && (
                            <div className="flex justify-between">
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Sleep Quality:</span>
                              <span className={`font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{weekDataWithDetails[selectedDay].data.sleepQuality}/5</span>
              </div>
                          )}

                        </div>
                </div>
              )}

                    {/* Priority */}
                    {weekDataWithDetails[selectedDay].data.mainPriority && (
                      <div className={`rounded-lg p-4 ${
                        isDarkMode 
                          ? 'bg-green-900/20 border border-green-700/30' 
                          : 'bg-green-50'
                      }`}>
                        <h5 className={`font-medium mb-3 ${
                          isDarkMode ? 'text-green-300' : 'text-green-900'
                        }`}>Priority</h5>
                        <div className="space-y-2">
                          <p className={`text-sm ${
                            isDarkMode ? 'text-green-100' : 'text-green-900'
                          }`}>{weekDataWithDetails[selectedDay].data.mainPriority}</p>
                          {weekDataWithDetails[selectedDay].data.firstStep && (
                            <p className={`text-xs ${
                              isDarkMode ? 'text-green-200/70' : 'text-green-700'
                            }`}>First step: {weekDataWithDetails[selectedDay].data.firstStep}</p>
                          )}
                          {weekDataWithDetails[selectedDay].data.completedMainTask !== undefined && (
                            <div className="flex items-center text-sm mt-2">
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                weekDataWithDetails[selectedDay].data.completedMainTask ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className={`font-medium ${
                                weekDataWithDetails[selectedDay].data.completedMainTask ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {weekDataWithDetails[selectedDay].data.completedMainTask ? 'Completed' : 'Not completed'}
                      </span>
                            </div>
                          )}
                  </div>
                </div>
              )}

                    {/* Tasks */}
                    {weekDataWithDetails[selectedDay].data.additionalTasks && weekDataWithDetails[selectedDay].data.additionalTasks.length > 0 && (
                      <div className={`rounded-lg p-4 ${
                        isDarkMode 
                          ? 'bg-purple-900/20 border border-purple-700/30' 
                          : 'bg-purple-50'
                      }`}>
                        <h5 className={`font-medium mb-3 ${
                          isDarkMode ? 'text-purple-300' : 'text-purple-900'
                        }`}>Tasks</h5>
                        <div className="space-y-2">
                          {weekDataWithDetails[selectedDay].data.additionalTasks.map((task: string, idx: number) => {
                            const isCompleted = weekDataWithDetails[selectedDay].data.completedTasks?.[idx];
                            return (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center flex-1 min-w-0">
                                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 flex-shrink-0"></div>
                                  <span className={`truncate ${isDarkMode ? 'text-purple-100' : 'text-purple-900'}`}>{task}</span>
                                </div>
                                <span className={`text-xs font-medium ml-2 flex-shrink-0 ${
                                  isCompleted 
                                    ? 'text-green-500' 
                                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {isCompleted ? '✓' : '—'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column content moved below in single column */}
                  <div className="space-y-6">
                    {/* Connect */}
                    {weekDataWithDetails[selectedDay].data.peopleToMessage && weekDataWithDetails[selectedDay].data.peopleToMessage.length > 0 && (
                      <div className={`rounded-lg p-4 ${
                        isDarkMode 
                          ? 'bg-orange-900/20 border border-orange-700/30' 
                          : 'bg-orange-50'
                      }`}>
                        <h5 className={`font-medium mb-3 ${
                          isDarkMode ? 'text-orange-300' : 'text-orange-900'
                        }`}>Connect</h5>
                        <div className="space-y-2">
                          {weekDataWithDetails[selectedDay].data.peopleToMessage.map((person: string, idx: number) => {
                            const isCompleted = weekDataWithDetails[selectedDay].data.completedPeople?.[idx];
                            return (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center flex-1 min-w-0">
                                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2 flex-shrink-0"></div>
                                  <span className={`truncate ${isDarkMode ? 'text-orange-100' : 'text-orange-900'}`}>{person}</span>
                                </div>
                                <span className={`text-xs font-medium ml-2 flex-shrink-0 ${
                                  isCompleted 
                                    ? 'text-green-500' 
                                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {isCompleted ? '✓' : '—'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Habits */}
                    {weekDataWithDetails[selectedDay].data.habits && weekDataWithDetails[selectedDay].data.habits.length > 0 && (
                      <div className={`rounded-lg p-4 ${
                        isDarkMode 
                          ? 'bg-teal-900/20 border border-teal-700/30' 
                          : 'bg-teal-50'
                      }`}>
                        <h5 className={`font-medium mb-3 ${
                          isDarkMode ? 'text-teal-300' : 'text-teal-900'
                        }`}>Habits</h5>
                        <div className="space-y-3">
                          {weekDataWithDetails[selectedDay].data.habits.map((habitId: string, idx: number) => {
                            const habitLabels: { [key: string]: string } = {
                              'guitar': 'Guitar',
                              'write': 'Write',
                              'read': 'Read',
                              'exercise': 'Exercise',
                              'socialise': 'Socialise'
                            };
                            const habitLabel = habitLabels[habitId] || habitId;
                            const isCompleted = weekDataWithDetails[selectedDay].data.completedHabits?.includes(habitId) || false;
                            const habitDetails = weekDataWithDetails[selectedDay].data.habitDetails?.[habitId];
                            
                            return (
                              <div key={idx} className="text-sm">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center flex-1 min-w-0">
                                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2 flex-shrink-0"></div>
                                    <span className={`truncate ${isDarkMode ? 'text-teal-100' : 'text-teal-900'}`}>
                                      {habitLabel}
                                    </span>
                                  </div>
                                  <span className={`text-xs font-medium ml-2 flex-shrink-0 ${
                                    isCompleted 
                                      ? 'text-green-500' 
                                      : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    {isCompleted ? '✓' : '—'}
                                  </span>
                                </div>
                                {isCompleted && habitDetails && (
                                  <div className="ml-3.5 mt-1 text-xs opacity-75">
                                    <span className={`truncate block ${isDarkMode ? 'text-teal-200' : 'text-teal-700'}`}>{habitDetails}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Meetings and Appointments */}
                    {weekDataWithDetails[selectedDay].data.meetings && weekDataWithDetails[selectedDay].data.meetings.length > 0 && (
                      <div className={`rounded-lg p-4 ${
                        isDarkMode 
                          ? 'bg-blue-900/20 border border-blue-700/30' 
                          : 'bg-blue-50'
                      }`}>
                        <h5 className={`font-medium mb-3 ${
                          isDarkMode ? 'text-blue-300' : 'text-blue-900'
                        }`}>Meetings & Appointments</h5>
                        <div className="space-y-2">
                          {weekDataWithDetails[selectedDay].data.meetings.map((meeting: { title: string; startTime: string; endTime: string }, idx: number) => (
                            <div key={idx} className="text-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center flex-1 min-w-0">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                                  <span className={`truncate ${isDarkMode ? 'text-blue-100' : 'text-blue-900'}`}>
                                    {meeting.title}
                                  </span>
                                </div>
                                <span className={`text-xs font-medium ml-2 flex-shrink-0 ${
                                  isDarkMode ? 'text-blue-200' : 'text-blue-700'
                                }`}>
                                  {meeting.startTime} - {meeting.endTime}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Journals */}
                    {(weekDataWithDetails[selectedDay].data.morningMood || weekDataWithDetails[selectedDay].data.morningFeelings || weekDataWithDetails[selectedDay].data.eveningMood || weekDataWithDetails[selectedDay].data.dayDescription) && (
                      <div className={`rounded-lg p-4 ${
                        isDarkMode 
                          ? 'bg-purple-900/20 border border-purple-700/30' 
                          : 'bg-purple-50'
                      }`}>
                        <h5 className={`font-medium mb-3 ${
                          isDarkMode ? 'text-purple-300' : 'text-purple-900'
                        }`}>Journals</h5>
                        <div className="space-y-4">
                          {/* Morning Mood */}
                          {weekDataWithDetails[selectedDay].data.morningMood && (
                            <div>
                              <div className={`text-sm font-medium mb-2 ${
                                isDarkMode ? 'text-purple-200' : 'text-purple-800'
                              }`}>Morning Mood</div>
                              <p className={`text-sm font-medium capitalize ${
                                (() => {
                                  const mood = weekDataWithDetails[selectedDay].data.morningMood.toLowerCase();
                                  const positiveWords = ['energised', 'ready', 'upbeat', 'motivated', 'excited', 'confident', 'calm', 'focused', 'optimistic', 'happy', 'productive', 'content'];
                                  const negativeWords = ['tired', 'stressed', 'distracted', 'restless', 'anxious', 'overwhelmed', 'unmotivated', 'sad', 'irritable', 'stuck', 'exhausted', 'frustrated', 'lonely', 'hopeless'];
                                  
                                  if (positiveWords.includes(mood)) {
                                    return 'text-green-600';
                                  } else if (negativeWords.includes(mood)) {
                                    return 'text-red-600';
                                  } else {
                                    return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
                                  }
                                })()
                              }`}>
                                {weekDataWithDetails[selectedDay].data.morningMood}
                              </p>
                            </div>
                          )}

                          {/* Morning Journal */}
                          {weekDataWithDetails[selectedDay].data.morningFeelings && (
                            <div>
                              <div className={`text-sm font-medium mb-2 ${
                                isDarkMode ? 'text-purple-200' : 'text-purple-800'
                              }`}>Morning Journal</div>
                              <p className={`text-sm ${
                                isDarkMode ? 'text-purple-100' : 'text-purple-900'
                              }`}>{weekDataWithDetails[selectedDay].data.morningFeelings}</p>
                            </div>
                          )}
                          
                          {/* Evening Mood */}
                          {weekDataWithDetails[selectedDay].data.eveningMood && (
                            <div>
                              <div className={`text-sm font-medium mb-2 ${
                                isDarkMode ? 'text-purple-200' : 'text-purple-800'
                              }`}>Evening Mood</div>
                              <p className={`text-sm font-medium capitalize ${
                                (() => {
                                  const mood = weekDataWithDetails[selectedDay].data.eveningMood.toLowerCase();
                                  const positiveWords = ['energised', 'ready', 'upbeat', 'motivated', 'excited', 'confident', 'calm', 'focused', 'optimistic', 'happy', 'productive', 'content'];
                                  const negativeWords = ['tired', 'stressed', 'distracted', 'restless', 'anxious', 'overwhelmed', 'unmotivated', 'sad', 'irritable', 'stuck', 'exhausted', 'frustrated', 'lonely', 'hopeless'];
                                  
                                  if (positiveWords.includes(mood)) {
                                    return 'text-green-600';
                                  } else if (negativeWords.includes(mood)) {
                                    return 'text-red-600';
                                  } else {
                                    return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
                                  }
                                })()
                              }`}>
                                {weekDataWithDetails[selectedDay].data.eveningMood}
                              </p>
                            </div>
                          )}

                          {/* Evening Journal */}
                          {weekDataWithDetails[selectedDay].data.dayDescription && (
                            <div>
                              <div className={`text-sm font-medium mb-2 ${
                                isDarkMode ? 'text-purple-200' : 'text-purple-800'
                              }`}>Evening Journal</div>
                              <p className={`text-sm ${
                                isDarkMode ? 'text-purple-100' : 'text-purple-900'
                              }`}>{weekDataWithDetails[selectedDay].data.dayDescription}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyLog;