import React from 'react';
import { ArrowLeft } from 'lucide-react';
import PomodoroTimer from './PomodoroTimer';

interface TimerViewProps {
  onBack: () => void;
  onAddPoints: (points: number) => void;
  isDarkMode: boolean;
}

const TimerView: React.FC<TimerViewProps> = ({ onBack, onAddPoints, isDarkMode }) => {
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
          <PomodoroTimer onAddPoints={onAddPoints} isDarkMode={isDarkMode} />
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
    </div>
  );
};

export default TimerView;
