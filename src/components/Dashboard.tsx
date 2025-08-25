import React, { useState, useEffect } from 'react';
import { Sun, Moon, CheckCircle2, Circle, Users, Play, Pause, RotateCcw, Trophy, Flame, RefreshCw, GlassWater } from 'lucide-react';
import { AppData, DailyData } from '../types';
import { clearAppData } from '../utils/storage';

interface DashboardProps {
  appData: AppData;
  todaysData: DailyData;
  onStartMorning: () => void;
  onStartEvening: () => void;
  onUpdateData: (data: Partial<DailyData>) => void;
  onAddPoints: (points: number) => void;
  hasCompletedMorning: boolean;
  hasCompletedEvening: boolean;
  onResetData: () => void;
  isDarkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({
  appData,
  todaysData,
  onStartMorning,
  onStartEvening,
  onUpdateData,
  onAddPoints,
  hasCompletedMorning,
  hasCompletedEvening,
  onResetData,
  isDarkMode
}) => {
  const [showPointsNotification, setShowPointsNotification] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

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

  const addPointsWithNotification = (points: number) => {
    onAddPoints(points);
    setPointsEarned(points);
    setShowPointsNotification(true);
    setTimeout(() => setShowPointsNotification(false), 2000);
  };
  const toggleTask = (index: number) => {
    const completedTasks = todaysData.completedTasks || [false, false, false];
    const newCompleted = [...completedTasks];
    newCompleted[index] = !newCompleted[index];
    
    if (newCompleted[index]) {
      onAddPoints(10);
    }
    
    onUpdateData({ completedTasks: newCompleted });
  };

  const toggleMainTask = () => {
    const newCompleted = !todaysData.completedMainTask;
    if (newCompleted) {
      addPointsWithNotification(50);
    }
    onUpdateData({ completedMainTask: newCompleted });
  };

  const togglePerson = (index: number) => {
    const completedPeople = todaysData.completedPeople || [false, false, false, false];
    const newCompleted = [...completedPeople];
    newCompleted[index] = !newCompleted[index];
    
    if (newCompleted[index]) {
      onAddPoints(5);
    }
    
    onUpdateData({ completedPeople: newCompleted });
  };

  const addNewTask = () => {
    setShowAddTaskModal(true);
  };

  const handleSubmitNewTask = () => {
    if (newTaskText.trim()) {
      const currentTasks = todaysData.additionalTasks || [];
      const currentCompleted = todaysData.completedTasks || [];
      
      const updatedTasks = [...currentTasks, newTaskText.trim()];
      const updatedCompleted = [...currentCompleted, false];
      
      onUpdateData({ 
        additionalTasks: updatedTasks,
        completedTasks: updatedCompleted
      });
      
      setNewTaskText('');
      setShowAddTaskModal(false);
    }
  };

  const handleCancelNewTask = () => {
    setNewTaskText('');
    setShowAddTaskModal(false);
  };

  const getMoodText = (mood: number) => {
    const moods = ['Poor', 'Fair', 'Okay', 'Good', 'Great'];
    return moods[mood - 1] || 'Okay';
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

  const getSleepText = (quality: number) => {
    const descriptions = ['Poor', 'Fair', 'Good', 'Great', 'Excellent'];
    return descriptions[quality - 1] || 'Not set';
  };

  // Check if there's no active day (no morning check-in completed)
  const hasNoActiveDay = !hasCompletedMorning;

  if (hasNoActiveDay) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-fade-in">
        <div className="text-center space-y-8 max-w-md mx-auto px-6">
          {/* Date Display */}
          <div className={`backdrop-blur-sm rounded-2xl p-8 shadow-lg border ${
            isDarkMode 
              ? 'bg-gray-800/80 border-gray-700' 
              : 'bg-white/80 border-gray-100'
          }`}>
            <div className="space-y-4">
              <div className="text-6xl font-bold text-gray-300 mb-2">
                {new Date().getDate()}
              </div>
              <div className={`text-xl font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long'
                })}
              </div>
            </div>
          </div>

          {/* Start My Day Button */}
          <div className="space-y-4">
            <button
              onClick={onStartMorning}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-12 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-2xl animate-pulse-glow"
            >
              <div className="flex items-center justify-center space-x-3">
                <Sun size={24} className="animate-float" />
                <span>Start My Day</span>
              </div>
            </button>
            
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Begin your morning check-in to start tracking today's progress
            </p>
          </div>


        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Points Notification */}
      {showPointsNotification && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg animate-slide-up ${
          isDarkMode 
            ? 'bg-green-600 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <Trophy size={20} />
            <span className="font-semibold">+{pointsEarned} points!</span>
          </div>
        </div>
      )}
      {/* Welcome Section */}
      <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
        isDarkMode 
          ? 'bg-gray-800/80 border-gray-700' 
          : 'bg-white/80 border-gray-100'
      }`}>
        <div className="mb-6">
          <h2 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}! 
          </h2>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Ready to make today productive?</p>
        </div>

        {/* Flow Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onStartMorning}
            disabled={hasCompletedMorning}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ease-out transform hover:scale-105 ${
              hasCompletedMorning
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-xl hover:-translate-y-1 animate-pulse-glow'
            }`}
          >
            <Sun size={20} className="animate-float" />
            <span>{hasCompletedMorning ? 'Morning Complete!' : 'Start My Day'}</span>
          </button>

          <button
            onClick={onStartEvening}
            disabled={hasCompletedEvening}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ease-out transform hover:scale-105 ${
              hasCompletedEvening
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:shadow-xl hover:-translate-y-1 animate-pulse-glow'
            }`}
          >
            <Moon size={20} className="animate-float" />
            <span>{hasCompletedEvening ? 'Evening Complete!' : 'Review My Day'}</span>
          </button>

          <button
            onClick={onResetData}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 ${
              isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Reset all data and start fresh"
          >
            <RefreshCw size={18} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Good Day Vision */}
        {todaysData.goodDayVision && (
          <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
            isDarkMode 
              ? 'bg-gray-800/80 border-gray-700' 
              : 'bg-white/80 border-gray-100'
          }`} style={{animationDelay: '0.05s'}}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <span>🌟</span>
                              <span>Vision</span>
            </h3>
            <div className={`p-4 rounded-xl ${
              isDarkMode 
                ? 'bg-gray-700/50' 
                : 'bg-blue-50/50'
            }`}>
              <p className={`text-sm leading-relaxed ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {todaysData.goodDayVision}
              </p>
            </div>
          </div>
        )}

