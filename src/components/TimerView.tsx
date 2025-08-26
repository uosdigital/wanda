import React, { useState } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Coffee, Focus, X } from 'lucide-react';

interface TimerViewProps {
  onBack: () => void;
  onAddPoints: (points: number) => void;
  isDarkMode: boolean;
  timerMinutes: number;
  timerSeconds: number;
  timerIsActive: boolean;
  timerIsBreak: boolean;
  timerCompletedPomodoros: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSetCustomTimer?: (minutes: number) => void;
}

const TimerView: React.FC<TimerViewProps> = ({ 
  onBack, 
  onAddPoints, 
  isDarkMode,
  timerMinutes,
  timerSeconds,
  timerIsActive,
  timerIsBreak,
  timerCompletedPomodoros,
  onToggleTimer,
  onResetTimer,
  onSetCustomTimer
}) => {
  const [showCustomTimer, setShowCustomTimer] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = timerIsBreak 
    ? ((5 * 60 - (timerMinutes * 60 + timerSeconds)) / (5 * 60)) * 100
    : ((25 * 60 - (timerMinutes * 60 + timerSeconds)) / (25 * 60)) * 100;
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4 animate-slide-up">
        <button
          onClick={onBack}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
            isDarkMode 
              ? 'text-gray-300 hover:bg-gray-800' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Timer Section */}
      <div className="max-w-md mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
        <div className={`backdrop-blur-sm rounded-2xl p-8 shadow-xl border animate-pulse-glow ${
          isDarkMode 
            ? 'bg-gray-800/90 border-gray-700' 
            : 'bg-white/90 border-gray-100'
        }`}>
          <h2 className={`text-2xl font-bold text-center mb-6 animate-breathe ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Focus Timer</h2>
          
          {/* Timer Display */}
          <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border ${
            isDarkMode 
              ? 'bg-gray-800/80 border-gray-700' 
              : 'bg-white/80 border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold flex items-center space-x-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {timerIsBreak ? <Coffee size={20} className="animate-float" /> : <Focus size={20} className="animate-float" />}
                <span>{timerIsBreak ? 'Break Time' : 'Focus Time'}</span>
              </h3>
              <div className={`text-sm px-3 py-1 rounded-full ${
                isDarkMode 
                  ? 'text-gray-300 bg-gray-700' 
                  : 'text-gray-500 bg-gray-100'
              }`}>
                {timerCompletedPomodoros} completed
              </div>
            </div>

            {/* Timer Display */}
            <div className="text-center mb-6">
              <div className="relative w-32 h-32 mx-auto animate-breathe">
                {/* Progress Circle */}
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={timerIsBreak ? "#10B981" : "#3B82F6"}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={351.86}
                    strokeDashoffset={351.86 - (351.86 * progress) / 100}
                    className="transition-all duration-1000 ease-in-out"
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* Time Display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => setShowCustomTimer(true)}
                    className={`text-2xl font-bold transition-all duration-200 hover:scale-105 ${isDarkMode ? 'text-teal-300 hover:text-teal-200' : 'text-gray-900 hover:text-gray-700'}`}
                    title="Click to set custom timer"
                  >
                    {formatTime(timerMinutes, timerSeconds)}
                  </button>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={onToggleTimer}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ease-out transform hover:scale-105 ${
                  timerIsActive
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
                    : `bg-${timerIsBreak ? 'green' : 'blue'}-500 text-white hover:bg-${timerIsBreak ? 'green' : 'blue'}-600 shadow-lg`
                }`}
              >
                {timerIsActive ? <Pause size={18} /> : <Play size={18} />} 
                <span>{timerIsActive ? 'Pause' : 'Start'}</span>
              </button>

              <button
                onClick={onResetTimer}
                className="flex items-center space-x-2 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <RotateCcw size={18} />
              </button>
            </div>

            {/* Status */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {timerIsBreak 
                  ? 'Take a break! You earned it.' 
                  : timerIsActive 
                    ? 'Focus time! Stay on task.' 
                    : 'Ready to focus?'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="max-w-md mx-auto animate-slide-up" style={{animationDelay: '0.4s'}}>
        <div className={`rounded-2xl p-6 border shadow-lg ${
          isDarkMode 
            ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-700' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-3 ${
            isDarkMode ? 'text-blue-300' : 'text-blue-900'
          }`}>💡 Timer Tips</h3>
          <ul className={`space-y-2 text-sm ${
            isDarkMode ? 'text-blue-200' : 'text-blue-800'
          }`}>
            <li>• Use 25-minute focus sessions for maximum productivity</li>
            <li>• Take 5-minute breaks between sessions</li>
            <li>• After 4 sessions, take a longer 15-30 minute break</li>
            <li>• Eliminate distractions during focus time</li>
          </ul>
        </div>
      </div>

      {/* Custom Timer Modal */}
      {showCustomTimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Set Custom Timer</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Minutes
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 25)}
                  className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white text-gray-900 border-gray-300'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2">
                  {[15, 25, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setCustomMinutes(mins)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        customMinutes === mins
                          ? 'bg-blue-500 text-white'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className={`px-5 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCustomTimer(false)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (onSetCustomTimer) {
                      onSetCustomTimer(customMinutes);
                    }
                    setShowCustomTimer(false);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  Set Timer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerView;
