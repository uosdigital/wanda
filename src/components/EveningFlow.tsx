import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Moon } from 'lucide-react';
import { DailyData } from '../types';

interface EveningFlowProps {
  onComplete: (data: DailyData) => void;
  onBack: () => void;
  existingData: DailyData;
}

const EveningFlow: React.FC<EveningFlowProps> = ({ onComplete, onBack, existingData }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<DailyData>({
    completedMainTask: existingData.completedMainTask ?? undefined,
    winOfDay: existingData.winOfDay || '',
    obstacles: existingData.obstacles || [],
    eveningMood: existingData.eveningMood || undefined,
    completedHabits: existingData.completedHabits || [false, false, false, false, false]
  });

  const totalSteps = 5;

  const habits = [
    'Exercise',
    'Meditation',
    'Reading',
    'Journaling',
    'Drink 8 glasses of water'
  ];

  const obstacleOptions = [
    'Distractions',
    'Low energy',
    'Unclear task',
    'Too many meetings',
    'Technical issues',
    'Interrupted by others',
    'Poor planning',
    'Procrastination'
  ];

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

  const canProceed = () => {
    switch (step) {
      case 1: return formData.completedMainTask !== undefined;
      case 2: return formData.winOfDay?.trim() !== '';
      case 3: return true; // Optional step
      case 4: return formData.eveningMood !== undefined;
      case 5: return true; // Optional step
      default: return false;
    }
  };

  const toggleObstacle = (obstacle: string) => {
    const current = formData.obstacles || [];
    const updated = current.includes(obstacle)
      ? current.filter(o => o !== obstacle)
      : [...current, obstacle];
    setFormData({ ...formData, obstacles: updated });
  };

  const toggleHabit = (index: number) => {
    const updated = [...(formData.completedHabits || [])];
    updated[index] = !updated[index];
    setFormData({ ...formData, completedHabits: updated });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-8 text-white">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Moon size={32} className="animate-float" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Evening Review</h2>
            <p className="text-purple-100 text-lg">Reflect on your day</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-purple-600/30 rounded-full h-3">
          <div 
            className="bg-white h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
        <p className="text-sm text-purple-100 mt-3">Step {step} of {totalSteps}</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 flex flex-col justify-between overflow-y-auto">
        <div className="flex-1">
          {step === 1 && (
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Did you complete your main priority today?
              </h3>
              <p className="text-gray-600 mb-8">Be honest with yourself</p>
              
              <div className="flex justify-center space-x-6">
                <button
                  onClick={() => setFormData({ ...formData, completedMainTask: true })}
                  className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-200 ${
                    formData.completedMainTask === true
                      ? 'bg-green-500 text-white border-green-500 transform scale-105'
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
                      : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50'
                  }`}
                >
                  <span className="text-4xl mb-2">❌</span>
                  <span className="text-lg font-medium">Not today</span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
                What was your biggest win today?
              </h3>
              <p className="text-gray-600 mb-8 text-center">Celebrate your achievements, big or small</p>
              
              <div className="max-w-md mx-auto">
                <textarea
                  value={formData.winOfDay}
                  onChange={(e) => setFormData({ ...formData, winOfDay: e.target.value })}
                  placeholder="e.g., I finished the presentation ahead of schedule"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none h-32 text-lg"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
                What obstacles did you face today?
              </h3>
              <p className="text-gray-600 mb-8 text-center">Select all that apply (optional)</p>
              
              <div className="max-w-2xl mx-auto grid grid-cols-2 gap-3">
                {obstacleOptions.map((obstacle) => (
                  <button
                    key={obstacle}
                    onClick={() => toggleObstacle(obstacle)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      (formData.obstacles || []).includes(obstacle)
                        ? 'bg-red-100 text-red-700 border-red-300'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    {obstacle}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                How are you feeling tonight?
              </h3>
              <p className="text-gray-600 mb-8">Rate your evening mood</p>
              
              <div className="flex justify-center space-x-4">
                {[
                          { value: 1, label: 'Exhausted' },
        { value: 2, label: 'Drained' },
        { value: 3, label: 'Okay' },
        { value: 4, label: 'Good' },
        { value: 5, label: 'Energized' }
                ].map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setFormData({ ...formData, eveningMood: mood.value })}
                    className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                      formData.eveningMood === mood.value
                        ? 'bg-purple-500 text-white border-purple-500 transform scale-105'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <span className="text-3xl mb-2">•</span>
                    <span className="text-sm font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
                Which habits did you complete today?
              </h3>
              <p className="text-gray-600 mb-8 text-center">Track your daily habits</p>
              
              <div className="max-w-md mx-auto space-y-3">
                {habits.map((habit, index) => (
                  <label 
                    key={index}
                    className="flex items-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={(formData.completedHabits || [])[index] || false}
                      onChange={() => toggleHabit(index)}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 mr-4"
                    />
                    <span className="text-lg text-gray-700">{habit}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
              canProceed()
                ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>{step === totalSteps ? 'Complete' : 'Next'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EveningFlow;