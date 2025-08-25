import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Sun } from 'lucide-react';
import { DailyData } from '../types';

interface MorningFlowProps {
  onComplete: (data: DailyData) => void;
  onBack: () => void;
  existingData: DailyData;
}

const MorningFlow: React.FC<MorningFlowProps> = ({ onComplete, onBack, existingData }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<DailyData>({
    sleepQuality: existingData.sleepQuality || undefined,
    morningMood: existingData.morningMood || undefined,
    mainPriority: existingData.mainPriority || '',
    additionalTasks: existingData.additionalTasks || ['', ''],
    peopleToMessage: existingData.peopleToMessage || []
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete({
        ...formData,
        additionalTasks: formData.additionalTasks?.filter(task => task.trim() !== ''),
        peopleToMessage: formData.peopleToMessage?.filter(person => person.trim() !== ''),
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
      case 1: return formData.sleepQuality !== undefined;
      case 2: return formData.morningMood !== undefined;
      case 3: return formData.mainPriority?.trim() !== '';
      case 4: return true; // Optional step
      case 5: return true; // Optional step
      default: return false;
    }
  };

  const addPerson = () => {
    setFormData({
      ...formData,
      peopleToMessage: [...(formData.peopleToMessage || []), '']
    });
  };

  const updatePerson = (index: number, value: string) => {
    const updated = [...(formData.peopleToMessage || [])];
    updated[index] = value;
    setFormData({ ...formData, peopleToMessage: updated });
  };

  const removePerson = (index: number) => {
    const updated = [...(formData.peopleToMessage || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, peopleToMessage: updated });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Sun size={32} />
            <div>
              <h2 className="text-2xl font-bold">Morning Check-in</h2>
              <p className="text-yellow-100">Let's start your day right</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-yellow-600/30 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <p className="text-sm text-yellow-100 mt-2">Step {step} of {totalSteps}</p>
        </div>

        {/* Content */}
        <div className="p-8 min-h-[400px] flex flex-col justify-between">
          <div className="flex-1">
            {step === 1 && (
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  How did you sleep last night?
                </h3>
                <p className="text-gray-600 mb-8">Rate your sleep quality from 1 to 5</p>
                
                <div className="flex justify-center space-x-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setFormData({ ...formData, sleepQuality: rating })}
                      className={`w-16 h-16 rounded-full border-2 font-semibold text-lg transition-all duration-200 ${
                        formData.sleepQuality === rating
                          ? 'bg-orange-500 text-white border-orange-500 transform scale-110'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                
                <div className="flex justify-between text-sm text-gray-500 mt-4 max-w-sm mx-auto">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  How are you feeling this morning?
                </h3>
                <p className="text-gray-600 mb-8">Select your current mood</p>
                
                <div className="flex justify-center space-x-4">
                  {[
                    { value: 1, emoji: '😴', label: 'Tired' },
                    { value: 2, emoji: '😔', label: 'Low' },
                    { value: 3, emoji: '😐', label: 'Neutral' },
                    { value: 4, emoji: '😊', label: 'Good' },
                    { value: 5, emoji: '🌟', label: 'Great' }
                  ].map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setFormData({ ...formData, morningMood: mood.value })}
                      className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                        formData.morningMood === mood.value
                          ? 'bg-blue-500 text-white border-blue-500 transform scale-105'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <span className="text-3xl mb-2">{mood.emoji}</span>
                      <span className="text-sm font-medium">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
                  What's the ONE thing you need to get done today?
                </h3>
                <p className="text-gray-600 mb-8 text-center">Focus on your most important priority</p>
                
                <div className="max-w-md mx-auto">
                  <textarea
                    value={formData.mainPriority}
                    onChange={(e) => setFormData({ ...formData, mainPriority: e.target.value })}
                    placeholder="e.g., Complete the presentation for tomorrow's meeting"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none h-32 text-lg"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
                  Any other top tasks for today?
                </h3>
                <p className="text-gray-600 mb-8 text-center">Add up to 2 additional tasks (optional)</p>
                
                <div className="max-w-md mx-auto space-y-4">
                  {formData.additionalTasks?.map((task, index) => (
                    <div key={index}>
                      <input
                        type="text"
                        value={task}
                        onChange={(e) => {
                          const updated = [...(formData.additionalTasks || [])];
                          updated[index] = e.target.value;
                          setFormData({ ...formData, additionalTasks: updated });
                        }}
                        placeholder={`Task ${index + 1}`}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
                  Who do you need to message today?
                </h3>
                <p className="text-gray-600 mb-8 text-center">Keep track of important people to contact</p>
                
                <div className="max-w-md mx-auto space-y-3">
                  {formData.peopleToMessage?.map((person, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={person}
                        onChange={(e) => updatePerson(index, e.target.value)}
                        placeholder="Name or description"
                        className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        onClick={() => removePerson(index)}
                        className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={addPerson}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors"
                  >
                    + Add person
                  </button>
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
                  ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>{step === totalSteps ? 'Complete' : 'Next'}</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MorningFlow;