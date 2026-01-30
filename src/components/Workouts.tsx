import React, { useState, useMemo } from 'react';
import { Plus, X, Activity, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { AppData, DailyData, WorkoutEntry } from '../types';

interface WorkoutsProps {
  appData: AppData;
  todaysData: DailyData;
  onUpdateData: (data: Partial<DailyData>) => void;
  isDarkMode: boolean;
}

const Workouts: React.FC<WorkoutsProps> = ({
  appData,
  todaysData,
  onUpdateData,
  isDarkMode
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<{
    date: Date;
    dateStr: string;
    data: DailyData;
    dayName: string;
    dayNumber: number;
  } | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  
  const [formData, setFormData] = useState({
    activity: '',
    duration: '',
    details: '',
    feeling: '',
    notes: '',
    score: ''
  });

  const todaysWorkouts = todaysData.workouts || [];

  // Get weekly workouts data
  const getWeeklyWorkoutsData = useMemo(() => {
    const days = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (6 - currentWeekOffset * 7));
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + (6 - i));
      const dateStr = date.toDateString();
      const dayData = appData.dailyData[dateStr] || {};
      
      days.push({
        date: date,
        dateStr: dateStr,
        data: dayData,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate()
      });
    }
    return days;
  }, [appData.dailyData, currentWeekOffset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingWorkoutId) {
      // Update existing workout
      const existingWorkout = todaysWorkouts.find(w => w.id === editingWorkoutId);
      const updatedWorkout: WorkoutEntry = {
        ...existingWorkout!,
        activity: formData.activity,
        duration: formData.duration,
        details: formData.details,
        feeling: formData.feeling,
        notes: formData.notes || undefined,
        score: parseInt(formData.score) || 0
      };

      const updatedWorkouts = todaysWorkouts.map(w => 
        w.id === editingWorkoutId ? updatedWorkout : w
      );
      onUpdateData({ workouts: updatedWorkouts });
    } else {
      // Create new workout
      const workout: WorkoutEntry = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        activity: formData.activity,
        duration: formData.duration,
        details: formData.details,
        feeling: formData.feeling,
        notes: formData.notes || undefined,
        score: parseInt(formData.score) || 0
      };

      const updatedWorkouts = [...todaysWorkouts, workout];
      onUpdateData({ workouts: updatedWorkouts });
    }
    
    // Reset form and close modal
    setFormData({
      activity: '',
      duration: '',
      details: '',
      feeling: '',
      notes: '',
      score: ''
    });
    setEditingWorkoutId(null);
    setShowLogModal(false);
  };

  const handleEdit = (workout: WorkoutEntry) => {
    setFormData({
      activity: workout.activity,
      duration: workout.duration,
      details: workout.details || '',
      feeling: workout.feeling || '',
      notes: workout.notes || '',
      score: workout.score.toString()
    });
    setEditingWorkoutId(workout.id);
    setShowLogModal(true);
  };

  const handleDelete = (workoutId: string) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      const updatedWorkouts = todaysWorkouts.filter(w => w.id !== workoutId);
      onUpdateData({ workouts: updatedWorkouts });
    }
  };

  const handleOpenLogModal = () => {
    setEditingWorkoutId(null);
    setFormData({
      activity: '',
      duration: '',
      details: '',
      feeling: '',
      notes: '',
      score: ''
    });
    setShowLogModal(true);
  };

  const handleCloseLogModal = () => {
    setShowLogModal(false);
    setEditingWorkoutId(null);
    setFormData({
      activity: '',
      duration: '',
      details: '',
      feeling: '',
      notes: '',
      score: ''
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDayClick = (day: typeof getWeeklyWorkoutsData[0]) => {
    setSelectedDay(day);
    setShowDayModal(true);
  };

  return (
    <div className="w-full p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
          isDarkMode 
            ? 'bg-gray-800/80 border-gray-700' 
            : 'bg-white/80 border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-2xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Workouts
              </h1>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Track your workouts and exercise sessions
              </p>
            </div>
            <button
              onClick={handleOpenLogModal}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Plus size={20} />
              <span>Log workout</span>
            </button>
          </div>
        </div>

        {/* Today's Workouts List */}
        {todaysWorkouts.length > 0 && (
          <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
            isDarkMode 
              ? 'bg-gray-800/80 border-gray-700' 
              : 'bg-white/80 border-gray-100'
          }`}>
            <h2 className={`text-lg font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Today's Workouts
            </h2>
            <div className="space-y-4">
              {todaysWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className={`rounded-xl p-4 border ${
                    isDarkMode
                      ? 'bg-gray-700/50 border-gray-600'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-1 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {workout.activity}
                      </h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Duration: {workout.duration}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        workout.score >= 8
                          ? isDarkMode ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700'
                          : workout.score >= 6
                          ? isDarkMode ? 'bg-yellow-900/40 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                          : isDarkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700'
                      }`}>
                        {workout.score}/10
                      </div>
                      <button
                        onClick={() => handleEdit(workout)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                            : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'
                        }`}
                        title="Edit workout"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(workout.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                            : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
                        }`}
                        title="Delete workout"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {workout.details && (
                    <div className="mb-3">
                      <p className={`text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Details:
                      </p>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {workout.details}
                      </p>
                    </div>
                  )}
                  
                  {workout.feeling && (
                    <div className="mb-3">
                      <p className={`text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        How it felt:
                      </p>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {workout.feeling}
                      </p>
                    </div>
                  )}

                  {workout.notes && (
                    <div>
                      <p className={`text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Notes/Feedback:
                      </p>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {workout.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Overview */}
        <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
          isDarkMode 
            ? 'bg-gray-800/80 border-gray-700' 
            : 'bg-white/80 border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Weekly Overview
            </h2>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Week Grid */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {getWeeklyWorkoutsData.map((day) => {
              const workouts = day.data.workouts || [];
              const workoutCount = workouts.length;
              const hasWorkouts = workoutCount > 0;
              
              return (
                <div
                  key={day.dateStr}
                  className={`text-center p-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                    selectedDay?.dateStr === day.dateStr
                      ? isDarkMode 
                        ? 'bg-blue-900/50 border border-blue-700' 
                        : 'bg-blue-50 border border-blue-200'
                      : hasWorkouts
                        ? isDarkMode
                          ? 'bg-cyan-900/30 border border-cyan-700 hover:bg-cyan-900/40'
                          : 'bg-cyan-100 border border-cyan-300 hover:bg-cyan-200'
                        : isDarkMode 
                          ? 'bg-gray-700 border border-gray-600 hover:bg-gray-600' 
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {day.dayName}
                  </div>
                  <div className={`text-lg font-bold ${
                    hasWorkouts
                      ? 'text-cyan-700'
                      : isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {day.dayNumber}
                  </div>
                  <div className={`text-xs ${
                    hasWorkouts
                      ? 'text-cyan-600'
                      : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {hasWorkouts ? `${workoutCount} ${workoutCount === 1 ? 'workout' : 'workouts'}` : '0 workouts'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Log Workout Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-2xl shadow-xl border animate-slide-up max-h-[90vh] overflow-y-auto ${
            isDarkMode
              ? 'bg-gray-900 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b sticky top-0 ${
              isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {editingWorkoutId ? 'Edit Workout' : 'Log Workout'}
              </h2>
              <button
                onClick={handleCloseLogModal}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* What did you do? */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  What did you do?
                </label>
                <input
                  type="text"
                  value={formData.activity}
                  onChange={(e) => handleInputChange('activity', e.target.value)}
                  placeholder="e.g., Running, Weightlifting, Yoga..."
                  className={`w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  required
                />
              </div>

              {/* How long did you do it for? */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  How long did you do it for?
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g., 30 minutes, 1 hour, 45 mins..."
                  className={`w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  required
                />
              </div>

              {/* Details on your workout */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Details on your workout
                </label>
                <textarea
                  value={formData.details}
                  onChange={(e) => handleInputChange('details', e.target.value)}
                  placeholder="Describe your workout in detail..."
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              {/* How did it feel? */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  How did it feel?
                </label>
                <textarea
                  value={formData.feeling}
                  onChange={(e) => handleInputChange('feeling', e.target.value)}
                  placeholder="Describe how the workout felt..."
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              {/* Notes/Feedback */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Notes/Feedback
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional notes or feedback..."
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              {/* How would you score it out of 10? */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  How would you score it out of 10?
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.score}
                  onChange={(e) => handleInputChange('score', e.target.value)}
                  placeholder="0-10"
                  className={`w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseLogModal}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {editingWorkoutId ? 'Update Workout' : 'Log Workout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Day Workouts Modal */}
      {showDayModal && selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-2xl rounded-2xl shadow-xl border animate-slide-up max-h-[90vh] overflow-y-auto ${
            isDarkMode
              ? 'bg-gray-900 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b sticky top-0 ${
              isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div>
                <h2 className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {selectedDay.date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h2>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {selectedDay.data.workouts?.length || 0} {selectedDay.data.workouts?.length === 1 ? 'workout' : 'workouts'} logged
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDayModal(false);
                  setSelectedDay(null);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Workouts List */}
            <div className="p-6 space-y-4">
              {selectedDay.data.workouts && selectedDay.data.workouts.length > 0 ? (
                selectedDay.data.workouts.map((workout) => (
                  <div
                    key={workout.id}
                    className={`rounded-xl p-5 border ${
                      isDarkMode
                        ? 'bg-gray-800/50 border-gray-700'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-1 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {workout.activity}
                        </h3>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Duration: {workout.duration}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          workout.score >= 8
                            ? isDarkMode ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700'
                            : workout.score >= 6
                            ? isDarkMode ? 'bg-yellow-900/40 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                            : isDarkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700'
                        }`}>
                          {workout.score}/10
                        </div>
                        {selectedDay?.dateStr === new Date().toDateString() && (
                          <>
                            <button
                              onClick={() => handleEdit(workout)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDarkMode
                                  ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                                  : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'
                              }`}
                              title="Edit workout"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(workout.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDarkMode
                                  ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                                  : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
                              }`}
                              title="Delete workout"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {workout.details && (
                      <div className="mb-3">
                        <p className={`text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Details:
                        </p>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {workout.details}
                        </p>
                      </div>
                    )}
                    
                    {workout.feeling && (
                      <div className="mb-3">
                        <p className={`text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          How it felt:
                        </p>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {workout.feeling}
                        </p>
                      </div>
                    )}

                    {workout.notes && (
                      <div>
                        <p className={`text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Notes/Feedback:
                        </p>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {workout.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className={`text-center py-12 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Activity size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No workouts logged for this day</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workouts;
