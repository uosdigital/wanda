import React from 'react';
import { Trophy, CheckCircle, Clock, Users, Target, Heart, Brain, Headphones, GlassWater } from 'lucide-react';
import priorityImg from '../../images/priority.jpg';
import tasksImg from '../../images/tasks.jpg';
import connectImg from '../../images/connect.jpg';
import guitarImg from '../../images/guitar.jpg';
import basicsImg from '../../images/basics.jpg';
import focusImg from '../../images/focus.jpg';
import visionImg from '../../images/vision.jpg';
import listenImg from '../../images/listen.jpg';
import mindfulImg from '../../images/mindful.jpg';
import healthyImg from '../../images/healthy.jpg';

interface PointsProps {
  onBack: () => void;
  isDarkMode?: boolean;
}

interface PointItem {
  label: string;
  points: number;
  icon: any;
  image?: string;
}

const Points: React.FC<PointsProps> = ({ onBack, isDarkMode = false }) => {
  const pointItems = [
    { label: 'Complete top priority action', points: 50, icon: 'priority', image: priorityImg },
    { label: 'Complete habit', points: 30, icon: 'habits', image: guitarImg },
    { label: 'Connect with someone', points: 30, icon: 'connect', image: connectImg },
    { label: 'Complete additional task', points: 25, icon: 'tasks', image: tasksImg },
    { label: 'Complete a focus session (25 min)', points: 15, icon: 'focus', image: focusImg },
    { label: 'Complete morning check-in', points: 10, icon: 'vision', image: visionImg },
    { label: 'Complete evening review', points: 10, icon: 'vision', image: visionImg },
    { label: 'Drink enough water', points: 10, icon: 'basics', image: basicsImg },
    { label: 'Eat healthy meals', points: 10, icon: 'healthy', image: healthyImg },
    { label: 'Listen to something interesting', points: 10, icon: 'listen', image: listenImg },
    { label: 'Be mindful', points: 10, icon: 'mindful', image: mindfulImg }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isDarkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'
        }`}>
          <Trophy size={24} className="text-indigo-600" />
        </div>
        <div>
          <h1 className={`text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Points System
          </h1>
          <p className={`text-lg ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            How to earn points and track your progress
          </p>
        </div>
      </div>

            {/* Points Explanation */}
      <div className={`rounded-2xl p-8 shadow-lg border ${
        isDarkMode 
          ? 'bg-gray-800/80 border-gray-700' 
          : 'bg-white/80 border-gray-100'
      }`}>
        <div className="space-y-3">
          {pointItems.map((item, itemIndex) => {
            const IconComponent = typeof item.icon === 'string' ? null : item.icon;
            return (
              <div 
                key={itemIndex}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg overflow-hidden ${
                    isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                  }`}>
                    {IconComponent ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <IconComponent size={16} className="text-gray-600" />
                      </div>
                    ) : (
                      <img 
                        src={item.image} 
                        alt={item.icon} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {item.label}
                  </span>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                  isDarkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'
                }`}>
                  <Trophy size={14} className="text-indigo-600" />
                  <span className={`font-bold text-sm ${
                    isDarkMode ? 'text-indigo-300' : 'text-indigo-700'
                  }`}>
                    +{item.points}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips Section */}
      <div className={`rounded-2xl p-8 shadow-lg border ${
        isDarkMode 
          ? 'bg-gray-800/80 border-gray-700' 
          : 'bg-white/80 border-gray-100'
      }`}>
        <h3 className={`text-xl font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          💡 Tips for Maximizing Points
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className={`flex items-start space-x-3 p-4 rounded-xl ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <h4 className={`font-semibold mb-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Complete Daily Flows
                </h4>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Start with morning check-in and end with evening review for 20 points daily
                </p>
              </div>
            </div>
            <div className={`flex items-start space-x-3 p-4 rounded-xl ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <h4 className={`font-semibold mb-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Focus on Priority Tasks
                </h4>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Complete your main priority for 50 points - the highest single reward
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className={`flex items-start space-x-3 p-4 rounded-xl ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div>
                <h4 className={`font-semibold mb-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Build Consistent Habits
                </h4>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Each habit completed earns 30 points - focus on sustainable routines
                </p>
              </div>
            </div>
            <div className={`flex items-start space-x-3 p-4 rounded-xl ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">4</span>
              </div>
              <div>
                <h4 className={`font-semibold mb-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Don't Forget the Basics
                </h4>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Each basic wellness item (water, meals, etc.) adds 10 points
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Points;
