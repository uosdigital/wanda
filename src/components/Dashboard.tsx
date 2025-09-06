import React, { useState, useEffect } from 'react';
import { Sun, Moon, CheckCircle2, Circle, RefreshCw, Target, Lightbulb, Clock, Calendar, Plus } from 'lucide-react';
import { DailyData, TimeBlock } from '../types';
import { useToast } from './ToastProvider';
import guitarImg from '../../images/guitar.jpg';
import writeImg from '../../images/write.jpg';
import socialiseImg from '../../images/socialise.jpg';
import runImg from '../../images/run.jpg';
import readImg from '../../images/read.jpg';
import priorityImg from '../../images/priority.jpg';
import tasksImg from '../../images/tasks.jpg';
import connectImg from '../../images/connect.jpg';
import basicsImg from '../../images/basics.jpg';
import meetingsImg from '../../images/meetings.jpg';
import visionImg from '../../images/vision.jpg';
import healthyImg from '../../images/healthy.jpg';
import listenImg from '../../images/listen.jpg';
import mindfulImg from '../../images/mindful.jpg';

  // Map habit IDs to custom images for dashboard
  const habitImageMap: { [key: string]: string } = {
    guitar: guitarImg,
    write: writeImg,
    socialise: socialiseImg,
    exercise: runImg,
    read: readImg,
  };

