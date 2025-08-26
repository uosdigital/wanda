import React, { useState } from 'react';
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
  StickyNote,
  LogOut,
  Settings
} from 'lucide-react';
import visionImg from '../../images/vision.jpg';

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
  todaysPoints: number;
  onSignOut: () => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
  timerIsActive?: boolean;
  timerIsBreak?: boolean;
  timerMinutes?: number;
  timerSeconds?: number;
  onToggleTimer?: () => void;
  syncStatus?: 'synced' | 'syncing' | 'error' | 'offline';
  originalFocusMinutes?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  isCollapsed,
  onToggleCollapse,
  totalPoints,
  currentStreak,
  isDarkMode,
  onToggleDarkMode,
  todaysPoints,
  onSignOut,
  isMobileOpen,
  onMobileToggle,
  timerIsActive = false,
  timerIsBreak = false,
  timerMinutes = 25,
  timerSeconds = 0,
  onToggleTimer,
  syncStatus = 'offline',
  originalFocusMinutes = 25
}) => {
  const [showSettings, setShowSettings] = useState(false);
  // Disable page scroll when mobile menu is open
  React.useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);
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
    <>
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 md:hidden ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onMobileToggle}
      />
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full backdrop-blur-sm border-r transition-all duration-500 ease-out z-50 flex flex-col overflow-hidden ${
        isDarkMode 
          ? 'bg-gray-900/90 border-gray-700' 
          : 'bg-white/90 border-gray-200'
      } ${
        // Mobile responsive classes
        'w-full' +
        (isMobileOpen ? ' translate-x-0' : ' -translate-x-full md:translate-x-0') +
        // Desktop width logic - use conditional width instead of base + override
        (isCollapsed ? ' md:w-16' : ' md:w-64')
      }`}>
      {/* Header Section */}
      <div className={`p-4 border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-blue-500/30">
              <img src={visionImg} alt="Twist" className="w-full h-full object-cover" />
            </div>
            {!isCollapsed && (
              <div className="animate-fade-in">
                <h1 className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Twist</h1>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} · {todaysPoints} pts
                </p>
              </div>
            )}
          </div>
          {/* Mobile close button */}
          <button
            onClick={onMobileToggle}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label="Close menu"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Stats Section */}
        {!isCollapsed && (
          <div className="grid grid-cols-2 gap-3 animate-slide-up">
            <div className={`rounded-lg p-3 border ${
              isDarkMode 
                ? 'bg-gradient-to-r from-rose-900/50 to-rose-800/50 border-rose-700' 
                : 'bg-gradient-to-r from-rose-50 to-rose-100 border-rose-200'
            }`}>
              <div className="flex items-center space-x-2 text-rose-600">
                <Flame size={16} />
                <span className="font-bold text-sm">{currentStreak}</span>
              </div>
              <p className={`text-xs mt-1 ${
                isDarkMode ? 'text-rose-300' : 'text-rose-700'
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
      <nav className="px-3 py-4 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isDisabled = item.disabled;

            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onViewChange(item.id);
                    // Close mobile sidebar when item is selected
                    if (window.innerWidth < 768) {
                      onMobileToggle();
                    }
                  }}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 rounded-xl font-medium transition-all duration-300 ease-out transform hover:scale-105 ${
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
                  {/* Timer lozenge for timer item */}
                  {item.id === 'timer' && timerIsActive && !isCollapsed && (
                    <div className="ml-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTimer?.();
                        }}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 ${
                          timerIsBreak
                            ? isDarkMode
                              ? 'bg-green-900/50 text-green-300 hover:bg-green-900/70'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                            : isDarkMode
                              ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-900/70'
                              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                        title={timerIsActive ? 'Click to pause' : 'Click to start'}
                      >
                        {timerMinutes}:{timerSeconds.toString().padStart(2, '0')}
                      </button>
                    </div>
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
          {/* Sync Status */}
          {!isCollapsed && (
            <div className={`rounded-lg p-2 border ${
              syncStatus === 'synced' 
                ? isDarkMode 
                  ? 'bg-green-900/50 border-green-700' 
                  : 'bg-green-50 border-green-200'
                : syncStatus === 'syncing'
                ? isDarkMode 
                  ? 'bg-yellow-900/50 border-yellow-700' 
                  : 'bg-yellow-50 border-yellow-200'
                : syncStatus === 'error'
                ? isDarkMode 
                  ? 'bg-red-900/50 border-red-700' 
                  : 'bg-red-50 border-red-200'
                : isDarkMode 
                  ? 'bg-gray-800/50 border-gray-700' 
                  : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center space-x-2">
                {syncStatus === 'synced' ? (
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                ) : syncStatus === 'syncing' ? (
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                ) : syncStatus === 'error' ? (
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                )}
                <span className={`text-xs font-medium ${
                  syncStatus === 'synced' 
                    ? isDarkMode ? 'text-green-300' : 'text-green-700'
                    : syncStatus === 'syncing'
                    ? isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
                    : syncStatus === 'error'
                    ? isDarkMode ? 'text-red-300' : 'text-red-700'
                    : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {syncStatus === 'synced' ? 'Synced' : 
                   syncStatus === 'syncing' ? 'Syncing...' : 
                   syncStatus === 'error' ? 'Sync Error' : 
                   'Offline'}
                </span>
              </div>
            </div>
          )}

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} ${isCollapsed ? 'px-2' : 'px-3'} py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
              isDarkMode 
                ? 'hover:bg-gray-800 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Settings"
          >
            <Settings size={20} className="transition-all duration-500" />
            {!isCollapsed && (
              <span className="text-sm font-medium">
                Settings
              </span>
            )}
          </button>

          {/* Collapse Button */}
          <button
            onClick={onToggleCollapse}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} ${isCollapsed ? 'px-2' : 'px-3'} py-2 rounded-lg transition-all duration-200 hover:scale-105 hidden md:flex ${
              isDarkMode 
                ? 'hover:bg-gray-800 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={20} className="transition-all duration-500" /> : <ChevronLeft size={20} className="transition-all duration-500" />}
            {!isCollapsed && (
              <span className="text-sm font-medium">
                {isCollapsed ? 'Expand' : 'Collapse'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-xl border transform transition-all duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h2>
            </div>
            <div className="p-5 space-y-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => {
                  onToggleDarkMode();
                  setShowSettings(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-yellow-400' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                <span className="font-medium">
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>

              {/* Sign Out Button */}
              <button
                onClick={() => {
                  onSignOut();
                  setShowSettings(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-red-400' 
                    : 'hover:bg-gray-100 text-red-600'
                }`}
              >
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
            <div className={`px-5 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowSettings(false)}
                className={`w-full px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Sidebar;
