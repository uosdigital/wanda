import React, { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { DailyData, TimeBlock } from '../types';
import visionImg from '../../images/vision.jpg';
import guitarImg from '../../images/guitar.jpg';
import writeImg from '../../images/write.jpg';
import readImg from '../../images/read.jpg';
import runImg from '../../images/run.jpg';
import socialiseImg from '../../images/socialise.jpg';

interface TimeInputProps {
  value: string | undefined;
  onChange: (time: string) => void;
  placeholder?: string;
  isDarkMode?: boolean;
}

const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, placeholder, isDarkMode = false }) => {
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    // Allow partial input while typing, but validate final format
    if (timeValue === '' || /^([0-9]|0[0-9]|1[0-9]|2[0-3])?(:[0-5]?[0-9]?)?$/.test(timeValue)) {
      onChange(timeValue);
    }
  };

  return (
    <input
      type="text"
      value={value || ''}
      onChange={handleTimeChange}
      placeholder={placeholder || 'HH:MM'}
      className={`w-full p-3 border rounded-lg focus:border-blue-500 focus:outline-none text-center ${
        isDarkMode 
          ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
      }`}
    />
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
    goodDayVision: existingData.goodDayVision || '',
    meetings: existingData.meetings || []
  });

  const totalSteps = 14;

  const habitOptions = [
    { id: 'guitar', label: 'Guitar', image: guitarImg },
    { id: 'write', label: 'Write', image: writeImg },
    { id: 'read', label: 'Read', image: readImg },
    { id: 'exercise', label: 'Exercise', image: runImg },
    { id: 'socialise', label: 'Socialise', image: socialiseImg }
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
      // Convert meetings to timeblocks
      const meetingTimeBlocks: TimeBlock[] = (formData.meetings || [])
        .filter(meeting => meeting.title.trim() && meeting.startTime && meeting.endTime)
        .map((meeting, index) => {
          const today = new Date();
          const [startHour, startMinute] = meeting.startTime.split(':').map(Number);
          const [endHour, endMinute] = meeting.endTime.split(':').map(Number);
          
          const startTime = new Date(today);
          startTime.setHours(startHour, startMinute, 0, 0);
          
          const endTime = new Date(today);
          endTime.setHours(endHour, endMinute, 0, 0);
          
          return {
            id: `meeting-${index}-${Date.now()}`,
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            category: 'custom' as const,
            label: meeting.title
          };
        });

      onComplete({
        ...formData,
        additionalTasks: formData.additionalTasks?.filter(task => task.trim() !== ''),
        peopleToMessage: formData.peopleToMessage?.filter(person => person.trim() !== ''),
        habits: formData.habits || [],
        date: new Date().toISOString(),
        timeBlocks: meetingTimeBlocks
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

  // Cmd/Ctrl + Enter advances to next step when allowed
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (step < totalSteps && canProceed()) {
          e.preventDefault();
          handleNext();
        } else if (step === totalSteps && canProceed()) {
          e.preventDefault();
          handleNext();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [step, totalSteps, formData, isDarkMode]);

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
      case 12: return true; // Meetings are optional
      case 13: return formData.goodDayVision?.trim() !== '';
      case 14: return true; // Final confirmation screen
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

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 rounded-xl overflow-hidden mx-auto mb-8">
              <img src={visionImg} alt="Vision" className="w-full h-full object-cover" />
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
              <TimeInput
                value={formData.bedTime}
                onChange={(time) => handleTimeInput('bedTime', time)}
                placeholder="Bedtime (HH:MM)"
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
              <TimeInput
                value={formData.wakeTime}
                onChange={(time) => handleTimeInput('wakeTime', time)}
                placeholder="Wake time (HH:MM)"
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
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
                {moodOptions.map((option, index) => (
                  <button
                    key={option.value}
                    onClick={() => handleMoodSelect(option.value)}
                    className={`p-2 md:p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 transform text-xs md:text-sm font-medium ${
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
                    <div className="w-8 h-8 rounded-md overflow-hidden bg-gray-200">
                      <img src={option.image} alt={option.label} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 12:
        return (
          <div className="animate-fade-in">
            <h3 className={`text-3xl font-bold mb-8 text-center animate-slide-up ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              What meetings and appointments do you have today?
            </h3>
            <div className="max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="space-y-4">
                {(formData.meetings || []).map((meeting, index) => (
                  <div key={index} className={`p-4 rounded-xl border-2 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700' 
                      : 'border-gray-200 bg-white'
                  }`}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        value={meeting.title}
                        onChange={(e) => {
                          const newMeetings = [...(formData.meetings || [])];
                          newMeetings[index].title = e.target.value;
                          setFormData({ ...formData, meetings: newMeetings });
                        }}
                        placeholder="Meeting title"
                        className={`p-3 border rounded-lg focus:border-blue-500 focus:outline-none md:col-span-2 ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                        }`}
                      />
                      <TimeInput
                        value={meeting.startTime}
                        onChange={(time) => {
                          const newMeetings = [...(formData.meetings || [])];
                          newMeetings[index].startTime = time;
                          setFormData({ ...formData, meetings: newMeetings });
                        }}
                        placeholder="Start time"
                        isDarkMode={isDarkMode}
                      />
                      <TimeInput
                        value={meeting.endTime}
                        onChange={(time) => {
                          const newMeetings = [...(formData.meetings || [])];
                          newMeetings[index].endTime = time;
                          setFormData({ ...formData, meetings: newMeetings });
                        }}
                        placeholder="End time"
                        isDarkMode={isDarkMode}
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newMeetings = (formData.meetings || []).filter((_, i) => i !== index);
                        setFormData({ ...formData, meetings: newMeetings });
                      }}
                      className={`mt-2 px-3 py-1 rounded-lg text-sm ${
                        isDarkMode 
                          ? 'bg-red-900/30 text-red-200 hover:bg-red-900/40' 
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newMeetings = [...(formData.meetings || []), { title: '', startTime: '', endTime: '' }];
                    setFormData({ ...formData, meetings: newMeetings });
                  }}
                  className={`w-full p-4 border-2 border-dashed rounded-xl transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300' 
                      : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600'
                  }`}
                >
                  + Add Meeting
                </button>
              </div>
            </div>
          </div>
        );

      case 13:
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

      case 14:
        return (
          <div className="text-center animate-fade-in">
            <h3 className={`text-3xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Complete Morning Review
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
              You’re all set for the day.
            </p>
            <div className="w-24 h-24 rounded-xl overflow-hidden mx-auto mb-8">
              <img src={visionImg} alt="Vision" className="w-full h-full object-cover" />
            </div>
            <button
              onClick={handleNext}
              className="px-12 py-4 rounded-xl font-semibold text-lg bg-blue-600 text-white"
            >
              Complete
            </button>
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
      } border-b p-3 md:p-4 flex-shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src={visionImg} alt="Vision" className="w-full h-full object-cover" />
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
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className={`flex items-start justify-center transition-all duration-300 min-h-0 py-4 ${
          isAnimating ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'
        }`}>
          <div className="w-full max-w-md">
            {getStepContent()}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 mb-8">
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
              <span>Next</span>
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MorningFlow;