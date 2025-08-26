import React from 'react';
import { 
  BarChart3, 
  Home, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Trophy,
  Sun,
  Moon,
  Target,
  Calendar,
  Goal,
  StickyNote
} from 'lucide-react';

type View = 'dashboard' | 'morning' | 'evening' | 'weekly' | 'timer' | 'habits' | 'timeblocking' | 'points' | 'notes';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  totalPoints: number;
  currentStreak: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  isCollapsed,
  onToggleCollapse,
  totalPoints,
  currentStreak,
  isDarkMode,
  onToggleDarkMode
}) => {
  const menuItems = [
    {
      id: 'dashboard' as View,
      label: 'Dashboard',
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      hoverColor: 'hover:bg-blue-50'
    },
    {
      id: 'weekly' as View,
      label: 'Trends',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      hoverColor: 'hover:bg-green-50'
    },
    {
      id: 'habits' as View,
      label: 'Habits',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      hoverColor: 'hover:bg-orange-50'
    },
    {
      id: 'timeblocking' as View,
      label: 'Timeblock',
      icon: Calendar,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      hoverColor: 'hover:bg-teal-50'
    },
    {
      id: 'timer' as View,
      label: 'Timer',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      hoverColor: 'hover:bg-purple-50'
    },
    {
      id: 'points' as View,
      label: 'Points',
      icon: Goal,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      hoverColor: 'hover:bg-indigo-50'
    },
    {
      id: 'notes' as View,
      label: 'Notes',
      icon: StickyNote,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      hoverColor: 'hover:bg-yellow-50'
    }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full backdrop-blur-sm border-r transition-all duration-500 ease-out z-50 flex flex-col ${
      isCollapsed ? 'w-16' : 'w-64'
    } ${
      isDarkMode 
        ? 'bg-gray-900/90 border-gray-700' 
        : 'bg-white/90 border-gray-200'
    }`}>
      {/* Header Section */}
      <div className={`p-4 border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center transform hover:scale-105 transition-transform duration-200">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            {!isCollapsed && (
              <div className="animate-fade-in">
                <h1 className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Twist</h1>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>{totalPoints} points · Day {currentStreak}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        {!isCollapsed && (
          <div className="grid grid-cols-2 gap-3 animate-slide-up">
            <div className={`rounded-lg p-3 border ${
              isDarkMode 
                ? 'bg-gradient-to-r from-orange-900/50 to-orange-800/50 border-orange-700' 
                : 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'
            }`}>
              <div className="flex items-center space-x-2 text-orange-600">
                <Flame size={16} />
                <span className="font-bold text-sm">{currentStreak}</span>
              </div>
              <p className={`text-xs mt-1 ${
                isDarkMode ? 'text-orange-300' : 'text-orange-700'
              }`}>Day streak</p>
            </div>
            <div className={`rounded-lg p-3 border ${
              isDarkMode 
                ? 'bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-blue-700' 
                : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
            }`}>
              <div className="flex items-center space-x-2 text-blue-600">
                <Trophy size={16} />
                <span className="font-bold text-sm">{totalPoints}</span>
              </div>
              <p className={`text-xs mt-1 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>Total points</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="px-3 py-4 flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isDisabled = item.disabled;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl font-medium transition-all duration-300 ease-out transform hover:scale-105 ${
                    isActive
                      ? `${item.bgColor} ${item.color} shadow-md`
                      : `${isDarkMode ? 'text-gray-300' : 'text-gray-600'} ${
                          isDarkMode ? 'hover:bg-gray-800' : item.hoverColor
                        } hover:${item.color} hover:shadow-sm`
                  }`}
                >
                  <Icon size={20} className="transition-transform duration-200" />
                  {!isCollapsed && (
                    <span className="truncate transition-all duration-200">
                      {item.label}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Controls */}
      <div className={`p-4 border-t ${
        isDarkMode ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <div className="space-y-3">
          <button
            onClick={onToggleDarkMode}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
              isDarkMode 
                ? 'hover:bg-gray-800 text-yellow-400' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            {!isCollapsed && (
              <span className="text-sm font-medium">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>
          <button
            onClick={onToggleCollapse}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
              isDarkMode 
                ? 'hover:bg-gray-800 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!isCollapsed && (
              <span className="text-sm font-medium">
                {isCollapsed ? 'Expand' : 'Collapse'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