interface DashboardProps {
  todaysData: DailyData;
  onStartMorning: () => void;
  onStartEvening: () => void;
  onUpdateData: (data: Partial<DailyData>) => void;
  onAddPoints: (points: number, reason?: string) => void;
  hasCompletedMorning: boolean;
  hasCompletedEvening: boolean;
  onResetData: () => void;
  isDarkMode: boolean;
  onTimeblock?: (label: string, category: 'priority' | 'task' | 'habit' | 'connect' | 'custom') => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  todaysData,
  onStartMorning,
  onStartEvening,
  onUpdateData,
  onAddPoints,
  hasCompletedMorning,
  hasCompletedEvening,
  onResetData,
  isDarkMode,
  onTimeblock
}) => {
  const { showToast } = useToast();
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [newPersonText, setNewPersonText] = useState('');

  // Random inspirational phrases
  const inspirationalPhrases = [
    "In no time at all, this'll be the distant past.",
    "The straight was a circle, the straight line was a lie.",
    "Sometimes, I wrap my head around it all, and it makes perfect sense.",
    "And I'm leaning on a broken fence, between past and present tense",
    "We are beautiful, we are doomed.",
    "Give us this day our daily dread."
  ];
  
  // Use today's date as a seed for consistent randomization per day
  const today = new Date().toDateString();
  const randomPhrase = (() => {
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomIndex = seed % inspirationalPhrases.length;
    return inspirationalPhrases[randomIndex];
  })();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showAddTaskModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddTaskModal]);

  const todaysBlocks: TimeBlock[] = todaysData.timeBlocks || [];
  const formatRange = (startIso: string, endIso: string) => {
    const s = new Date(startIso);
    const e = new Date(endIso);
    const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${fmt(s)}–${fmt(e)}`;
  };

  const toggleTask = (index: number) => {
    const completedTasks = todaysData.completedTasks || [false, false, false];
    const newCompleted = [...completedTasks];
    newCompleted[index] = !newCompleted[index];
    
    if (newCompleted[index]) {
      // Play completion sound
      try {
        const audio = new Audio('/sounds/notify.wav');
        audio.volume = 0.5;
        audio.play().catch(e => {
          console.log('Task audio play failed:', e);
        });
      } catch (error) {
        console.log('Task audio creation failed:', error);
      }
      
      // Show toast for points (calculated from data, not added manually)
      showToast('+25 points — Task completed', 3000, 'Task completed');
    } else {
      showToast('-25 points — Task unchecked', 3000, 'Task unchecked');
    }
    
    onUpdateData({ completedTasks: newCompleted });
  };

  

  const toggleMainTask = () => {
    const newCompleted = !todaysData.completedMainTask;
    if (newCompleted) {
      // Play completion sound
      try {
        const audio = new Audio('/sounds/notify.wav');
        audio.volume = 0.5;
        audio.play().catch(e => {
          console.log('Priority audio play failed:', e);
        });
      } catch (error) {
        console.log('Priority audio creation failed:', error);
      }
      
      // Show toast for points
      showToast('+50 points — Priority task completed', 3000, 'Priority task completed');
    } else {
      showToast('-50 points — Priority task unchecked', 3000, 'Priority task unchecked');
    }
    onUpdateData({ completedMainTask: newCompleted });
  };

  const togglePerson = (index: number) => {
    const completedPeople = todaysData.completedPeople || [false, false, false, false];
    const newCompleted = [...completedPeople];
    newCompleted[index] = !newCompleted[index];
    
    if (newCompleted[index]) {
      // Play completion sound
      try {
        const audio = new Audio('/sounds/notify.wav');
        audio.volume = 0.5;
        audio.play().catch(e => {
          console.log('Connect audio play failed:', e);
        });
      } catch (error) {
        console.log('Connect audio creation failed:', error);
      }
      
      // Show toast for points
      showToast('+30 points — Connected with someone', 3000, 'Connected with someone');
    } else {
      showToast('-30 points — Connection unchecked', 3000, 'Connection unchecked');
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

  const addNewPerson = () => {
    setShowAddPersonModal(true);
  };

  const handleSubmitNewPerson = () => {
    if (newPersonText.trim()) {
      const currentPeople = todaysData.peopleToMessage || [];
      const currentCompleted = todaysData.completedPeople || [];

      const updatedPeople = [...currentPeople, newPersonText.trim()];
      const updatedCompleted = [...currentCompleted, false];

      onUpdateData({
        peopleToMessage: updatedPeople,
        completedPeople: updatedCompleted
      });

      setNewPersonText('');
      setShowAddPersonModal(false);
    }
  };

  const handleCancelNewPerson = () => {
    setNewPersonText('');
    setShowAddPersonModal(false);
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

  // Auto-calculate 7+ hours sleep basic when both times are present
  React.useEffect(() => {
    const hours = calculateSleepDuration(todaysData.bedTime || '', todaysData.wakeTime || '') || 0;
    const has7h = hours >= 7;
    const currentBasics = todaysData.basics || {};
    if ((currentBasics.sleep7h || false) !== has7h) {
      onUpdateData({ basics: { ...currentBasics, sleep7h: has7h } });
    }
  }, [todaysData.bedTime, todaysData.wakeTime]);

  const getSleepText = (quality: number) => {
    const descriptions = ['Poor', 'Fair', 'Good', 'Great', 'Excellent'];
    return descriptions[quality - 1] || 'Not set';
  };

  // Check if there's no active day (no morning check-in completed)
  const hasNoActiveDay = !hasCompletedMorning;

  if (hasNoActiveDay) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-fade-in">
        <div className="text-center space-y-10 mx-auto px-6">
          {/* Icon and Date (no card) */}
          <div>
            <div className="w-16 h-16 rounded-xl overflow-hidden mx-auto mb-6">
              <img src={visionImg} alt="Vision" className="w-full h-full object-cover" />
            </div>
            <div className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} text-5xl md:text-6xl font-extrabold tracking-tight mx-auto max-w-3xl`}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-base md:text-lg mt-8 mb-8 animate-fade-in`}>
              {randomPhrase}
            </p>
          </div>

          {/* Start Button */}
          <div>
            <button
              onClick={onStartMorning}
              className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-12 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-2xl animate-pulse-glow"
            >
              <div className="flex items-center justify-center space-x-3">
                <Sun size={24} className="animate-float" />
                <span>{hasCompletedMorning ? 'Morning Complete!' : 'Start'}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Welcome Section */}
      <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
        isDarkMode 
          ? 'bg-gray-800/80 border-gray-700' 
          : 'bg-white/80 border-gray-100'
      }`}>
        <div className="mb-6">
          <h2 className={`text-xl sm:text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}!
          </h2>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm sm:text-base`}>Here is how today is looking...</p>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-3 animate-fade-in`}>
            {randomPhrase}
          </p>
        </div>

        {/* Flow Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={onStartMorning}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ease-out transform hover:scale-105 ${
              hasCompletedMorning
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-xl hover:-translate-y-1 animate-pulse-glow'
            }`}
          >
            <Sun size={20} className="animate-float" />
            <span className="hidden sm:inline">{hasCompletedMorning ? 'Morning Complete!' : 'Start My Day'}</span>
            <span className="sm:hidden">{hasCompletedMorning ? 'Complete!' : 'Start Day'}</span>
          </button>

          <button
            onClick={onStartEvening}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ease-out transform hover:scale-105 ${
              hasCompletedEvening
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:shadow-xl hover:-translate-y-1 animate-pulse-glow'
            }`}
          >
            <Moon size={20} className="animate-float" />
            <span className="hidden sm:inline">{hasCompletedEvening ? 'Evening Complete!' : 'Review My Day'}</span>
            <span className="sm:hidden">{hasCompletedEvening ? 'Complete!' : 'Review Day'}</span>
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

      {/* Good Day Vision */}
        {todaysData.goodDayVision && (
          <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
            isDarkMode 
              ? 'bg-gray-800/80 border-gray-700' 
              : 'bg-white/80 border-gray-100'
          }`} style={{animationDelay: '0.05s'}}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img src={visionImg} alt="Vision" className="w-full h-full object-cover" />
              </div>
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
              <h3 className={`text-lg font-semibold mb-4 flex items-center justify-between ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <span className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden">
                    <img src={priorityImg} alt="Priority" className="w-full h-full object-cover" />
                  </div>
                  <span>Priority</span>
                </span>
                {onTimeblock && (
                  <button
                    onClick={() => onTimeblock(todaysData.mainPriority || 'Priority', 'priority')}
                    className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <Clock size={12} />
                    <span>Timeblock</span>
                  </button>
                )}
              </h3>
              <div 
                className={`flex items-center p-4 rounded-xl transition-colors cursor-pointer ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-blue-50 hover:bg-blue-100'
                }`}
                onClick={toggleMainTask}
              >
                {todaysData.completedMainTask ? (
                  <CheckCircle2 className="text-green-500 flex-shrink-0 mr-3" size={20} />
                ) : (
                  <Circle className="text-gray-400 flex-shrink-0 mr-3" size={20} />
                )}
                <span className={`font-medium flex-1 min-w-0 truncate ${
                  todaysData.completedMainTask 
                    ? 'text-green-400 line-through' 
                    : isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {todaysData.mainPriority}
                </span>
                {/* Priority timeblocks to the right, label-exact matches only */}
                <div className="ml-3 flex items-center gap-2">
                  {todaysBlocks.filter(b => b.label === (todaysData.mainPriority || '')).map((b, i) => (
                    <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] ${isDarkMode ? 'bg-purple-900/30 text-purple-200' : 'bg-purple-100 text-purple-700'}`}>
                      <Clock size={10} className="mr-1" />
                      {formatRange(b.start, b.end)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tiny first step tip */}
              <div className={`mt-3 px-3 py-2 rounded-lg flex items-start space-x-2 ${
                isDarkMode ? 'bg-gray-700/60' : 'bg-purple-50'
              }`}>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                  isDarkMode ? 'bg-purple-900/40' : 'bg-purple-100'
                }`}>
                  <Lightbulb size={14} className={isDarkMode ? 'text-purple-300' : 'text-purple-600'} />
                </div>
                <div className="text-sm">
                  {todaysData.firstStep ? (
                    <div className="flex items-baseline space-x-2">
                      <span className={isDarkMode ? 'text-purple-200 font-medium' : 'text-purple-900 font-medium'}>tiny task:</span>
                      <span className={isDarkMode ? 'text-purple-200/80' : 'text-purple-800'}>{todaysData.firstStep}</span>
                    </div>
                  ) : (
                    <div className={isDarkMode ? 'text-purple-200/90' : 'text-purple-800'}>
                      What's the very first tiny step to get it started?
                    </div>
                  )}
                </div>
              </div>

              
            </div>
          )}

          {/* Key Tasks */}
          <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
            isDarkMode 
              ? 'bg-gray-800/80 border-gray-700' 
              : 'bg-white/80 border-gray-100'
          }`} style={{animationDelay: '0.2s'}}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center justify-between ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <span className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <img src={tasksImg} alt="Tasks" className="w-full h-full object-cover" />
                </div>
                <span>Tasks</span>
              </span>
              <button
                onClick={addNewTask}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Plus size={14} />
                <span>Add Task</span>
              </button>
            </h3>
            <div className="space-y-3">
              {(!Array.isArray(todaysData.additionalTasks) || todaysData.additionalTasks.length === 0) && (
                <div className={`p-4 rounded-xl text-sm ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                  No tasks yet. Click "Add Task" to create one.
                </div>
              )}
              {(Array.isArray(todaysData.additionalTasks) ? todaysData.additionalTasks : []).map((task, index) => {
                  const taskBlocks = todaysBlocks.filter(b => b.label === task);
                  return (
                    <div 
                      key={index}
                      className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleTask(index)}
                    >
                      {(todaysData.completedTasks || [])[index] ? (
                        <CheckCircle2 className="text-green-500 flex-shrink-0 mr-2" size={20} />
                      ) : (
                        <Circle className="text-gray-400 flex-shrink-0 mr-2" size={20} />
                      )}
                      <span className={`flex-1 min-w-0 truncate ${
                        (todaysData.completedTasks || [])[index] 
                          ? 'text-green-400 line-through' 
                          : isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {task}
                      </span>
                      {/* Right-side time badges and per-item timeblock */}
                      <div className="ml-3 flex items-center gap-2">
                        {taskBlocks.map((b, i) => (
                          <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] ${isDarkMode ? 'bg-indigo-900/30 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}`}>
                            <Clock size={10} className="mr-1" />
                            {formatRange(b.start, b.end)}
                          </span>
                        ))}
                        {onTimeblock && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onTimeblock(task, 'task'); }}
                            className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                          >
                            <Clock size={12} />
                            <span>Timeblock</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Connect */}
          <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
            isDarkMode 
              ? 'bg-gray-800/80 border-gray-700' 
              : 'bg-white/80 border-gray-100'
          }`} style={{animationDelay: '0.3s'}}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center justify-between ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <span className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <img src={connectImg} alt="Connect" className="w-full h-full object-cover" />
                </div>
                <span>Connect</span>
              </span>
              <button
                onClick={addNewPerson}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Plus size={14} />
                <span>Add Person</span>
              </button>
            </h3>
            <div className="space-y-3">
              {(!Array.isArray(todaysData.peopleToMessage) || todaysData.peopleToMessage.length === 0) && (
                <div className={`${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'} p-4 rounded-xl text-sm`}>
                  No people yet. Click "Add Person" to add someone to connect with.
                </div>
              )}
              {(Array.isArray(todaysData.peopleToMessage) ? todaysData.peopleToMessage : []).map((person, index) => {
                const connectBlocks = todaysBlocks.filter(b => b.label === person);
                return (
                  <div 
                    key={index}
                    className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => togglePerson(index)}
                  >
                    {(todaysData.completedPeople || [])[index] ? (
                      <CheckCircle2 className="text-green-500 flex-shrink-0 mr-2" size={20} />
                    ) : (
                      <Circle className="text-gray-400 flex-shrink-0 mr-2" size={20} />
                    )}
                    <span className={`flex-1 min-w-0 truncate ${
                      (todaysData.completedPeople || [])[index] 
                        ? 'text-green-600 line-through' 
                        : isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      {person}
                    </span>
                    <div className="ml-3 flex items-center gap-2">
                      {connectBlocks.map((b, i) => (
                        <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] ${isDarkMode ? 'bg-orange-900/30 text-orange-200' : 'bg-orange-100 text-orange-700'}`}>
                          <Clock size={10} className="mr-1" />
                          {formatRange(b.start, b.end)}
                        </span>
                      ))}
                      {onTimeblock && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onTimeblock(person, 'connect'); }}
                          className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          <Clock size={12} />
                          <span>Timeblock</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Habits */}
          {Array.isArray(todaysData.habits) && todaysData.habits.length > 0 && (
            <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
              isDarkMode 
                ? 'bg-gray-800/80 border-gray-700' 
                : 'bg-white/80 border-gray-100'
            }`} style={{animationDelay: '0.35s'}}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center justify-between ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <span className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden">
                    <img src={guitarImg} alt="Habits" className="w-full h-full object-cover" />
                  </div>
                  <span>Habits</span>
                </span>
              </h3>
              <div className="space-y-3">
                {(Array.isArray(todaysData.habits) ? todaysData.habits : []).map((habitId) => {
                  const habitLabels: { [key: string]: string } = {
                    'guitar': 'Guitar',
                    'write': 'Write',
                    'read': 'Read',
                    'exercise': 'Exercise',
                    'socialise': 'Socialise'
                  };
                  const habitLabel = habitLabels[habitId] || habitId;
                  const habitBlocks = todaysBlocks.filter(b => b.label === habitLabel);
                  const isCompleted = todaysData.completedHabits?.includes(habitId) || false;
                  return (
                    <div 
                      key={habitId}
                      className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors ${
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
                          // Play completion sound
                          try {
                            const audio = new Audio('/sounds/notify.wav');
                            audio.volume = 0.5;
                            audio.play().catch(e => {
                              console.log('Habit audio play failed:', e);
                            });
                          } catch (error) {
                            console.log('Habit audio creation failed:', error);
                          }
                          onAddPoints(30, 'Habit completed');
                        }
                        onUpdateData({ completedHabits: newCompletedHabits });
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="text-green-500 flex-shrink-0 mr-2" size={20} />
                      ) : (
                        <Circle className="text-gray-400 flex-shrink-0 mr-2" size={20} />
                      )}
                      <div className="w-6 h-6 rounded-md overflow-hidden bg-gray-200 mr-3">
                        {habitImageMap[habitId] ? (
                          <img src={habitImageMap[habitId]} alt={habitLabel} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Target size={14} className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      <span className={`flex-1 min-w-0 truncate ${
                        isCompleted 
                          ? 'text-green-600 line-through' 
                          : isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {habitLabel}
                      </span>
                      <div className="ml-3 flex items-center gap-2">
                        {habitBlocks.map((b, i) => (
                          <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] ${isDarkMode ? 'bg-teal-900/30 text-teal-200' : 'bg-teal-100 text-teal-700'}`}>
                            <Clock size={10} className="mr-1" />
                            {formatRange(b.start, b.end)}
                          </span>
                        ))}
                        {onTimeblock && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onTimeblock(habitLabel, 'habit'); }}
                            className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                          >
                            <Clock size={12} />
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

          {/* Meetings and Appointments */}
          {Array.isArray(todaysData.meetings) && todaysData.meetings.length > 0 && (
            <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
              isDarkMode 
                ? 'bg-gray-800/80 border-gray-700' 
                : 'bg-white/80 border-gray-100'
            }`} style={{animationDelay: '0.4s'}}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center justify-between ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <span className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden">
                    <img src={meetingsImg} alt="Meetings" className="w-full h-full object-cover" />
                  </div>
                  <span>Meetings & Appointments</span>
                </span>
              </h3>
              <div className="space-y-3">
                {todaysData.meetings.map((meeting, index) => (
                  <div 
                    key={index}
                    className={`flex items-center p-3 rounded-xl ${
                      isDarkMode 
                        ? 'bg-gray-700' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md overflow-hidden bg-blue-200 mr-3 flex items-center justify-center">
                      <Calendar size={14} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {meeting.title}
                      </div>
                      <div className={`text-sm truncate ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {meeting.startTime} - {meeting.endTime}
                      </div>
                    </div>
                    {onTimeblock && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onTimeblock(meeting.title, 'custom'); }}
                        className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        <Clock size={12} />
                        <span>Timeblock</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Water Tracker and Today's Status - 2 Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basics */}
            <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
              isDarkMode 
                ? 'bg-gray-800/80 border-gray-700' 
                : 'bg-white/80 border-gray-100'
            }`} style={{animationDelay: '0.4s'}}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <img src={basicsImg} alt="Basics" className="w-full h-full object-cover" />
                </div>
                <span>Basics</span>
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'drankWater', label: 'Drink enough water', image: basicsImg },
                  { id: 'ateHealthy', label: 'Eat healthy meals', image: healthyImg },
                  { id: 'listenedToSomething', label: 'Listen to something interesting', image: listenImg },
                  { id: 'wasMindful', label: 'Be mindful', image: mindfulImg },
                  { id: 'steps10k', label: '10k steps', image: runImg },
                  { id: 'sleep7h', label: '7+ hours sleep', image: basicsImg }
                ].map((basic) => {
                  const isCompleted = todaysData.basics?.[basic.id as keyof typeof todaysData.basics] || false;
                  return (
                    <div 
                      key={basic.id}
                      className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        const currentBasics = todaysData.basics || {};
                        const newBasics = {
                          ...currentBasics,
                          [basic.id]: !isCompleted
                        };
                        onUpdateData({ basics: newBasics });
                        if (!isCompleted) {
                          // Play completion sound
                          try {
                            const audio = new Audio('/sounds/notify.wav');
                            audio.volume = 0.5;
                            audio.play().catch(e => {
                              console.log('Basics audio play failed:', e);
                            });
                          } catch (error) {
                            console.log('Basics audio creation failed:', error);
                          }
                          onAddPoints(10, `${basic.label} completed`);
                        }
                      }}
                    >
                      <div className="w-6 h-6 rounded-md overflow-hidden mr-3 flex items-center justify-center bg-gray-200">
                        <img src={basic.image} alt={basic.label} className="w-full h-full object-cover" />
                      </div>
                      <span className={`flex-1 min-w-0 truncate ${
                        isCompleted 
                          ? 'text-green-600 line-through' 
                          : isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {basic.label}
                      </span>
                      {isCompleted ? (
                        <CheckCircle2 className="text-green-500 flex-shrink-0 ml-2" size={20} />
                      ) : (
                        <Circle className="text-gray-400 flex-shrink-0 ml-2" size={20} />
                      )}
                    </div>
                  );
                })}
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
                      <span className={`font-medium capitalize ${
                        (() => {
                          const mood = String(todaysData.eveningMood).toLowerCase();
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
                        {todaysData.eveningMood}
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" style={{ overflow: 'hidden' }}>
            <div className={`rounded-2xl p-6 shadow-xl border max-w-md w-full mx-4 animate-slide-up ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Add New Task</h3>
              
              <div>
                <div className="mb-4">
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

        {/* Add Person Modal */}
        {showAddPersonModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" style={{ overflow: 'hidden' }}>
            <div className={`rounded-2xl p-6 shadow-xl border max-w-md w-full mx-4 animate-slide-up ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Add Person to Connect</h3>
              
              <div>
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={newPersonText}
                    onChange={(e) => setNewPersonText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitNewPerson()}
                    placeholder="Enter a name..."
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
                    onClick={handleCancelNewPerson}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitNewPerson}
                    disabled={!newPersonText.trim()}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                      newPersonText.trim()
                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                        : isDarkMode
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Add Person
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Dashboard;