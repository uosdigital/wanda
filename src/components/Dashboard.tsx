import React, { useState, useEffect } from 'react';
import { Sun, Moon, CheckCircle2, Circle, Users, Play, Pause, RotateCcw, Trophy, Flame } from 'lucide-react';
import { AppData, DailyData } from '../types';
import PomodoroTimer from './PomodoroTimer';

interface DashboardProps {
  appData: AppData;
  todaysData: DailyData;
  onStartMorning: () => void;
  onStartEvening: () => void;
  onUpdateData: (data: Partial<DailyData>) => void;
  onAddPoints: (points: number) => void;
  hasCompletedMorning: boolean;
  hasCompletedEvening: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({
  appData,
  todaysData,
  onStartMorning,
  onStartEvening,
  onUpdateData,
  onAddPoints,
  hasCompletedMorning,
  hasCompletedEvening
}) => {
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
      onAddPoints(10);
    }
    onUpdateData({ completedMainTask: newCompleted });
  };

  const getMoodEmoji = (mood: number) => {
    const moods = ['😴', '😔', '😐', '😊', '🌟'];
    return moods[mood - 1] || '😐';
  };

  const getSleepText = (quality: number) => {
    const descriptions = ['Poor', 'Fair', 'Good', 'Great', 'Excellent'];
    return descriptions[quality - 1] || 'Not set';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}! 
            </h2>
            <p className="text-gray-600">Ready to make today productive?</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="flex items-center space-x-2 text-orange-600">
                <Flame size={20} />
                <span className="font-bold text-lg">{appData.currentStreak}</span>
              </div>
              <p className="text-xs text-gray-500">Day streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center space-x-2 text-blue-600">
                <Trophy size={20} />
                <span className="font-bold text-lg">{appData.totalPoints}</span>
              </div>
              <p className="text-xs text-gray-500">Total points</p>
            </div>
          </div>
        </div>

        {/* Flow Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onStartMorning}
            disabled={hasCompletedMorning}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              hasCompletedMorning
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            <Sun size={20} />
            <span>{hasCompletedMorning ? 'Morning Complete!' : 'Start My Day'}</span>
          </button>

          <button
            onClick={onStartEvening}
            disabled={hasCompletedEvening}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              hasCompletedEvening
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            <Moon size={20} />
            <span>{hasCompletedEvening ? 'Evening Complete!' : 'Review My Day'}</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Priorities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Priority */}
          {todaysData.mainPriority && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Today's Main Priority</h3>
              <div 
                className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={toggleMainTask}
              >
                {todaysData.completedMainTask ? (
                  <CheckCircle2 className="text-green-500 flex-shrink-0" size={24} />
                ) : (
                  <Circle className="text-gray-400 flex-shrink-0" size={24} />
                )}
                <span className={`font-medium ${todaysData.completedMainTask ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                  {todaysData.mainPriority}
                </span>
              </div>
            </div>
          )}

          {/* Additional Tasks */}
          {todaysData.additionalTasks && todaysData.additionalTasks.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Additional Tasks</h3>
              <div className="space-y-3">
                {todaysData.additionalTasks.map((task, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleTask(index)}
                  >
                    {(todaysData.completedTasks || [])[index] ? (
                      <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
                    ) : (
                      <Circle className="text-gray-400 flex-shrink-0" size={20} />
                    )}
                    <span className={`${(todaysData.completedTasks || [])[index] ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                      {task}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* People to Message */}
          {todaysData.peopleToMessage && todaysData.peopleToMessage.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Users size={20} />
                <span>People to Message</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {todaysData.peopleToMessage.map((person, index) => (
                  <span 
                    key={index}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                  >
                    {person}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pomodoro Timer */}
          <PomodoroTimer onAddPoints={onAddPoints} />

          {/* Today's Status */}
          {(todaysData.sleepQuality || todaysData.morningMood) && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Status</h3>
              <div className="space-y-3">
                {todaysData.sleepQuality && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Sleep Quality</span>
                    <span className="font-medium text-gray-900">
                      {getSleepText(todaysData.sleepQuality)}
                    </span>
                  </div>
                )}
                {todaysData.morningMood && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Morning Mood</span>
                    <span className="text-2xl">
                      {getMoodEmoji(todaysData.morningMood)}
                    </span>
                  </div>
                )}
                {todaysData.eveningMood && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Evening Mood</span>
                    <span className="text-2xl">
                      {getMoodEmoji(todaysData.eveningMood)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Win of the Day */}
          {todaysData.winOfDay && (
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-2">🏆 Today's Win</h3>
              <p className="text-green-700">{todaysData.winOfDay}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;