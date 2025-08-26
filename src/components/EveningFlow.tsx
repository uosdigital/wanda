import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, X } from 'lucide-react';
import healthyImg from '../../images/healthy.jpg';
import listenImg from '../../images/listen.jpg';
import mindfulImg from '../../images/mindful.jpg';
import basicsImg from '../../images/basics.jpg';
import visionImg from '../../images/vision.jpg';
import runImg from '../../images/run.jpg';
import { DailyData } from '../types';

interface EveningFlowProps {
  onComplete: (data: DailyData) => void;
  onBack: () => void;
  existingData: DailyData;
  isDarkMode?: boolean;
}

const EveningFlow: React.FC<EveningFlowProps> = ({ onComplete, onBack, existingData, isDarkMode = false }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<DailyData>({
    completedMainTask: existingData.completedMainTask ?? undefined,
    completedTasks: existingData.completedTasks || [],
    completedPeople: existingData.completedPeople || [],
    completedHabits: existingData.completedHabits || [],
    habitDetails: existingData.habitDetails || {},
    basics: existingData.basics || {},
    eveningMood: existingData.eveningMood || undefined,
    dayDescription: existingData.dayDescription || ''
  });

  const totalSteps = 9;

  const eveningMoods = [
    'energised', 'ready', 'upbeat', 'motivated', 'excited', 'confident', 'calm', 'focused', 'optimistic', 'happy', 'productive', 'content', 'okay', 'tired', 'neutral', 'stressed', 'distracted', 'restless', 'busy', 'unsure', 'low-key', 'flat', 'anxious', 'overwhelmed', 'unmotivated', 'sad', 'irritable', 'stuck', 'exhausted', 'frustrated', 'lonely', 'hopeless'
  ];

  const habitLabels: { [key: string]: string } = {
    'guitar': 'Guitar',
    'write': 'Write',
    'read': 'Read',
    'exercise': 'Exercise',
    'socialise': 'Socialise'
  };

  const habitQuestions: { [key: string]: string } = {
    'guitar': 'What did you play?',
    'write': 'What did you write?',
    'read': 'What did you read?',
    'exercise': 'What exercise did you do?',
    'socialise': 'What did you do?'
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete({
        ...formData,
        date: new Date().toISOString()
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
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
      case 1: return true; // Welcome message
      case 2: return formData.completedMainTask !== undefined;
      case 3: return true; // Tasks completion
      case 4: return true; // People connection
      case 5: return true; // Habits
      case 6: return true; // Basics
      case 7: return formData.eveningMood !== undefined;
      case 8: return formData.dayDescription?.trim() !== '';
      case 9: return true; // Final message
      default: return false;
    }
  };

  const toggleTask = (index: number) => {
    const completedTasks = formData.completedTasks || [];
    const newCompleted = [...completedTasks];
    newCompleted[index] = !newCompleted[index];
    setFormData({ ...formData, completedTasks: newCompleted });
  };

  const togglePerson = (index: number) => {
    const completedPeople = formData.completedPeople || [];
    const newCompleted = [...completedPeople];
    newCompleted[index] = !newCompleted[index];
    setFormData({ ...formData, completedPeople: newCompleted });
  };

  const toggleHabit = (habitId: string) => {
    const completedHabits = formData.completedHabits || [];
    const newCompleted = completedHabits.includes(habitId)
      ? completedHabits.filter(id => id !== habitId)
      : [...completedHabits, habitId];
    setFormData({ ...formData, completedHabits: newCompleted });
  };

  const updateHabitDetail = (habitId: string, detail: string) => {
    const habitDetails = formData.habitDetails || {};
    setFormData({
      ...formData,
      habitDetails: {
        ...habitDetails,
        [habitId]: detail
      }
    });
  };

  return (
    <div className="h-full flex flex-col">
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
              }`}>Evening Review</h2>
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
            className="bg-gradient-to-r from-purple-500 to-blue-600 h-1 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col">
        <div className="flex items-start justify-center min-h-0 py-4 flex-1">
          <div className="w-full max-w-md">
          {step === 1 && (
            <div className="text-center">
              <div className="w-24 h-24 rounded-xl overflow-hidden mx-auto mb-8">
                <img src={visionImg} alt="Vision" className="w-full h-full object-cover" />
              </div>
              <h3 className={`text-2xl font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Good evening! Let's see how today went for you...
              </h3>
              <p className={`mb-8 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Ready to reflect on your day?</p>
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-12 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-pulse-glow"
              >
                Start Evening Review
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="text-center">
              <h3 className={`text-2xl font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Did you complete your top priority task?
              </h3>
              <p className={`mb-8 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {existingData.mainPriority ? `"${existingData.mainPriority}"` : 'Your main priority for today'}
              </p>
              
              <div className="flex justify-center space-x-6">
                <button
                  onClick={() => setFormData({ ...formData, completedMainTask: true })}
                  className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-200 ${
                    formData.completedMainTask === true
                      ? 'bg-green-500 text-white border-green-500 transform scale-105'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-200 border-gray-600 hover:border-green-400 hover:bg-gray-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <span className="text-4xl mb-2">✓</span>
                  <span className="text-lg font-medium">Yes, I did it!</span>
                </button>

                <button
                  onClick={() => setFormData({ ...formData, completedMainTask: false })}
                  className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-200 ${
                    formData.completedMainTask === false
                      ? 'bg-red-500 text-white border-red-500 transform scale-105'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-200 border-gray-600 hover:border-red-400 hover:bg-gray-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50'
                  }`}
                >
                  <span className="text-4xl mb-2">❌</span>
                  <span className="text-lg font-medium">Not today</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className={`text-2xl font-semibold mb-4 text-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Which of your other key tasks did you complete?
              </h3>
              <p className={`mb-8 text-center ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Select all that apply</p>
              
              <div className="max-w-md mx-auto space-y-3">
                {(existingData.additionalTasks || []).map((task, index) => (
                  <div 
                    key={index}
                    className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition-colors ${
                      (formData.completedTasks || [])[index]
                        ? isDarkMode
                          ? 'bg-green-900/20 border-2 border-green-600'
                          : 'bg-green-100 border-2 border-green-200'
                        : isDarkMode
                          ? 'bg-gray-700 border-2 border-gray-600 hover:bg-gray-600'
                          : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => toggleTask(index)}
                  >
                    {(formData.completedTasks || [])[index] ? (
                      <CheckCircle2 className="text-green-500 flex-shrink-0" size={24} />
                    ) : (
                      <Circle className="text-gray-400 flex-shrink-0" size={24} />
                    )}
                    <span className={`${
                      (formData.completedTasks || [])[index]
                        ? isDarkMode
                          ? 'text-green-400 font-medium'
                          : 'text-green-700 font-medium'
                        : isDarkMode
                          ? 'text-gray-200'
                          : 'text-gray-700'
                    }`}>
                      {task}
                    </span>
                  </div>
                ))}
                {(existingData.additionalTasks || []).length === 0 && (
                  <p className={`text-center ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>No additional tasks set for today</p>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className={`text-2xl font-semibold mb-4 text-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Who did you connect with today?
              </h3>
              <p className={`mb-8 text-center ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Select all that apply</p>
              
              <div className="max-w-md mx-auto space-y-3">
                {(existingData.peopleToMessage || []).map((person, index) => (
                  <div 
                    key={index}
                    className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition-colors ${
                      (formData.completedPeople || [])[index]
                        ? isDarkMode
                          ? 'bg-blue-900/20 border-2 border-blue-600'
                          : 'bg-blue-100 border-2 border-blue-200'
                        : isDarkMode
                          ? 'bg-gray-700 border-2 border-gray-600 hover:bg-gray-600'
                          : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => togglePerson(index)}
                  >
                    {(formData.completedPeople || [])[index] ? (
                      <CheckCircle2 className="text-blue-500 flex-shrink-0" size={24} />
                    ) : (
                      <Circle className="text-gray-400 flex-shrink-0" size={24} />
                    )}
                    <span className={`${
                      (formData.completedPeople || [])[index]
                        ? isDarkMode
                          ? 'text-blue-400 font-medium'
                          : 'text-blue-700 font-medium'
                        : isDarkMode
                          ? 'text-gray-200'
                          : 'text-gray-700'
                    }`}>
                      {person}
                    </span>
                  </div>
                ))}
                {(existingData.peopleToMessage || []).length === 0 && (
                  <p className={`text-center ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>No people to connect with set for today</p>
                )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h3 className={`text-2xl font-semibold mb-4 text-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Which habits did you spend time on?
              </h3>
              <p className={`mb-8 text-center ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Select and tell me more about each one</p>
              
              <div className="max-w-md mx-auto space-y-4">
                {(existingData.habits || []).map((habitId) => {
                  const isCompleted = (formData.completedHabits || []).includes(habitId);
                  return (
                    <div key={habitId} className="space-y-3">
                      <div 
                        className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition-colors ${
                          isCompleted
                            ? isDarkMode
                              ? 'bg-purple-900/20 border-2 border-purple-600'
                              : 'bg-purple-100 border-2 border-purple-200'
                            : isDarkMode
                              ? 'bg-gray-700 border-2 border-gray-600 hover:bg-gray-600'
                              : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => toggleHabit(habitId)}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="text-purple-500 flex-shrink-0" size={24} />
                        ) : (
                          <Circle className="text-gray-400 flex-shrink-0" size={24} />
                        )}
                        <span className={`${
                          isCompleted
                            ? isDarkMode
                              ? 'text-purple-400 font-medium'
                              : 'text-purple-700 font-medium'
                            : isDarkMode
                              ? 'text-gray-200'
                              : 'text-gray-700'
                        }`}>
                          {habitLabels[habitId] || habitId}
                        </span>
                      </div>
                      
                                              {isCompleted && (
                        <div className="mt-3">
                          <label className={`block text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {habitQuestions[habitId] || 'Tell me more:'}
                          </label>
                          <input
                            type="text"
                            value={formData.habitDetails?.[habitId] || ''}
                            onChange={(e) => updateHabitDetail(habitId, e.target.value)}
                            placeholder="e.g., 30 minutes of cardio"
                            className={`w-full p-4 border-2 rounded-xl focus:outline-none text-lg ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400'
                                : 'border-gray-200 focus:border-purple-500'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
                {(existingData.habits || []).length === 0 && (
                  <p className={`text-center ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>No habits planned for today</p>
                )}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h3 className={`text-2xl font-semibold mb-4 text-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                How did you do with the basics today?
              </h3>
              <p className={`mb-8 text-center ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Let's check in on your wellness basics</p>
              
              <div className="max-w-md mx-auto space-y-4">
                {[
                  { id: 'drankWater', label: 'I drank enough water today.', image: basicsImg },
                  { id: 'ateHealthy', label: 'I ate healthy meals today.', image: healthyImg },
                  { id: 'listenedToSomething', label: 'I listened to something interesting today.', image: listenImg },
                  { id: 'wasMindful', label: 'I took 10 minutes to be mindful today.', image: mindfulImg },
                  { id: 'steps10k', label: 'I did 10k steps today.', image: runImg }
                ].map((basic) => {
                  const isCompleted = formData.basics?.[basic.id as keyof typeof formData.basics] || false;
                  return (
                    <div 
                      key={basic.id}
                      className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition-colors ${
                        isCompleted
                          ? isDarkMode
                            ? 'bg-green-900/20 border-2 border-green-600'
                            : 'bg-green-100 border-2 border-green-200'
                          : isDarkMode
                            ? 'bg-gray-700 border-2 border-gray-600 hover:bg-gray-600'
                            : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        const currentBasics = formData.basics || {};
                        const newBasics = {
                          ...currentBasics,
                          [basic.id]: !isCompleted
                        };
                        setFormData({ ...formData, basics: newBasics });
                      }}
                    >
                      <div className="w-6 h-6 rounded-md overflow-hidden bg-gray-200">
                        <img src={basic.image} alt={basic.label} className="w-full h-full object-cover" />
                      </div>
                      <span className={`flex-1 ${
                        isCompleted
                          ? isDarkMode
                            ? 'text-green-400 font-medium'
                            : 'text-green-700 font-medium'
                          : isDarkMode
                            ? 'text-gray-200'
                            : 'text-gray-700'
                      }`}>
                        {basic.label}
                      </span>
                      {isCompleted ? (
                        <CheckCircle2 className="text-green-500 flex-shrink-0 ml-2" size={24} />
                      ) : (
                        <Circle className="text-gray-400 flex-shrink-0 ml-2" size={24} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="text-center">
              <h3 className={`text-2xl font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                How are you feeling this evening?
              </h3>
              <p className={`mb-8 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Choose a word that best describes your mood</p>
              
              <div className="max-w-2xl mx-auto grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
                {eveningMoods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setFormData({ ...formData, eveningMood: mood })}
                    className={`p-3 md:p-4 rounded-xl border-2 transition-all duration-200 text-sm md:text-base ${
                      formData.eveningMood === mood
                        ? isDarkMode
                          ? 'bg-purple-900/20 text-purple-400 border-purple-600 transform scale-105'
                          : 'bg-purple-100 text-purple-700 border-purple-300 transform scale-105'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-200 border-gray-600 hover:border-purple-400 hover:bg-gray-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 8 && (
            <div>
              <h3 className={`text-2xl font-semibold mb-4 text-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                How would you describe how today went?
              </h3>
              <p className={`mb-8 text-center ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Share your thoughts about the day</p>
              
              <div className="max-w-md mx-auto">
                <textarea
                  value={formData.dayDescription}
                  onChange={(e) => setFormData({ ...formData, dayDescription: e.target.value })}
                  placeholder="e.g., Today was productive but challenging. I made good progress on my main goal..."
                  className={`w-full p-4 border-2 rounded-xl focus:outline-none resize-none h-32 text-lg ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400'
                      : 'border-gray-200 focus:border-purple-500'
                  }`}
                />
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="text-center">
              <h3 className={`text-2xl font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                That's it for today!
              </h3>
              <p className={`mb-8 text-lg ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Sleep well and I'll see you in the morning!
              </p>
              <div className="w-24 h-24 rounded-xl overflow-hidden mx-auto mb-8">
                <img src={visionImg} alt="Vision" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-12 py-4 rounded-xl font-semibold text-lg"
              >
                Complete Evening Review
              </button>
            </div>
          )}
        </div>
      </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 mb-20 md:mt-auto md:mb-0">
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

          {step > 1 && step < 9 && (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                canProceed()
                  ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
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

export default EveningFlow;