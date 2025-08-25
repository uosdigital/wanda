import React from 'react';
import { ArrowLeft, TrendingUp, Calendar, Trophy, Flame } from 'lucide-react';
import { AppData } from '../types';

interface WeeklyLogProps {
  appData: AppData;
  onBack: () => void;
}

const WeeklyLog: React.FC<WeeklyLogProps> = ({ appData, onBack }) => {
  // Get last 7 days of data
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
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

  const weekData = getLast7Days();

  const getMoodEmoji = (mood?: number) => {
    if (!mood) return '—';
    const moods = ['😴', '😔', '😐', '😊', '🌟'];
    return moods[mood - 1] || '—';
  };

  const getCompletionRate = () => {
    const daysWithData = weekData.filter(day => day.data.mainPriority).length;
    const completedDays = weekData.filter(day => day.data.completedMainTask).length;
    return daysWithData > 0 ? Math.round((completedDays / daysWithData) * 100) : 0;
  };

  const getTotalWins = () => {
    return weekData.filter(day => day.data.winOfDay).length;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Weekly Overview</h1>
            <p className="text-gray-600">Your productivity journey this week</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{getCompletionRate()}%</p>
              <p className="text-sm text-gray-600">Task completion</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Trophy className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{getTotalWins()}</p>
              <p className="text-sm text-gray-600">Daily wins</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Flame className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{appData.currentStreak}</p>
              <p className="text-sm text-gray-600">Current streak</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{appData.totalPoints}</p>
              <p className="text-sm text-gray-600">Total points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">This Week's Progress</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-7 gap-4">
            {weekData.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  {day.dayName}
                </div>
                <div 
                  className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-sm font-semibold mb-3 ${
                    day.data.completedMainTask 
                      ? 'bg-green-500 text-white' 
                      : day.data.mainPriority 
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {day.dayNumber}
                </div>
                
                {/* Mood indicators */}
                <div className="space-y-1">
                  <div className="text-lg">
                    {getMoodEmoji(day.data.morningMood)}
                  </div>
                  <div className="text-lg">
                    {getMoodEmoji(day.data.eveningMood)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Journal Entries */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Journal Entries</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {weekData
            .filter(day => day.data.winOfDay || day.data.obstacles?.length)
            .reverse()
            .map((day, index) => (
            <div key={index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {day.date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>Morning: {getMoodEmoji(day.data.morningMood)}</span>
                    <span>Evening: {getMoodEmoji(day.data.eveningMood)}</span>
                    {day.data.completedMainTask && (
                      <span className="text-green-600 font-medium">✅ Main task completed</span>
                    )}
                  </div>
                </div>
              </div>

              {day.data.winOfDay && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-green-700 mb-2">🏆 Win of the day:</h4>
                  <p className="text-gray-700 bg-green-50 p-3 rounded-lg">
                    {day.data.winOfDay}
                  </p>
                </div>
              )}

              {day.data.obstacles && day.data.obstacles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-orange-700 mb-2">⚠️ Obstacles:</h4>
                  <div className="flex flex-wrap gap-2">
                    {day.data.obstacles.map((obstacle, obstacleIndex) => (
                      <span 
                        key={obstacleIndex}
                        className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                      >
                        {obstacle}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {weekData.filter(day => day.data.winOfDay || day.data.obstacles?.length).length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <p>No journal entries yet this week.</p>
              <p className="text-sm mt-1">Complete your daily reviews to see entries here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyLog;