import React, { useState, useMemo, useEffect } from 'react';
import { DailyData, AppData, WorryEntry } from '../types';
import { Brain, Clock, MessageSquare, Heart, Eye, Lightbulb, Users, Gift, Timer, ArrowLeft, ArrowRight, X, Eye as EyeIcon, Edit3, Trash2 } from 'lucide-react';
import FullScreenModal from './FullScreenModal';
import monsterImg from '../../images/monster.jpg';

interface DreadProps {
  appData: AppData;
  todaysData: DailyData;
  onUpdateData: (data: Partial<DailyData>) => void;
  onAddPoints: (points: number, reason?: string) => void;
  isDarkMode: boolean;
  onTimeblock?: (label: string, category: 'priority' | 'task' | 'habit' | 'connect' | 'custom') => void;
}

const Dread: React.FC<DreadProps> = ({
  appData,
  todaysData,
  onUpdateData,
  onAddPoints,
  isDarkMode,
  onTimeblock
}) => {
  const [showWorryWorkflow, setShowWorryWorkflow] = useState(false);
  const [showBreathingTimer, setShowBreathingTimer] = useState(false);
  const [breathingTimeLeft, setBreathingTimeLeft] = useState(120); // 2 minutes in seconds
  const [breathingTimerActive, setBreathingTimerActive] = useState(false);
  const [showReframeModal, setShowReframeModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWorry, setSelectedWorry] = useState<WorryEntry | null>(null);
  const [reframeText, setReframeText] = useState('');
  const [editingWorry, setEditingWorry] = useState<WorryEntry | null>(null);


  // Worry workflow step state
  const [workflowStep, setWorkflowStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  // Worry workflow form state
  const [worryForm, setWorryForm] = useState({
    worry: '',
    evidence: '',
    physicalThoughts: '',
    previousExperience: '',
    balancedPerspective: '',
    friendAdvice: '',
    selfKindness: ''
  });

  const totalWorkflowSteps = 8; // 7 questions + 1 submit screen



  const todaysWorries = useMemo(() => {
    const today = new Date().toDateString();
    const worries = appData.dailyData[today]?.worries || [];
    console.log('todaysWorries useMemo - today:', today);
    console.log('todaysWorries useMemo - appData.dailyData[today]:', appData.dailyData[today]);
    console.log('todaysWorries useMemo - appData.dailyData[today].worries:', appData.dailyData[today]?.worries);
    console.log('todaysWorries useMemo - worries:', worries);
    return worries;
  }, [appData.dailyData]);

  // Force re-render when worries change
  useEffect(() => {
    const today = new Date().toDateString();
    const currentWorries = appData.dailyData[today]?.worries || [];
    console.log('useEffect - current worries:', currentWorries);
  }, [appData.dailyData]);

  // Weekly calendar state
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Get weekly worries data for calendar
  const getWeeklyWorriesData = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + currentWeekOffset * 7);
    
    const weekData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateKey = date.toDateString();
      const dayData = appData.dailyData[dateKey];
      const worries = dayData?.worries || [];
      
      weekData.push({
        date: dateKey,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        worries: worries,
        hasWorries: worries.length > 0
      });
    }
    return weekData;
  }, [appData.dailyData, currentWeekOffset]);



  const startBreathingExercise = () => {
    setBreathingTimeLeft(120);
    setBreathingTimerActive(true);
    setShowBreathingTimer(true);
  };

  const stopBreathingExercise = () => {
    setBreathingTimerActive(false);
    setShowBreathingTimer(false);
  };

  // Breathing timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (breathingTimerActive && breathingTimeLeft > 0) {
      interval = setInterval(() => {
        setBreathingTimeLeft(prev => {
          if (prev <= 1) {
            setBreathingTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathingTimerActive, breathingTimeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

    const handleWorrySubmit = () => {
    console.log('handleWorrySubmit called!');
    
    const newWorry: WorryEntry = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...worryForm
    };
    
    console.log('New worry:', newWorry);
    
    // Get current worries from appData (source of truth)
    const today = new Date().toDateString();
    const currentWorries = appData.dailyData[today]?.worries || [];
    const updatedWorries = [...currentWorries, newWorry];
    
    console.log('Current worries from appData:', currentWorries);
    console.log('Updated worries:', updatedWorries);
    
    // Save the updated worries and wait for completion
    onUpdateData({ worries: updatedWorries }).then(() => {
      console.log('Data update completed, checking if it appears...');
      
      // Add points for completing the worry workflow
      onAddPoints(20, 'Dread added');
      
      // Reset workflow and close modal
      resetWorkflow();
      setShowWorryWorkflow(false);
    });
  };

  const getStepContent = () => {
    switch (workflowStep) {
      case 1:
        return (
          <div>
            <div className="text-center mb-8">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
              }`}>
                <Brain className={`w-8 h-8 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>What is the worry?</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Describe what's worrying you right now
              </p>
            </div>
            <textarea
              value={worryForm.worry}
              onChange={(e) => setWorryForm(prev => ({ ...prev, worry: e.target.value }))}
              className={`w-full p-4 rounded-lg border resize-none ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              rows={6}
              placeholder="What's on your mind? What are you worried about?"
            />
          </div>
        );

      case 2:
        return (
          <div>
            <div className="text-center mb-8">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}>
                <Eye className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>What's the evidence?</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                What facts support this worry?
              </p>
            </div>
            <textarea
              value={worryForm.evidence}
              onChange={(e) => setWorryForm(prev => ({ ...prev, evidence: e.target.value }))}
              className={`w-full p-4 rounded-lg border resize-none ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              rows={6}
              placeholder="What evidence do you have that the worst thing will happen?"
            />
          </div>
        );

      case 3:
        return (
          <div>
            <div className="text-center mb-8">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
              }`}>
                <Heart className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>How are you feeling?</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Notice your body and mind right now
              </p>
            </div>
            <textarea
              value={worryForm.physicalThoughts}
              onChange={(e) => setWorryForm(prev => ({ ...prev, physicalThoughts: e.target.value }))}
              className={`w-full p-4 rounded-lg border resize-none ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              rows={6}
              placeholder="What physical sensations are you feeling? What thoughts are running through your mind?"
            />
          </div>
        );

      case 4:
        return (
          <div>
            <div className="text-center mb-8">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
              }`}>
                <Clock className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Have you felt this before?</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                What happened then?
              </p>
            </div>
            <textarea
              value={worryForm.previousExperience}
              onChange={(e) => setWorryForm(prev => ({ ...prev, previousExperience: e.target.value }))}
              className={`w-full p-4 rounded-lg border resize-none ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              rows={6}
              placeholder="Have you ever felt this way before? What was the outcome?"
            />
          </div>
        );

      case 5:
        return (
          <div>
            <div className="text-center mb-8">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'
              }`}>
                <Lightbulb className={`w-8 h-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>A balanced perspective</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                What's a more balanced way of looking at this?
              </p>
            </div>
            <textarea
              value={worryForm.balancedPerspective}
              onChange={(e) => setWorryForm(prev => ({ ...prev, balancedPerspective: e.target.value }))}
              className={`w-full p-4 rounded-lg border resize-none ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              rows={6}
              placeholder="Consider other perspectives. What might be a more balanced view?"
            />
          </div>
        );

      case 6:
        return (
          <div>
            <div className="text-center mb-8">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-100'
              }`}>
                <Users className={`w-8 h-8 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>What would you tell a friend?</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                If a friend were feeling this, what would you say to them?
              </p>
            </div>
            <textarea
              value={worryForm.friendAdvice}
              onChange={(e) => setWorryForm(prev => ({ ...prev, friendAdvice: e.target.value }))}
              className={`w-full p-4 rounded-lg border resize-none ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              rows={6}
              placeholder="What compassionate advice would you give to a friend in this situation?"
            />
          </div>
        );

      case 7:
        return (
          <div>
            <div className="text-center mb-8">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-pink-900/30' : 'bg-pink-100'
              }`}>
                <Gift className={`w-8 h-8 ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Be kind to yourself</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                What's one kind thing you can do for yourself right now?
              </p>
            </div>
            <textarea
              value={worryForm.selfKindness}
              onChange={(e) => setWorryForm(prev => ({ ...prev, selfKindness: e.target.value }))}
              className={`w-full p-4 rounded-lg border resize-none ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              rows={6}
              placeholder="How can you be kind to yourself in this moment?"
            />
          </div>
        );

      case 8:
        return (
          <div>
            <div className="text-center mb-8">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
              }`}>
                <Brain className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Ready to submit your worry?</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Click submit when you're ready to save your worry
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleReframeSubmit = () => {
    if (!selectedWorry) return;

    const updatedWorries = todaysWorries.map(worry => {
      if (worry.id === selectedWorry.id) {
        return {
          ...worry,
          reframe: reframeText,
          reframeDate: new Date().toISOString()
        };
      }
      return worry;
    });

    onUpdateData({ worries: updatedWorries });
    
    // Add points for adding a reframe
    onAddPoints(10, 'Dread reframed');
    
    // Reset and close
    setReframeText('');
    setSelectedWorry(null);
    setShowReframeModal(false);
  };

  const openReframeModal = (worry: WorryEntry) => {
    setSelectedWorry(worry);
    setReframeText(worry.reframe || '');
    setShowReframeModal(true);
  };

  const openViewModal = (worry: WorryEntry) => {
    setSelectedWorry(worry);
    setShowViewModal(true);
  };

  const openEditModal = (worry: WorryEntry) => {
    setEditingWorry(worry);
    setShowEditModal(true);
  };

  const handleDeleteWorry = (worryId: string) => {
    // Find the worry to check if it has a reframe
    const worryToDelete = todaysWorries.find(worry => worry.id === worryId);
    const hasReframe = worryToDelete?.reframe;
    
    const updatedWorries = todaysWorries.filter(worry => worry.id !== worryId);
    onUpdateData({ worries: updatedWorries });
    
    // Remove the 20 points that were awarded for adding this worry
    onAddPoints(-20, 'Worry deleted');
    
    // If the worry had a reframe, also remove the 10 points for the reframe
    if (hasReframe) {
      onAddPoints(-10, 'Reframe deleted with worry');
    }
  };

  const handleEditWorry = () => {
    if (!editingWorry) return;

    const updatedWorries = todaysWorries.map(worry => {
      if (worry.id === editingWorry.id) {
        return editingWorry;
      }
      return worry;
    });

    onUpdateData({ worries: updatedWorries });
    setEditingWorry(null);
    setShowEditModal(false);
  };

  // Step navigation functions
  const handleNext = () => {
    if (workflowStep < totalWorkflowSteps) {
      setIsAnimating(true);
      setTimeout(() => {
        setWorkflowStep(workflowStep + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleBack = () => {
    if (workflowStep > 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setWorkflowStep(workflowStep - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const canProceed = () => {
    switch (workflowStep) {
      case 1: return worryForm.worry.trim() !== '';
      case 2: return worryForm.evidence.trim() !== '';
      case 3: return worryForm.physicalThoughts.trim() !== '';
      case 4: return worryForm.previousExperience.trim() !== '';
      case 5: return worryForm.balancedPerspective.trim() !== '';
      case 6: return worryForm.friendAdvice.trim() !== '';
      case 7: return worryForm.selfKindness.trim() !== '';
      case 8: return true; // Submit screen - always allow proceeding
      default: return false;
    }
  };

  const resetWorkflow = () => {
    setWorkflowStep(1);
    setIsAnimating(false);
    setWorryForm({
      worry: '',
      evidence: '',
      physicalThoughts: '',
      previousExperience: '',
      balancedPerspective: '',
      friendAdvice: '',
      selfKindness: ''
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
        isDarkMode
          ? 'bg-gray-800/80 border-gray-700'
          : 'bg-white/80 border-gray-100'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-red-500/30">
              <img src={monsterImg} alt="Monster" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Dread</h1>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                A safe space for when worry takes over
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {todaysWorries.length}
            </div>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              worries today
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => {
              console.log('[DEBUG] Start Worry Workflow button clicked!');
              setShowWorryWorkflow(true);
            }}
            className={`p-6 rounded-xl border-2 border-dashed transition-all duration-200 hover:scale-105 ${
              isDarkMode
                ? 'border-red-500/50 hover:border-red-400 hover:bg-red-900/20'
                : 'border-red-300 hover:border-red-400 hover:bg-red-50'
            }`}
          >
            <div className="text-center">
              <Brain className={`w-12 h-12 mx-auto mb-3 ${
                isDarkMode ? 'text-red-400' : 'text-red-600'
              }`} />
              <h3 className={`font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Start Worry Workflow</h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Guided questions to help reframe anxious thoughts
              </p>
            </div>
          </button>

          <button
            onClick={() => setShowBreathingTimer(true)}
            className={`p-6 rounded-xl border-2 border-dashed transition-all duration-200 hover:scale-105 ${
              isDarkMode
                ? 'border-blue-500/50 hover:border-blue-400 hover:bg-blue-900/20'
                : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <div className="text-center">
              <Timer className={`w-12 h-12 mx-auto mb-3 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <h3 className={`font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Breathing Exercise</h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                2-minute guided breathing for immediate relief
              </p>
            </div>
          </button>
        </div>





        {/* Weekly Calendar */}
        <div className="mb-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Weekly Calendar</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentWeekOffset(0)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {getWeeklyWorriesData.map((day) => (
              <button
                key={day.date}
                onClick={() => setSelectedDay(day.date)}
                className={`p-3 rounded-lg text-center transition-colors ${
                  day.date === new Date().toDateString()
                    ? 'bg-blue-500 text-white'
                    : day.hasWorries
                    ? 'bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                }`}
              >
                <div className="text-xs font-medium">{day.dayName}</div>
                <div className="text-lg font-bold">{day.dayNumber}</div>
                {day.hasWorries && (
                  <div className="text-xs mt-1">
                    {day.worries.length} {day.worries.length === 1 ? 'worry' : 'worries'}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Today's Worries */}
        {todaysWorries.length > 0 && (
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Today's Worries</h3>
            
            {todaysWorries.map((worry) => (
              <div
                key={worry.id}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700/80'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{worry.worry}</h4>
                    
                    {worry.reframe && (
                      <div className={`p-3 rounded-lg mt-3 ${
                        isDarkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <Lightbulb className={`w-4 h-4 ${
                            isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`} />
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`}>Reframe</span>
                        </div>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-green-300' : 'text-green-700'
                        }`}>{worry.reframe}</p>
                      </div>
                    )}
                  </div>
                  
                                     <div className="ml-4 flex items-center space-x-2">
                     <button
                       onClick={() => openViewModal(worry)}
                       className={`p-2 rounded-lg transition-colors ${
                         isDarkMode
                           ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                           : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                       }`}
                       title="View details"
                     >
                       <EyeIcon size={16} />
                     </button>
                     <button
                       onClick={() => openEditModal(worry)}
                       className={`p-2 rounded-lg transition-colors ${
                         isDarkMode
                           ? 'text-blue-400 hover:text-blue-200 hover:bg-blue-900/20'
                           : 'text-blue-500 hover:text-blue-700 hover:bg-blue-100'
                       }`}
                       title="Edit worry"
                     >
                       <Edit3 size={16} />
                     </button>
                     <button
                       onClick={() => handleDeleteWorry(worry.id)}
                       className={`p-2 rounded-lg transition-colors ${
                         isDarkMode
                           ? 'text-red-400 hover:text-red-200 hover:bg-red-900/20'
                           : 'text-red-500 hover:text-red-700 hover:bg-red-100'
                       }`}
                       title="Delete worry"
                     >
                       <Trash2 size={16} />
                     </button>
                     {!worry.reframe ? (
                       <button
                         onClick={() => openReframeModal(worry)}
                         className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                           isDarkMode
                             ? 'bg-green-600 hover:bg-green-700 text-white'
                             : 'bg-green-500 hover:bg-green-600 text-white'
                         }`}
                       >
                         Add Reframe
                       </button>
                     ) : (
                       <button
                         onClick={() => openReframeModal(worry)}
                         className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                           isDarkMode
                             ? 'bg-green-600 hover:bg-green-700 text-white'
                             : 'bg-green-500 hover:bg-green-600 text-white'
                         }`}
                       >
                         Edit Reframe
                       </button>
                     )}
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {todaysWorries.length === 0 && (
          <div className="text-center py-12">
            <Brain className={`w-16 h-16 mx-auto mb-4 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-lg font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>No worries today</h3>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              When anxiety strikes, use the worry workflow to help reframe your thoughts
            </p>
          </div>
        )}
      </div>

      {/* Worry Workflow Modal */}
      {showWorryWorkflow && (
        <FullScreenModal
          isOpen={showWorryWorkflow}
          onClose={() => {
            resetWorkflow();
            setShowWorryWorkflow(false);
          }}
          isDarkMode={isDarkMode}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className={`border-b ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-100'
            } border-b p-3 md:p-4 flex-shrink-0`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center ${
                    isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
                  }`}>
                    <Brain className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <h2 className={`text-lg font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Worry Workflow</h2>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Step {workflowStep} of {totalWorkflowSteps}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      resetWorkflow();
                      setShowWorryWorkflow(false);
                    }}
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
                  className="bg-gradient-to-r from-red-500 to-pink-600 h-1 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(workflowStep / totalWorkflowSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col">
              <div className={`flex items-start justify-center transition-all duration-300 min-h-0 py-4 flex-1 ${
                isAnimating ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'
              }`}>
                <div className="w-full max-w-md">
                  {getStepContent()}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8 mb-20 md:mt-auto md:mb-0">
                <button
                  onClick={handleBack}
                  disabled={workflowStep === 1}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                    workflowStep === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ArrowLeft size={20} />
                  <span>Back</span>
                </button>

                {workflowStep < totalWorkflowSteps ? (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                      canProceed()
                        ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                        : isDarkMode 
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Next</span>
                    <ArrowRight size={20} />
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleWorrySubmit}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transform hover:-translate-y-0.5`}
                    >
                      <span>Submit Worry</span>
                      <ArrowRight size={20} />
                    </button>
                    <button
                      onClick={() => {
                        resetWorkflow();
                        setShowWorryWorkflow(false);
                      }}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        isDarkMode
                          ? 'bg-gray-600 hover:bg-gray-700 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </FullScreenModal>
      )}

      {/* Breathing Timer Modal */}
      {showBreathingTimer && (
        <FullScreenModal
          isOpen={showBreathingTimer}
          onClose={stopBreathingExercise}
          isDarkMode={isDarkMode}
        >
          <div className="w-full max-w-md mx-auto p-6 text-center">
            <div className="mb-8">
              <h2 className={`text-2xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Breathing Exercise</h2>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Take deep, calming breaths
              </p>
            </div>

            <div className={`text-6xl font-bold mb-8 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {formatTime(breathingTimeLeft)}
            </div>

            <div className="mb-8">
              <div className={`w-24 h-24 mx-auto rounded-full border-4 flex items-center justify-center ${
                isDarkMode ? 'border-blue-500' : 'border-blue-400'
              }`}>
                <Timer className={`w-12 h-12 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
            </div>

            <div className="space-y-4">
              {!breathingTimerActive ? (
                <button
                  onClick={startBreathingExercise}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Start 2-Minute Timer
                </button>
              ) : (
                <button
                  onClick={stopBreathingExercise}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  Stop Timer
                </button>
              )}

              <button
                onClick={stopBreathingExercise}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-gray-600 hover:bg-gray-700 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </FullScreenModal>
      )}

      {/* Reframe Modal */}
      {showReframeModal && selectedWorry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide rounded-2xl shadow-xl ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            {/* Modal Header */}
            <div className={`p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Add Reframe
                  </h3>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    How do you feel about this worry now with some perspective?
                  </p>
                </div>
                <button
                  onClick={() => setShowReframeModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:bg-gray-700' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'
              }`}>
                <h4 className={`font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Original Worry:</h4>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedWorry.worry}
                </p>
              </div>

            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-700'
              }`}>
                Your Reframe:
              </label>
              <textarea
                value={reframeText}
                onChange={(e) => setReframeText(e.target.value)}
                className={`w-full p-3 rounded-lg border resize-none ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                rows={4}
                placeholder="How has your perspective changed? What did you learn?"
              />
            </div>

            </div>

            {/* Modal Footer */}
            <div className={`p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowReframeModal(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReframeSubmit}
                  disabled={!reframeText.trim()}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    isDarkMode
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  Save Reframe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Worry Modal */}
      {showViewModal && selectedWorry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide rounded-2xl shadow-xl ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            {/* Modal Header */}
            <div className={`p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Worry Details
                  </h3>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Review your worry and responses
                  </p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:bg-gray-700' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* The Worry Card */}
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-red-900/20 border border-red-700/50' : 'bg-red-50 border border-red-200'
              }`}>
                <h4 className={`text-lg font-semibold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>The Worry</h4>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {selectedWorry.worry}
                </p>
              </div>

              {/* Evidence Card */}
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-blue-900/20 border border-blue-700/50' : 'bg-blue-50 border border-blue-200'
              }`}>
                <h4 className={`text-lg font-semibold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Evidence</h4>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {selectedWorry.evidence}
                </p>
              </div>

              {/* Physical Sensations & Thoughts Card */}
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-green-900/20 border border-green-700/50' : 'bg-green-50 border border-green-200'
              }`}>
                <h4 className={`text-lg font-semibold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Physical Sensations & Thoughts</h4>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {selectedWorry.physicalThoughts}
                </p>
              </div>

              {/* Previous Experience Card */}
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-purple-900/20 border border-purple-700/50' : 'bg-purple-50 border border-purple-200'
              }`}>
                <h4 className={`text-lg font-semibold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Previous Experience</h4>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {selectedWorry.previousExperience}
                </p>
              </div>

              {/* Balanced Perspective Card */}
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-yellow-900/20 border border-yellow-700/50' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <h4 className={`text-lg font-semibold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Balanced Perspective</h4>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {selectedWorry.balancedPerspective}
                </p>
              </div>

              {/* Friend Advice Card */}
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-indigo-900/20 border border-indigo-700/50' : 'bg-indigo-50 border border-indigo-200'
              }`}>
                <h4 className={`text-lg font-semibold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Friend Advice</h4>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {selectedWorry.friendAdvice}
                </p>
              </div>

              {/* Self Kindness Card */}
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-pink-900/20 border border-pink-700/50' : 'bg-pink-50 border border-pink-200'
              }`}>
                <h4 className={`text-lg font-semibold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Self Kindness</h4>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {selectedWorry.selfKindness}
                </p>
              </div>

              {/* Reframe Card */}
              {selectedWorry.reframe && (
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-emerald-900/20 border border-emerald-700/50' : 'bg-emerald-50 border border-emerald-200'
                }`}>
                  <h4 className={`text-lg font-semibold mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Reframe</h4>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-emerald-300' : 'text-emerald-700'
                  }`}>
                    {selectedWorry.reframe}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Day Details Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide rounded-2xl shadow-xl ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            {/* Modal Header */}
            <div className={`p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {new Date(selectedDay).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Worries and reflections from this day
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:bg-gray-700' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {appData.dailyData[selectedDay]?.worries && appData.dailyData[selectedDay].worries.length > 0 ? (
                <div className="space-y-4">
                  {appData.dailyData[selectedDay].worries.map((worry) => (
                    <div
                      key={worry.id}
                      className={`p-4 rounded-xl border ${
                        isDarkMode
                          ? 'bg-gray-700/50 border-gray-600'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>{worry.worry}</h4>
                          
                          {worry.reframe && (
                            <div className={`p-3 rounded-lg mt-3 ${
                              isDarkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'
                            }`}>
                              <div className="flex items-center space-x-2 mb-1">
                                <Lightbulb className={`w-4 h-4 ${
                                  isDarkMode ? 'text-green-400' : 'text-green-600'
                                }`} />
                                <span className={`text-sm font-medium ${
                                  isDarkMode ? 'text-green-400' : 'text-green-600'
                                }`}>Reframe</span>
                              </div>
                              <p className={`text-sm ${
                                isDarkMode ? 'text-green-300' : 'text-green-700'
                              }`}>{worry.reframe}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4 flex items-center space-x-2">
                          <button
                            onClick={() => openViewModal(worry)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode
                                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                            title="View details"
                          >
                            <EyeIcon size={16} />
                          </button>
                          <button
                            onClick={() => openEditModal(worry)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode
                                ? 'text-blue-400 hover:text-blue-200 hover:bg-blue-900/20'
                                : 'text-blue-500 hover:text-blue-700 hover:bg-blue-100'
                            }`}
                            title="Edit worry"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteWorry(worry.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode
                                ? 'text-red-400 hover:text-red-200 hover:bg-red-900/20'
                                : 'text-red-500 hover:text-red-700 hover:bg-gray-100'
                            }`}
                            title="Delete worry"
                          >
                            <Trash2 size={16} />
                          </button>
                          {!worry.reframe ? (
                            <button
                              onClick={() => openReframeModal(worry)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                isDarkMode
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              Add Reframe
                            </button>
                          ) : (
                            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                              isDarkMode
                                ? 'bg-green-900/20 text-green-400 border border-green-700'
                                : 'bg-green-50 text-green-700 border border-green-200'
                            }`}>
                              Reframed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No worries recorded for this day</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Worry Modal */}
      {showEditModal && editingWorry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide rounded-2xl shadow-xl ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            {/* Modal Header */}
            <div className={`p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Edit Worry
                  </h3>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Update your worry responses
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:bg-gray-700' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

                        {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-700'
                }`}>The Worry:</label>
                <textarea
                  value={editingWorry.worry}
                  onChange={(e) => setEditingWorry(prev => prev ? { ...prev, worry: e.target.value } : null)}
                  className={`w-full p-3 rounded-lg border resize-none ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  rows={3}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-700'
                }`}>Evidence:</label>
                <textarea
                  value={editingWorry.evidence}
                  onChange={(e) => setEditingWorry(prev => prev ? { ...prev, evidence: e.target.value } : null)}
                  className={`w-full p-3 rounded-lg border resize-none ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  rows={3}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-700'
                }`}>Physical Sensations & Thoughts:</label>
                <textarea
                  value={editingWorry.physicalThoughts}
                  onChange={(e) => setEditingWorry(prev => prev ? { ...prev, physicalThoughts: e.target.value } : null)}
                  className={`w-full p-3 rounded-lg border resize-none ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  rows={3}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-700'
                }`}>Previous Experience:</label>
                <textarea
                  value={editingWorry.previousExperience}
                  onChange={(e) => setEditingWorry(prev => prev ? { ...prev, previousExperience: e.target.value } : null)}
                  className={`w-full p-3 rounded-lg border resize-none ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  rows={3}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-700'
                }`}>Balanced Perspective:</label>
                <textarea
                  value={editingWorry.balancedPerspective}
                  onChange={(e) => setEditingWorry(prev => prev ? { ...prev, balancedPerspective: e.target.value } : null)}
                  className={`w-full p-3 rounded-lg border resize-none ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  rows={3}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-700'
                }`}>Friend Advice:</label>
                <textarea
                  value={editingWorry.friendAdvice}
                  onChange={(e) => setEditingWorry(prev => prev ? { ...prev, friendAdvice: e.target.value } : null)}
                  className={`w-full p-3 rounded-lg border resize-none ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  rows={3}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-700'
                }`}>Self Kindness:</label>
                <textarea
                  value={editingWorry.selfKindness}
                  onChange={(e) => setEditingWorry(prev => prev ? { ...prev, selfKindness: e.target.value } : null)}
                  className={`w-full p-3 rounded-lg border resize-none ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  rows={3}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditWorry}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Dread;
