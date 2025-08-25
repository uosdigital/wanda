import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Focus } from 'lucide-react';

interface PomodoroTimerProps {
  onAddPoints: (points: number) => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onAddPoints }) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && (minutes > 0 || seconds > 0)) {
      intervalRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }, 1000);
    } else if (minutes === 0 && seconds === 0 && isActive) {
      // Timer finished
      setIsActive(false);
      if (!isBreak) {
        // Completed a focus session
        setCompletedPomodoros(prev => prev + 1);
        onAddPoints(10);
        setIsBreak(true);
        setMinutes(5);
        setSeconds(0);
      } else {
        // Completed a break
        setIsBreak(false);
        setMinutes(25);
        setSeconds(0);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, minutes, seconds, isBreak, onAddPoints]);

  const toggleTimer = () => {
    if (!isActive) {
      onAddPoints(1); // Points for starting a session
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
  };

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isBreak 
    ? ((5 * 60 - (minutes * 60 + seconds)) / (5 * 60)) * 100
    : ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          {isBreak ? <Coffee size={20} /> : <Focus size={20} />}
          <span>{isBreak ? 'Break Time' : 'Focus Time'}</span>
        </h3>
        <div className="text-sm text-gray-500">
          {completedPomodoros} completed
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-6">
        <div className="relative w-32 h-32 mx-auto">
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
              stroke={isBreak ? "#10B981" : "#3B82F6"}
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
            <span className="text-2xl font-bold text-gray-900">
              {formatTime(minutes, seconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={toggleTimer}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            isActive
              ? 'bg-red-500 text-white hover:bg-red-600'
              : `bg-${isBreak ? 'green' : 'blue'}-500 text-white hover:bg-${isBreak ? 'green' : 'blue'}-600`
          }`}
        >
          {isActive ? <Pause size={18} /> : <Play size={18} />}
          <span>{isActive ? 'Pause' : 'Start'}</span>
        </button>

        <button
          onClick={resetTimer}
          className="flex items-center space-x-2 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Status */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {isBreak 
            ? 'Take a break! You earned it.' 
            : isActive 
              ? 'Focus time! Stay on task.' 
              : 'Ready to focus?'
          }
        </p>
      </div>
    </div>
  );
};

export default PomodoroTimer;