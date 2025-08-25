import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Sun, Clock, Heart, Target, Users, Star, Check, X, ChevronUp, ChevronDown } from 'lucide-react';
import { DailyData } from '../types';

interface TimePickerProps {
  value: string | undefined;
  onChange: (time: string) => void;
  placeholder?: string;
  isDarkMode?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, placeholder, isDarkMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(() => {
    if (value) {
      const [hour] = value.split(':');
      return parseInt(hour, 10);
    }
    return 12;
  });
  const [selectedMinute, setSelectedMinute] = useState(() => {
    if (value) {
      const [, minute] = value.split(':');
      return parseInt(minute, 10);
    }
    return 0;
  });
  const [isAM, setIsAM] = useState(() => {
    if (value) {
      const [hour] = value.split(':');
      return parseInt(hour, 10) < 12;
    }
    return true;
  });

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const formatTime = (hour: number, minute: number, am: boolean) => {
    const hour24 = am ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);
    return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const handleTimeChange = (hour: number, minute: number, am: boolean) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setIsAM(am);
    const timeString = formatTime(hour, minute, am);
    onChange(timeString);
  };

  const displayValue = value ? 
    `${selectedHour}:${selectedMinute.toString().padStart(2, '0')} ${isAM ? 'AM' : 'PM'}` : 
    placeholder || 'Select time';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-6 border-2 rounded-xl focus:border-blue-500 focus:outline-none text-xl text-center shadow-lg transition-all duration-200 flex items-center justify-between ${
          isDarkMode
            ? 'border-gray-600 bg-gray-700 hover:border-blue-400'
            : 'border-gray-200 bg-white hover:border-blue-300'
        }`}
      >
        <span className={value 
          ? (isDarkMode ? 'text-white' : 'text-gray-900') 
          : (isDarkMode ? 'text-gray-400' : 'text-gray-500')
        }>{displayValue}</span>
        <Clock size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-400'} />
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-2 border-2 rounded-xl shadow-lg z-10 p-4 ${
          isDarkMode
            ? 'bg-gray-700 border-gray-600'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-center space-x-4">
            {/* Hour Selector */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => {
                  const newHour = selectedHour === 12 ? 1 : selectedHour + 1;
                  handleTimeChange(newHour, selectedMinute, isAM);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
              >
                <ChevronUp size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
              </button>
              <div className={`text-3xl font-bold py-2 min-w-[60px] text-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {selectedHour}
              </div>
              <button
                onClick={() => {
                  const newHour = selectedHour === 1 ? 12 : selectedHour - 1;
                  handleTimeChange(newHour, selectedMinute, isAM);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
              >
                <ChevronDown size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
              </button>
              <div className={`text-xs mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>Hour</div>
            </div>

            <div className={`text-3xl font-bold ${
              isDarkMode ? 'text-gray-400' : 'text-gray-400'
            }`}>:</div>

            {/* Minute Selector */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => {
                  const newMinute = selectedMinute === 59 ? 0 : selectedMinute + 1;
                  handleTimeChange(selectedHour, newMinute, isAM);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
              >
                <ChevronUp size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
              </button>
              <div className={`text-3xl font-bold py-2 min-w-[60px] text-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {selectedMinute.toString().padStart(2, '0')}
              </div>
              <button
                onClick={() => {
                  const newMinute = selectedMinute === 0 ? 59 : selectedMinute - 1;
                  handleTimeChange(selectedHour, newMinute, isAM);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
              >
                <ChevronDown size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
              </button>
              <div className={`text-xs mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>Minute</div>
            </div>

            {/* AM/PM Toggle */}
            <div className="flex flex-col items-center ml-4">
              <button
                onClick={() => handleTimeChange(selectedHour, selectedMinute, true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isAM 
                    ? 'bg-blue-500 text-white' 
                    : isDarkMode 
                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                AM
              </button>
              <button
                onClick={() => handleTimeChange(selectedHour, selectedMinute, false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors mt-2 ${
                  !isAM 
                    ? 'bg-blue-500 text-white' 
                    : isDarkMode 
                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                PM
              </button>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <button
              onClick={() => setIsOpen(false)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface MorningFlowProps {
  onComplete: (data: DailyData) => void;
  onBack: () => void;
  existingData: DailyData;
  isDarkMode?: boolean;
}

const MorningFlow: React.FC<MorningFlowProps> = ({ onComplete, onBack, existingData, isDarkMode = false }) => {
  const [step, setStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState<DailyData>({
    sleepQuality: existingData.sleepQuality || undefined,
    bedTime: existingData.bedTime || '',
    wakeTime: existingData.wakeTime || '',
    morningMood: existingData.morningMood || undefined,
    morningFeelings: existingData.morningFeelings || '',
    mainPriority: existingData.mainPriority || '',
    firstStep: existingData.firstStep || '',
    additionalTasks: existingData.additionalTasks || ['', ''],
    peopleToMessage: existingData.peopleToMessage || [],
    habits: existingData.habits || [],
    goodDayVision: existingData.goodDayVision || ''
  });

  const totalSteps = 13;

  const habitOptions = [
    { id: 'guitar', label: 'Guitar', icon: Star },
    { id: 'write', label: 'Write', icon: Star },
    { id: 'read', label: 'Read', icon: Star },
    { id: 'exercise', label: 'Exercise', icon: Target },
    { id: 'socialise', label: 'Socialise', icon: Users }
  ];

  const moodOptions = useMemo(() => {
    const allMoodOptions = [
      { value: 'energised', label: 'Energised' },
      { value: 'ready', label: 'Ready' },
      { value: 'upbeat', label: 'Upbeat' },
      { value: 'motivated', label: 'Motivated' },
      { value: 'excited', label: 'Excited' },
      { value: 'confident', label: 'Confident' },
      { value: 'calm', label: 'Calm' },
      { value: 'focused', label: 'Focused' },
      { value: 'optimistic', label: 'Optimistic' },
      { value: 'happy', label: 'Happy' },
      { value: 'productive', label: 'Productive' },
      { value: 'content', label: 'Content' },
      { value: 'okay', label: 'Okay' },
      { value: 'tired', label: 'Tired' },
      { value: 'neutral', label: 'Neutral' },
      { value: 'stressed', label: 'Stressed' },
      { value: 'distracted', label: 'Distracted' },
      { value: 'restless', label: 'Restless' },
      { value: 'busy', label: 'Busy' },
      { value: 'unsure', label: 'Unsure' },
      { value: 'low-key', label: 'Low-key' },
      { value: 'flat', label: 'Flat' },
      { value: 'anxious', label: 'Anxious' },
      { value: 'overwhelmed', label: 'Overwhelmed' },
      { value: 'unmotivated', label: 'Unmotivated' },
      { value: 'sad', label: 'Sad' },
      { value: 'irritable', label: 'Irritable' },
      { value: 'stuck', label: 'Stuck' },
      { value: 'exhausted', label: 'Exhausted' },
      { value: 'frustrated', label: 'Frustrated' },
      { value: 'lonely', label: 'Lonely' },
      { value: 'hopeless', label: 'Hopeless' }
    ];
    
    // Use today's date as a seed for consistent randomization per day
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Simple seeded shuffle
    const shuffled = [...allMoodOptions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor((seed + i) % (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }, []); // Empty dependency array means this only runs once per component mount

  const handleNext = () => {
    if (step < totalSteps) {
      setIsAnimating(true);
      setTimeout(() => {
        setStep(step + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      onComplete({
        ...formData,
        additionalTasks: formData.additionalTasks?.filter(task => task.trim() !== ''),
        peopleToMessage: formData.peopleToMessage?.filter(person => person.trim() !== ''),
        habits: formData.habits || [],
        date: new Date().toISOString()
      });
    }
  };

  const handleSleepRatingSelect = (rating: number) => {
    setFormData({ ...formData, sleepQuality: rating });
  };

  const handleTimeInput = (field: 'bedTime' | 'wakeTime', value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleMoodSelect = (mood: string) => {
    setFormData({ ...formData, morningMood: mood });
  };

  const handleTextInput = (field: keyof DailyData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleBack = () => {
    if (step > 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setStep(step - 1);
        setIsAnimating(false);
      }, 300);
    } else {
      onBack();
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return true; // Greeting
      case 2: return formData.sleepQuality !== undefined;
      case 3: return formData.bedTime !== '';
      case 4: return formData.wakeTime !== '';
      case 5: return formData.morningMood !== undefined;
      case 6: return formData.morningFeelings?.trim() !== '';
      case 7: return formData.mainPriority?.trim() !== '';
      case 8: return formData.firstStep?.trim() !== '';
      case 9: return true; // Optional tasks
      case 10: return true; // Optional people
      case 11: return true; // Optional good stuff
      case 12: return formData.goodDayVision?.trim() !== '';
      case 13: return true; // Wrap-up message
      default: return false;
    }
  };

  const toggleHabit = (itemId: string) => {
    const current = formData.habits || [];
    const updated = current.includes(itemId)
      ? current.filter(id => id !== itemId)
      : [...current, itemId];
    setFormData({ ...formData, habits: updated });
  };

  const handleHabitsComplete = () => {
    // Manual progression for good stuff selection
    handleNext();
  };

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-float">
              <Sun size={48} className="text-white" />
            </div>
            <h3 className={`text-4xl font-bold mb-6 animate-slide-up ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Good morning
            </h3>
            <p className={`text-xl mb-12 animate-slide-up ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`} style={{animationDelay: '0.2s'}}>
              Ready to start your day?
            </p>
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-12 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-pulse-glow"
            >
              Let's begin
            </button>
          </div>
        );

      case 2:
        return (
          <div className="animate-fade-in">
            <h3 className={`text-3xl font-bold mb-8 text-center animate-slide-up ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              How did you sleep?
            </h3>
            <div className="flex justify-center space-x-6 mb-8">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleSleepRatingSelect(rating)}
                  className={`w-20 h-20 rounded-full border-2 font-semibold text-xl transition-all duration-500 hover:scale-110 transform ${
                    formData.sleepQuality === rating
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-500 scale-110 shadow-lg'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-200 border-gray-600 hover:border-blue-400 hover:bg-gray-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                  style={{animationDelay: `${rating * 0.1}s`}}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className={`flex justify-between text-sm max-w-md mx-auto animate-slide-up ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} style={{animationDelay: '0.6s'}}>
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="animate-fade-in">
            <h3 className={`text-3xl font-bold mb-8 text-center animate-slide-up ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              What time did you go to bed?
            </h3>
            <div className="max-w-md mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
              <TimePicker
                value={formData.bedTime}
                onChange={(time) => handleTimeInput('bedTime', time)}
                placeholder="Select bedtime"
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="animate-fade-in">
            <h3 className={`text-3xl font-bold mb-8 text-center animate-slide-up ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              What time did you wake up?
            </h3>
            <div className="max-w-md mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
              <TimePicker
                value={formData.wakeTime}
                onChange={(time) => handleTimeInput('wakeTime', time)}
                placeholder="Select wake time"
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="animate-fade-in">
            <h3 className={`text-3xl font-bold mb-8 text-center animate-slide-up ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              How are you feeling right now?
            </h3>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-5 gap-3">
                {moodOptions.map((option, index) => (
                  <button
                    key={option.value}
                    onClick={() => handleMoodSelect(option.value)}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 transform text-sm font-medium ${
                      formData.morningMood === option.value
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-500 scale-105 shadow-lg'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-200 border-gray-600 hover:border-blue-400 hover:bg-gray-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                    style={{animationDelay: `${index * 0.02}s`}}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="animate-fade-in">
            <h3 className={`text-3xl font-bold mb-8 text-center animate-slide-up ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Tell me more about how you're feeling
            </h3>
            <div className="max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
              <textarea
                value={formData.morningFeelings}
                onChange={(e) => handleTextInput('morningFeelings', e.target.value)}
                placeholder="Share your thoughts..."
                className={`w-full p-6 border-2 rounded-xl focus:border-blue-500 focus:outline-none resize-none h-32 text-lg shadow-lg ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                    : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="animate-fade-in">
            <h3 className={`text-3xl font-bold mb-8 text-center animate-slide-up ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              What's the one thing you absolutely must do today?
            </h3>
            <div className="max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
              <textarea
                value={formData.mainPriority}
                onChange={(e) => handleTextInput('mainPriority', e.target.value)}
                placeholder="Your main priority..."
                className={`w-full p-6 border-2 rounded-xl focus:border-blue-500 focus:outline-none resize-none h-32 text-lg shadow-lg ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                    : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>
        );

      case 8:
        return (
          <div className="animate-fade-in">
            <h3 className={`text-3xl font-bold mb-8 text-center animate-slide-up ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              What's the very first tiny step to get it started?
            </h3>
            <div className="max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
              <textarea
                value={formData.firstStep}
                onChange={(e) => handleTextInput('firstStep', e.target.value)}
                placeholder="The smallest possible action..."
                className={`w-full p-6 border-2 rounded-xl focus:border-blue-500 focus:outline-none resize-none h-32 text-lg shadow-lg ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                    : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>
        );

      case 9:
        return (
          <div className="animate-fade-in">
            <h3 className={`text-3xl font-bold mb-8 text-center animate-slide-up ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              What other tasks would you like to accomplish today?
            </h3>
            <div className="max-w-2xl mx-auto space-y-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="animate-slide-up" style={{animationDelay: `${0.2 + (index * 0.1)}s`}}>
                  <input
                    type="text"
                    value={formData.additionalTasks?.[index] || ''}
                    onChange={(e) => {
                      const newTasks = [...(formData.additionalTasks || [])];
                      newTasks[index] = e.target.value;
                      setFormData({ ...formData, additionalTasks: newTasks });
                    }}
                    placeholder={`Task ${index + 1} (optional)`}
                    className={`w-full p-4 border-2 rounded-xl focus:border-blue-500 focus:outline-none text-lg shadow-lg ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 10:
        return (
          <div className="animate-fade-in">
            <h3 className={`text-3xl font-bold mb-8 text-center animate-slide-up ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Who do you want to connect with today?
            </h3>
            <div className="max-w-2xl mx-auto space-y-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="animate-slide-up" style={{animationDelay: `${0.2 + (index * 0.1)}s`}}>
                  <input
                    type="text"
                    value={formData.peopleToMessage?.[index] || ''}
                    onChange={(e) => {
                      const newPeople = [...(formData.peopleToMessage || [])];
                      newPeople[index] = e.target.value;
                      setFormData({ ...formData, peopleToMessage: newPeople });
                    }}
                    placeholder={`Person ${index + 1} (optional)`}
                    className={`w-full p-4 border-2 rounded-xl focus:border-blue-500 focus:outline-none text-lg shadow-lg ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 11:
        return (
          <div className="animate-fade-in">
            <h3 className={`text-3xl font-bold mb-8 text-center animate-slide-up ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Which habits would you like to track today?
            </h3>
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
              {habitOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleHabit(option.id)}
                    className={`flex items-center space-x-4 p-6 rounded-xl border-2 transition-all duration-500 hover:scale-105 transform ${
                      formData.habits?.includes(option.id)
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-500 scale-105 shadow-lg'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-200 border-gray-600 hover:border-blue-400 hover:bg-gray-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <Icon size={24} />
                    <span className="font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="text-center">
              <button
                onClick={handleHabitsComplete}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 12:
        return (
          <div className="animate-fade-in">
            <h3 className={`text-3xl font-bold mb-8 text-center animate-slide-up ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              What does a good day look like for you today?
            </h3>
            <div className="max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
              <textarea
                value={formData.goodDayVision}
                onChange={(e) => handleTextInput('goodDayVision', e.target.value)}
                placeholder="Describe your ideal day..."
                className={`w-full p-6 border-2 rounded-xl focus:border-blue-500 focus:outline-none resize-none h-32 text-lg shadow-lg ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                    : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>
        );

      case 13:
        return (
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <Check size={48} className="text-white" />
            </div>
            <h3 className={`text-3xl font-bold mb-6 animate-slide-up ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Perfect
            </h3>
            <div className={`max-w-2xl mx-auto rounded-2xl p-8 border animate-slide-up ${
              isDarkMode 
                ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' 
                : 'bg-gradient-to-r from-blue-50 to-green-50 border-blue-200'
            }`} style={{animationDelay: '0.2s'}}>
              <p className={`text-lg leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Stay hydrated, fuel yourself well, and remember: <strong>even tiny starts count</strong>.
              </p>
              <p className="text-xl font-bold text-blue-600 mt-4">
                You've got this
              </p>
            </div>
            <div className="mt-8 animate-slide-up" style={{animationDelay: '0.4s'}}>
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-12 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                Complete Morning Check-in
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`h-full flex flex-col ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-slate-50 to-blue-50'
    }`}>
      {/* Header */}
      <div className={`${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      } border-b p-4 flex-shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sun size={16} className="text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Morning Check-in</h2>
              <p className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>Step {step} of {totalSteps}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onBack}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={onBack}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className={`w-full rounded-full h-1 mt-3 ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 flex flex-col justify-between overflow-y-auto">
        <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${
          isAnimating ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'
        }`}>
          {getStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 ${
              isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          {step > 1 && step < totalSteps && (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                canProceed()
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>{step === totalSteps ? 'Complete' : 'Next'}</span>
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MorningFlow;