        {/* Today's Priorities */}
          {/* Main Priority */}
          {todaysData.mainPriority && (
            <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
              isDarkMode 
                ? 'bg-gray-800/80 border-gray-700' 
                : 'bg-white/80 border-gray-100'
            }`} style={{animationDelay: '0.1s'}}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>🎯 Priority</h3>
              <div 
                className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-blue-50 hover:bg-blue-100'
                }`}
                onClick={toggleMainTask}
              >
                {todaysData.completedMainTask ? (
                  <CheckCircle2 className="text-green-500 flex-shrink-0" size={24} />
                ) : (
                  <Circle className="text-gray-400 flex-shrink-0" size={24} />
                )}
                <span className={`font-medium ${
                  todaysData.completedMainTask 
                    ? 'text-green-400 line-through' 
                    : isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {todaysData.mainPriority}
                </span>
              </div>
            </div>
          )}

                          {/* Key Tasks */}
          {todaysData.additionalTasks && todaysData.additionalTasks.length > 0 && (
            <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
              isDarkMode 
                ? 'bg-gray-800/80 border-gray-700' 
                : 'bg-white/80 border-gray-100'
            }`} style={{animationDelay: '0.2s'}}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>📋 Tasks</h3>
              <div className="space-y-3">
                {todaysData.additionalTasks.map((task, index) => (
                  <div 
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => toggleTask(index)}
                  >
                    {(todaysData.completedTasks || [])[index] ? (
                      <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
                    ) : (
                      <Circle className="text-gray-400 flex-shrink-0" size={20} />
                    )}
                    <span className={`${
                      (todaysData.completedTasks || [])[index] 
                        ? 'text-green-400 line-through' 
                        : isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      {task}
                    </span>
                  </div>
                ))}
                <button
                  onClick={addNewTask}
                  className={`w-full p-3 rounded-xl border-2 border-dashed transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  + Add Task
                </button>
              </div>
            </div>
          )}

                          {/* Connect */}
          {todaysData.peopleToMessage && todaysData.peopleToMessage.length > 0 && (
            <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
              isDarkMode 
                ? 'bg-gray-800/80 border-gray-700' 
                : 'bg-white/80 border-gray-100'
            }`} style={{animationDelay: '0.3s'}}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Users size={20} />
                <span>Connect</span>
              </h3>
              <div className="space-y-3">
                {todaysData.peopleToMessage.map((person, index) => (
                  <div 
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => togglePerson(index)}
                  >
                    {(todaysData.completedPeople || [])[index] ? (
                      <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
                    ) : (
                      <Circle className="text-gray-400 flex-shrink-0" size={20} />
                    )}
                    <span className={`${
                      (todaysData.completedPeople || [])[index] 
                        ? 'text-green-600 line-through' 
                        : isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      {person}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

                      {/* Habits */}
          {todaysData.habits && todaysData.habits.length > 0 && (
            <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
              isDarkMode 
                ? 'bg-gray-800/80 border-gray-700' 
                : 'bg-white/80 border-gray-100'
            }`} style={{animationDelay: '0.35s'}}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <span>🎯</span>
                <span>Habits</span>
              </h3>
              <div className="space-y-3">
                {todaysData.habits.map((habitId, index) => {
                  const habitLabels: { [key: string]: string } = {
                    'guitar': 'Guitar',
                    'write': 'Write',
                    'read': 'Read',
                    'exercise': 'Exercise',
                    'socialise': 'Socialise'
                  };
                  const habitLabel = habitLabels[habitId] || habitId;
                  const isCompleted = todaysData.completedHabits?.includes(habitId) || false;
                  
                  return (
                    <div 
                      key={habitId}
                      className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        const completedHabits = todaysData.completedHabits || [];
                        const newCompletedHabits = isCompleted
                          ? completedHabits.filter(id => id !== habitId)
                          : [...completedHabits, habitId];
                        
                        if (!isCompleted) {
                          onAddPoints(15); // Award points for completing habits
                        }
                        
                        onUpdateData({ completedHabits: newCompletedHabits });
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
                      ) : (
                        <Circle className="text-gray-400 flex-shrink-0" size={20} />
                      )}
                      <span className={`${
                        isCompleted 
                          ? 'text-green-600 line-through' 
                          : isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {habitLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Water Tracker and Today's Status - 2 Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Water Tracker */}
            <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
              isDarkMode 
                ? 'bg-gray-800/80 border-gray-700' 
                : 'bg-white/80 border-gray-100'
            }`} style={{animationDelay: '0.4s'}}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                                  <GlassWater className="text-blue-500" size={20} />
                <span>Water Intake</span>
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className={`text-2xl font-bold ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {todaysData.waterGlasses || 0}
                    </span>
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      glasses
                    </span>
                  </div>
                  <div className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Goal: 8 glasses
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const currentGlasses = todaysData.waterGlasses || 0;
                      if (currentGlasses > 0) {
                        const newGlasses = currentGlasses - 1;
                        onUpdateData({ waterGlasses: newGlasses });
                      }
                    }}
                    disabled={(todaysData.waterGlasses || 0) === 0}
                    className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                      (todaysData.waterGlasses || 0) === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : isDarkMode 
                          ? 'text-red-400 hover:bg-red-900/20' 
                          : 'text-red-500 hover:bg-red-50'
                    }`}
                    title="Remove a glass of water"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const currentGlasses = todaysData.waterGlasses || 0;
                      const newGlasses = currentGlasses + 1;
                      onUpdateData({ waterGlasses: newGlasses });
                      addPointsWithNotification(5);
                    }}
                    className={`p-3 rounded-full transition-all duration-200 hover:scale-110 ${
                      isDarkMode 
                        ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                    title="Add a glass of water"
                  >
                                          <GlassWater size={24} />
                  </button>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(((todaysData.waterGlasses || 0) / 8) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {todaysData.waterGlasses || 0}/8 glasses
                  </span>
                  <span className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {Math.round(((todaysData.waterGlasses || 0) / 8) * 100)}% of daily goal
                  </span>
                </div>
              </div>
            </div>

            {/* Today's Status */}
            {(todaysData.sleepQuality || todaysData.morningMood) && (
              <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
                isDarkMode 
                  ? 'bg-gray-800/80 border-gray-700' 
                  : 'bg-white/80 border-gray-100'
              }`} style={{animationDelay: '0.4s'}}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Today's Status</h3>
                <div className="space-y-3">
                  {todaysData.sleepQuality && (
                    <div className="flex items-center justify-between">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Sleep Quality</span>
                      <span className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {getSleepText(todaysData.sleepQuality)}
                      </span>
                    </div>
                  )}
                  {todaysData.bedTime && (
                    <div className="flex items-center justify-between">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Bed Time</span>
                      <span className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {(() => {
                          const [hour, minute] = todaysData.bedTime!.split(':');
                          const hourNum = parseInt(hour);
                          const ampm = hourNum >= 12 ? 'PM' : 'AM';
                          const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
                          return `${displayHour}:${minute} ${ampm}`;
                        })()}
                      </span>
                    </div>
                  )}
                  {todaysData.wakeTime && (
                    <div className="flex items-center justify-between">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Wake Time</span>
                      <span className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {(() => {
                          const [hour, minute] = todaysData.wakeTime!.split(':');
                          const hourNum = parseInt(hour);
                          const ampm = hourNum >= 12 ? 'PM' : 'AM';
                          const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
                          return `${displayHour}:${minute} ${ampm}`;
                        })()}
                      </span>
                    </div>
                  )}
                  {(todaysData.bedTime && todaysData.wakeTime) && (
                    <div className="flex items-center justify-between">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Sleep Duration</span>
                      <span className={`font-medium ${
                        (() => {
                          const duration = calculateSleepDuration(todaysData.bedTime!, todaysData.wakeTime!);
                          return duration && duration >= 7 ? 'text-green-600' : 'text-red-600';
                        })()
                      }`}>
                        {(() => {
                          const duration = calculateSleepDuration(todaysData.bedTime!, todaysData.wakeTime!);
                          return duration ? `${duration}h` : '—';
                        })()}
                      </span>
                    </div>
                  )}
                  {todaysData.morningMood && (
                    <div className="flex items-center justify-between">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Morning Mood</span>
                      <span className={`font-medium capitalize ${
                        (() => {
                          const mood = todaysData.morningMood.toLowerCase();
                          const positiveWords = ['energized', 'focused', 'motivated', 'excited', 'grateful', 'confident', 'optimistic', 'peaceful', 'refreshed', 'inspired'];
                          const negativeWords = ['tired', 'stressed', 'anxious', 'overwhelmed', 'frustrated', 'sad', 'irritable', 'worried', 'exhausted', 'down'];
                          
                          if (positiveWords.includes(mood)) {
                            return 'text-green-600';
                          } else if (negativeWords.includes(mood)) {
                            return 'text-red-600';
                          } else {
                            return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
                          }
                        })()
                      }`}>
                        {todaysData.morningMood}
                      </span>
                    </div>
                  )}
                  {todaysData.eveningMood && (
                    <div className="flex items-center justify-between">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Evening Mood</span>
                      <span className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {getMoodText(todaysData.eveningMood)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>



        {/* Win of the Day */}
        {todaysData.winOfDay && (
          <div className={`rounded-2xl p-6 border animate-slide-up ${
            isDarkMode 
              ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-700' 
              : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
          }`} style={{animationDelay: '0.5s'}}>
            <h3 className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-green-300' : 'text-green-900'
            }`}>Today's Win</h3>
            <p className={isDarkMode ? 'text-green-200' : 'text-green-700'}>
              {todaysData.winOfDay}
            </p>
          </div>
        )}

        {/* Add Task Modal */}
        {showAddTaskModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className={`rounded-2xl p-6 shadow-xl border max-w-md w-full mx-4 animate-slide-up ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Add New Task</h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Task Description
                  </label>
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitNewTask()}
                    placeholder="Enter your task..."
                    className={`w-full p-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    autoFocus
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancelNewTask}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitNewTask}
                    disabled={!newTaskText.trim()}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                      newTaskText.trim()
                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                        : isDarkMode
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;