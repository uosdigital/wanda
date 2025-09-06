import React from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Heart, 
  BarChart3,
  Flame,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import basicsImg from '../../images/basics.jpg';
import connectImg from '../../images/connect.jpg';
import focusImg from '../../images/focus.jpg';
import guitarImg from '../../images/guitar.jpg';
import healthyImg from '../../images/healthy.jpg';
import listenImg from '../../images/listen.jpg';
import meetingsImg from '../../images/meetings.jpg';
import mindfulImg from '../../images/mindful.jpg';
import monsterImg from '../../images/monster.jpg';
import priorityImg from '../../images/priority.jpg';
import readImg from '../../images/read.jpg';
import runImg from '../../images/run.jpg';
import socialiseImg from '../../images/socialise.jpg';
import tasksImg from '../../images/tasks.jpg';
import visionImg from '../../images/vision.jpg';
import writeImg from '../../images/write.jpg';
import { AppData, DailyData } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface MonthlyTrendsProps {
  appData: AppData;
  isDarkMode: boolean;
}

interface MonthlyInsights {
  month: string;
  year: number;
  avgPoints: number;
  totalDays: number;
  activeDays: number;
  completionRate: number;
  avgSleepQuality: number;
  moodTrend: 'improving' | 'declining' | 'stable';
  topHabits: Array<{ habit: string; completed: number; selected: number; notSelected: number; total: number; completionRate: number }>;
  topBasics: Array<{ basic: string; completed: number; total: number; completionRate: number }>;
  streakData: {
    longestStreak: number;
    currentStreak: number;
    avgStreakLength: number;
  };
  pointsTrend: number; // percentage change from previous month
}

const MonthlyTrends: React.FC<MonthlyTrendsProps> = ({ appData, isDarkMode }) => {
  const [currentMonthOffset, setCurrentMonthOffset] = React.useState(0);
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());

  // Icon mapping for habits and basics using JPG images
  const getHabitImage = (habit: string) => {
    const habitLower = habit.toLowerCase();
    if (habitLower.includes('water') || habitLower.includes('drink')) return basicsImg;
    if (habitLower.includes('exercise') || habitLower.includes('workout') || habitLower.includes('run')) return runImg;
    if (habitLower.includes('read') || habitLower.includes('book')) return readImg;
    if (habitLower.includes('music') || habitLower.includes('listen') || habitLower.includes('guitar')) return listenImg;
    if (habitLower.includes('sleep') || habitLower.includes('rest')) return mindfulImg;
    if (habitLower.includes('eat') || habitLower.includes('food') || habitLower.includes('meal') || habitLower.includes('healthy')) return healthyImg;
    if (habitLower.includes('write') || habitLower.includes('journal')) return writeImg;
    if (habitLower.includes('focus') || habitLower.includes('work')) return focusImg;
    if (habitLower.includes('connect') || habitLower.includes('social')) return connectImg;
    if (habitLower.includes('meeting') || habitLower.includes('call')) return meetingsImg;
    if (habitLower.includes('task') || habitLower.includes('todo')) return tasksImg;
    if (habitLower.includes('priority') || habitLower.includes('important')) return priorityImg;
    if (habitLower.includes('vision') || habitLower.includes('goal')) return visionImg;
    return tasksImg; // default
  };

  const getBasicImage = (basic: string) => {
    const basicLower = basic.toLowerCase();
    if (basicLower.includes('water')) return basicsImg;
    if (basicLower.includes('healthy') || basicLower.includes('eat')) return healthyImg;
    if (basicLower.includes('listen')) return listenImg;
    if (basicLower.includes('mindful')) return mindfulImg;
    if (basicLower.includes('steps') || basicLower.includes('walk')) return runImg;
    if (basicLower.includes('sleep')) return mindfulImg;
    return basicsImg; // default
  };

  // Helper function to get habit display name (matching Dashboard)
  const getHabitDisplayName = (habitId: string): string => {
    const habitLabels: { [key: string]: string } = {
      'guitar': 'Guitar',
      'write': 'Write',
      'read': 'Read',
      'exercise': 'Exercise',
      'socialise': 'Socialise'
    };
    return habitLabels[habitId] || habitId;
  };

  // Helper function to get basic display name (matching Dashboard)
  const getBasicDisplayName = (basicId: string): string => {
    const basicLabels: { [key: string]: string } = {
      'drankWater': 'Drink enough water',
      'ateHealthy': 'Eat healthy meals',
      'listenedToSomething': 'Listen to something interesting',
      'wasMindful': 'Be mindful',
      'steps10k': '10k steps',
      'sleep7h': '7+ hours sleep'
    };
    return basicLabels[basicId] || basicId;
  };

  // Calculate daily points (same logic as WeeklyLog)
  const calculateDailyPoints = (dayData: DailyData) => {
    let points = 0;
    
    // Morning flow completion: 10 points
    if (dayData.sleepQuality && dayData.morningMood && dayData.mainPriority) {
      points += 10;
    }
    
    // Evening flow completion: 10 points
    if (dayData.eveningMood && dayData.dayDescription) {
      points += 10;
    }
    
    // Main priority completion: 50 points
    if (dayData.completedMainTask) {
      points += 50;
    }
    
    // Additional tasks: 25 points each
    if (dayData.completedTasks) {
      points += dayData.completedTasks.filter(Boolean).length * 25;
    }
    
    // People to message: 30 points each
    if (dayData.completedPeople) {
      points += dayData.completedPeople.filter(Boolean).length * 30;
    }
    
    // Habits completion: 30 points each
    if (dayData.completedHabits) {
      points += dayData.completedHabits.length * 30;
    }
    
    // Basics: each 10 points
    if (dayData.basics) {
      const { drankWater, ateHealthy, listenedToSomething, wasMindful, steps10k, sleep7h } = dayData.basics;
      points += (drankWater ? 10 : 0)
        + (ateHealthy ? 10 : 0)
        + (listenedToSomething ? 10 : 0)
        + (wasMindful ? 10 : 0)
        + (steps10k ? 10 : 0)
        + (sleep7h ? 10 : 0);
    }
    
    // Add points from onAddPoints calls
    if (dayData.points) {
      points += dayData.points;
    }
    
    return points;
  };

  // Calculate task points breakdown
  const calculateTaskPoints = (dayData: DailyData) => {
    let priorityPoints = 0;
    let completedTaskCount = 0;
    
    // Main priority task: 50 points (green)
    if (dayData.completedMainTask) priorityPoints += 50;
    
    // Count completed additional tasks
    if (dayData.completedTasks) {
      completedTaskCount = dayData.completedTasks.filter(Boolean).length;
    }
    
    return { priorityPoints, completedTaskCount };
  };

  // Get monthly data for a specific month/year
  const getMonthlyData = (monthOffset: number, year: number) => {
    const targetDate = new Date(year, new Date().getMonth() + monthOffset, 1);
    const month = targetDate.getMonth();
    const yearNum = targetDate.getFullYear();
    
    const monthData: DailyData[] = [];
    const daysInMonth = new Date(yearNum, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(yearNum, month, day);
      const dateStr = date.toDateString(); // Use toDateString() format like the rest of the app
      const dayData = appData.dailyData[dateStr];
      if (dayData) {
        monthData.push(dayData);
      }
    }
    
    return monthData;
  };

  // Calculate monthly insights
  const calculateMonthlyInsights = (monthData: DailyData[], monthOffset: number, year: number): MonthlyInsights => {
    const targetDate = new Date(year, new Date().getMonth() + monthOffset, 1);
    const monthName = targetDate.toLocaleDateString('en-US', { month: 'long' });
    
    if (monthData.length === 0) {
      return {
        month: monthName,
        year,
        avgPoints: 0,
        totalDays: 0,
        activeDays: 0,
        completionRate: 0,
        avgSleepQuality: 0,
        moodTrend: 'stable',
        topHabits: [],
        topBasics: [],
        streakData: { longestStreak: 0, currentStreak: 0, avgStreakLength: 0 },
        pointsTrend: 0
      };
    }

    // Basic metrics
    const totalDays = monthData.length;
    const activeDays = monthData.filter(day => 
      day.sleepQuality || day.morningMood || day.mainPriority || 
      (day.completedTasks && day.completedTasks.some(Boolean)) ||
      (day.completedHabits && day.completedHabits.length > 0)
    ).length;
    
    const completionRate = (activeDays / totalDays) * 100;
    
    // Points analysis
    const dailyPoints = monthData.map(day => calculateDailyPoints(day));
    const avgPoints = dailyPoints.reduce((sum, points) => sum + points, 0) / totalDays;
    
    // Sleep quality analysis
    const sleepQualities = monthData
      .filter(day => day.sleepQuality)
      .map(day => day.sleepQuality!);
    const avgSleepQuality = sleepQualities.length > 0 
      ? sleepQualities.reduce((sum, quality) => sum + quality, 0) / sleepQualities.length 
      : 0;

    // Mood trend analysis
    const morningMoods = monthData
      .filter(day => day.morningMood)
      .map(day => day.morningMood!);
    
    let moodTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (morningMoods.length >= 2) {
      const firstHalf = morningMoods.slice(0, Math.floor(morningMoods.length / 2));
      const secondHalf = morningMoods.slice(Math.floor(morningMoods.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, mood) => {
        const moodScore = getMoodScore(mood);
        return sum + moodScore;
      }, 0) / firstHalf.length;
      
      const secondHalfAvg = secondHalf.reduce((sum, mood) => {
        const moodScore = getMoodScore(mood);
        return sum + moodScore;
      }, 0) / secondHalf.length;
      
      if (secondHalfAvg > firstHalfAvg + 0.5) moodTrend = 'improving';
      else if (secondHalfAvg < firstHalfAvg - 0.5) moodTrend = 'declining';
    }

    // Habits analysis - track completed, selected but failed, and not selected
    const habitStats: Record<string, { completed: number; selected: number; notSelected: number; total: number }> = {};
    
    // Get all habits from app's habits list (not just from daily data)
    const allHabits = new Set<string>();
    
    // Add habits from app's habits list
    if (appData.habits) {
      appData.habits.forEach(habit => allHabits.add(habit));
    }
    
    // Also add any habits that appear in daily data (in case there are habits not in the main list)
    Object.values(appData.dailyData).forEach(day => {
      if (day.habits) {
        day.habits.forEach(habit => allHabits.add(habit));
      }
    });

    // Initialize stats for all habits
    allHabits.forEach(habit => {
      habitStats[habit] = { completed: 0, selected: 0, notSelected: 0, total: 0 };
    });

    // Count occurrences for each day in the month
    monthData.forEach(day => {
      allHabits.forEach(habit => {
        habitStats[habit].total++;
        
        if (day.habits?.includes(habit)) {
          // Habit was selected
          habitStats[habit].selected++;
          if (day.completedHabits?.includes(habit)) {
            // Habit was completed
            habitStats[habit].completed++;
          }
        } else {
          // Habit was not selected
          habitStats[habit].notSelected++;
        }
      });
    });

    const topHabits = Object.entries(habitStats)
      .map(([habit, stats]) => ({
        habit,
        completed: stats.completed,
        selected: stats.selected - stats.completed, // selected but not completed
        notSelected: stats.notSelected,
        total: stats.total,
        completionRate: stats.selected > 0 ? (stats.completed / stats.selected) * 100 : 0
      }))
      .sort((a, b) => {
        // Sort by completion rate first, then by total activity (selected + completed)
        if (b.completionRate !== a.completionRate) {
          return b.completionRate - a.completionRate;
        }
        return (b.selected + b.completed) - (a.selected + a.completed);
      })
      .slice(0, 20); // Show more habits since we're including all of them

    // Basics analysis
    const basicStats: Record<string, { completed: number; total: number }> = {};
    const basicKeys = ['drankWater', 'ateHealthy', 'listenedToSomething', 'wasMindful', 'steps10k', 'sleep7h'];
    
    monthData.forEach(day => {
      if (day.basics) {
        basicKeys.forEach(basic => {
          if (!basicStats[basic]) {
            basicStats[basic] = { completed: 0, total: 0 };
          }
          basicStats[basic].total++;
          if (day.basics![basic as keyof typeof day.basics]) {
            basicStats[basic].completed++;
          }
        });
      }
    });

    const topBasics = Object.entries(basicStats)
      .map(([basic, stats]) => ({
        basic: basic, // Keep the original ID for proper mapping
        completed: stats.completed,
        total: stats.total,
        completionRate: (stats.completed / stats.total) * 100
      }))
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 6);

    // Streak analysis
    const streakData = calculateStreakData(monthData);

    // Points trend (compare with previous month)
    const previousMonthData = getMonthlyData(monthOffset - 1, year);
    const previousMonthPoints = previousMonthData.length > 0 
      ? previousMonthData.reduce((sum, day) => sum + calculateDailyPoints(day), 0) / previousMonthData.length
      : 0;
    
    const pointsTrend = previousMonthPoints > 0 
      ? ((avgPoints - previousMonthPoints) / previousMonthPoints) * 100 
      : 0;

    return {
      month: monthName,
      year,
      avgPoints: Math.round(avgPoints),
      totalDays,
      activeDays,
      completionRate: Math.round(completionRate),
      avgSleepQuality: Math.round(avgSleepQuality * 10) / 10,
      moodTrend,
      topHabits,
      topBasics,
      streakData,
      pointsTrend: Math.round(pointsTrend)
    };
  };

  // Helper function to convert mood to numeric score
  const getMoodScore = (mood: string): number => {
    const positiveWords = ['energized', 'focused', 'motivated', 'excited', 'grateful', 'confident', 'optimistic', 'peaceful', 'refreshed', 'inspired'];
    const negativeWords = ['tired', 'stressed', 'anxious', 'overwhelmed', 'frustrated', 'sad', 'irritable', 'worried', 'exhausted', 'down'];
    
    const moodLower = mood.toLowerCase();
    if (positiveWords.some(word => moodLower.includes(word))) return 3;
    if (negativeWords.some(word => moodLower.includes(word))) return 1;
    return 2; // neutral
  };

  // Calculate streak data
  const calculateStreakData = (monthData: DailyData[]) => {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const streaks: number[] = [];

    monthData.forEach(day => {
      const hasActivity = day.sleepQuality || day.morningMood || day.mainPriority || 
        (day.completedTasks && day.completedTasks.some(Boolean)) ||
        (day.completedHabits && day.completedHabits.length > 0);
      
      if (hasActivity) {
        tempStreak++;
        currentStreak = tempStreak;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (tempStreak > 0) {
          streaks.push(tempStreak);
        }
        tempStreak = 0;
      }
    });

    if (tempStreak > 0) {
      streaks.push(tempStreak);
    }

    const avgStreakLength = streaks.length > 0 
      ? streaks.reduce((sum, streak) => sum + streak, 0) / streaks.length 
      : 0;

    return {
      longestStreak,
      currentStreak,
      avgStreakLength: Math.round(avgStreakLength * 10) / 10
    };
  };


  // Get current month data and insights
  const currentMonthData = getMonthlyData(currentMonthOffset, selectedYear);
  const monthlyInsights = calculateMonthlyInsights(currentMonthData, currentMonthOffset, selectedYear);

  // Navigation functions
  const goToPreviousMonth = () => {
    if (currentMonthOffset > -12) { // Limit to 1 year back
      setCurrentMonthOffset(currentMonthOffset - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonthOffset < 0) { // Don't go into future
      setCurrentMonthOffset(currentMonthOffset + 1);
    }
  };

  const goToCurrentMonth = () => {
    setCurrentMonthOffset(0);
    setSelectedYear(new Date().getFullYear());
  };

  // Chart data for points trend
  const pointsChartData = {
    labels: currentMonthData.map(day => {
      const date = new Date(day.date);
      const dayNum = date.getDate().toString().padStart(2, '0');
      const monthNum = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${dayNum}/${monthNum}`;
    }),
    datasets: [
      {
        label: 'Daily Points',
        data: currentMonthData.map(day => calculateDailyPoints(day)),
        borderColor: isDarkMode ? '#60a5fa' : '#3b82f6',
        backgroundColor: isDarkMode ? '#1e40af20' : '#3b82f620',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const pointsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 0,
    devicePixelRatio: 1,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb',
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        },
      },
      x: {
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb',
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        },
      },
    },
  };

  // Task points breakdown chart data
  const taskPointsChartData = {
    labels: currentMonthData.map(day => {
      const date = new Date(day.date);
      const dayNum = date.getDate().toString().padStart(2, '0');
      const monthNum = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${dayNum}/${monthNum}`;
    }),
    datasets: [
      {
        label: 'Priority Task',
        data: currentMonthData.map(day => calculateTaskPoints(day).priorityPoints),
        backgroundColor: '#22c55e', // Green
        borderColor: '#16a34a',
        borderWidth: 1,
      },
      {
        label: 'Tasks',
        data: currentMonthData.map(day => {
          const taskData = calculateTaskPoints(day);
          return taskData.completedTaskCount >= 1 ? 25 : 0;
        }),
        backgroundColor: '#3b82f6', // Blue
        borderColor: '#2563eb',
        borderWidth: 1,
      },
      {
        label: 'Tasks',
        data: currentMonthData.map(day => {
          const taskData = calculateTaskPoints(day);
          return taskData.completedTaskCount >= 2 ? 25 : 0;
        }),
        backgroundColor: '#3b82f6', // Blue
        borderColor: '#2563eb',
        borderWidth: 1,
      },
      {
        label: 'Tasks',
        data: currentMonthData.map(day => {
          const taskData = calculateTaskPoints(day);
          return taskData.completedTaskCount >= 3 ? 25 : 0;
        }),
        backgroundColor: '#3b82f6', // Blue
        borderColor: '#2563eb',
        borderWidth: 1,
      },
      {
        label: 'Tasks',
        data: currentMonthData.map(day => {
          const taskData = calculateTaskPoints(day);
          return taskData.completedTaskCount >= 4 ? 25 : 0;
        }),
        backgroundColor: '#3b82f6', // Blue
        borderColor: '#2563eb',
        borderWidth: 1,
      },
      {
        label: 'Tasks',
        data: currentMonthData.map(day => {
          const taskData = calculateTaskPoints(day);
          return taskData.completedTaskCount >= 5 ? 25 : 0;
        }),
        backgroundColor: '#3b82f6', // Blue
        borderColor: '#2563eb',
        borderWidth: 1,
      },
      {
        label: 'Tasks',
        data: currentMonthData.map(day => {
          const taskData = calculateTaskPoints(day);
          return taskData.completedTaskCount >= 6 ? 25 : 0;
        }),
        backgroundColor: '#3b82f6', // Blue
        borderColor: '#2563eb',
        borderWidth: 1,
      },
      {
        label: 'Tasks',
        data: currentMonthData.map(day => {
          const taskData = calculateTaskPoints(day);
          return taskData.completedTaskCount >= 7 ? 25 : 0;
        }),
        backgroundColor: '#3b82f6', // Blue
        borderColor: '#2563eb',
        borderWidth: 1,
      },
      {
        label: 'Tasks',
        data: currentMonthData.map(day => {
          const taskData = calculateTaskPoints(day);
          return taskData.completedTaskCount >= 8 ? 25 : 0;
        }),
        backgroundColor: '#3b82f6', // Blue
        borderColor: '#2563eb',
        borderWidth: 1,
      },
    ],
  };

  const taskPointsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 0,
    devicePixelRatio: 1,
    plugins: {
      legend: {
        display: false, // Hide legend completely
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb',
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb',
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        },
      },
    },
  };

  const habitsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'left' as const,
        labels: {
          color: '#ffffff',
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    }
  };

  // Basics completion chart
  const basicsChartData = {
    labels: monthlyInsights.topBasics.map(b => getBasicDisplayName(b.basic)),
    datasets: [
      {
        data: monthlyInsights.topBasics.map(b => b.completed),
        backgroundColor: [
          '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'
        ],
        borderWidth: 0,
      },
    ],
  };

  const basicsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'left' as const,
        labels: {
          color: '#ffffff',
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    }
  };

  // Habits completion chart
  const habitsChartData = {
    labels: monthlyInsights.topHabits.map(h => getHabitDisplayName(h.habit)),
    datasets: [
      {
        data: monthlyInsights.topHabits.map(h => h.completed),
        backgroundColor: [
          '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="w-full p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
        isDarkMode
          ? 'bg-gray-800/80 border-gray-700'
          : 'bg-white/80 border-gray-100'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-blue-500/30">
              <BarChart3 className="w-full h-full text-blue-500 p-2" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Monthly Insights
              </h1>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Deep dive into your monthly patterns and progress
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousMonth}
              disabled={currentMonthOffset <= -12}
              className={`p-2 rounded-lg transition-colors ${
                currentMonthOffset <= -12
                  ? 'text-gray-400 cursor-not-allowed'
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ←
            </button>
            
            <div className="text-center min-w-[200px]">
              <h2 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {monthlyInsights.month} {monthlyInsights.year}
              </h2>
            </div>
            
            <button
              onClick={goToNextMonth}
              disabled={currentMonthOffset >= 0}
              className={`p-2 rounded-lg transition-colors ${
                currentMonthOffset >= 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              →
            </button>
            
            <button
              onClick={goToCurrentMonth}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode
                  ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-900/70'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Points */}
        <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
          isDarkMode
            ? 'bg-gray-800/80 border-gray-700'
            : 'bg-white/80 border-gray-100'
        }`} style={{animationDelay: '0.1s'}}>
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'
            }`}>
              <Target className={`w-5 h-5 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-600'
              }`} />
            </div>
            <div className={`flex items-center text-sm ${
              monthlyInsights.pointsTrend > 0 ? 'text-green-500' : 
              monthlyInsights.pointsTrend < 0 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {monthlyInsights.pointsTrend > 0 ? <ArrowUp className="w-4 h-4" /> :
               monthlyInsights.pointsTrend < 0 ? <ArrowDown className="w-4 h-4" /> :
               <Minus className="w-4 h-4" />}
              <span className="ml-1">{Math.abs(monthlyInsights.pointsTrend)}%</span>
            </div>
          </div>
          <h3 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {monthlyInsights.avgPoints}
          </h3>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Avg Points/Day
          </p>
        </div>

        {/* Completion Rate */}
        <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
          isDarkMode
            ? 'bg-gray-800/80 border-gray-700'
            : 'bg-white/80 border-gray-100'
          }`} style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-green-900/50' : 'bg-green-100'
            }`}>
              <TrendingUp className={`w-5 h-5 ${
                isDarkMode ? 'text-green-300' : 'text-green-600'
              }`} />
            </div>
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {monthlyInsights.activeDays}/{monthlyInsights.totalDays} days
            </span>
          </div>
          <h3 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {monthlyInsights.completionRate}%
          </h3>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Completion Rate
          </p>
        </div>

        {/* Sleep Quality */}
        <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
          isDarkMode
            ? 'bg-gray-800/80 border-gray-700'
            : 'bg-white/80 border-gray-100'
          }`} style={{animationDelay: '0.3s'}}>
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-purple-900/50' : 'bg-purple-100'
            }`}>
              <Heart className={`w-5 h-5 ${
                isDarkMode ? 'text-purple-300' : 'text-purple-600'
              }`} />
            </div>
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {monthlyInsights.moodTrend}
            </span>
          </div>
          <h3 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {monthlyInsights.avgSleepQuality}
          </h3>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Avg Sleep Quality
          </p>
        </div>

        {/* Longest Streak */}
        <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
          isDarkMode
            ? 'bg-gray-800/80 border-gray-700'
            : 'bg-white/80 border-gray-100'
          }`} style={{animationDelay: '0.4s'}}>
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-orange-900/50' : 'bg-orange-100'
            }`}>
              <Flame className={`w-5 h-5 ${
                isDarkMode ? 'text-orange-300' : 'text-orange-600'
              }`} />
            </div>
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Current: {monthlyInsights.streakData.currentStreak}
            </span>
          </div>
          <h3 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {monthlyInsights.streakData.longestStreak}
          </h3>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Longest Streak
          </p>
        </div>
      </div>

      {/* Daily Points Chart - Full Width */}
      <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
        isDarkMode
          ? 'bg-gray-800/80 border-gray-700'
          : 'bg-white/80 border-gray-100'
      }`} style={{animationDelay: '0.5s'}}>
        <h3 className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Daily Points Trend
        </h3>
        <div className="h-64 w-full">
          <div className="w-full h-full">
            <Line data={pointsChartData} options={pointsChartOptions} />
          </div>
        </div>
      </div>

      {/* Task Points Breakdown Chart */}
      <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
        isDarkMode
          ? 'bg-gray-800/80 border-gray-700'
          : 'bg-white/80 border-gray-100'
      }`} style={{animationDelay: '0.6s'}}>
        <h3 className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Task Points Breakdown
        </h3>
        <div className="h-64 w-full">
          <div className="w-full h-full">
            <Bar data={taskPointsChartData} options={taskPointsChartOptions} />
          </div>
        </div>
      </div>

      {/* Habits Row - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Habits Performance Chart */}
        <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
          isDarkMode
            ? 'bg-gray-800/80 border-gray-700'
            : 'bg-white/80 border-gray-100'
        }`} style={{animationDelay: '0.6s'}}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Top Habits Performance
          </h3>
          <div className="h-80">
            <Doughnut data={habitsChartData} options={habitsChartOptions} />
          </div>
        </div>

        {/* Habits Performance Table */}
        <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
          isDarkMode
            ? 'bg-gray-800/80 border-gray-700'
            : 'bg-white/80 border-gray-100'
        }`} style={{animationDelay: '0.7s'}}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <Target className="w-5 h-5" />
            <span>Habits Performance</span>
          </h3>
          <div className="space-y-3">
            {monthlyInsights.topHabits.length > 0 ? (
              monthlyInsights.topHabits.map((habit, index) => {
                const habitImage = getHabitImage(habit.habit);
                return (
                  <div key={index} className={`p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-lg overflow-hidden ring-2 ring-blue-500/30">
                          <img 
                            src={habitImage} 
                            alt={habit.habit}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className={`font-medium text-sm ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {getHabitDisplayName(habit.habit)}
                        </span>
                      </div>
                      
                      {/* Compact three-state breakdown */}
                      <div className="flex items-center space-x-3">
                        <div className="text-center">
                          <div className={`text-sm font-bold text-green-500`}>
                            {habit.completed}
                          </div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            ✓
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`text-sm font-bold text-orange-500`}>
                            {habit.selected}
                          </div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            ✗
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`text-sm font-bold text-gray-500`}>
                            {habit.notSelected}
                          </div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            —
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={`p-4 rounded-lg text-center ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  No habits tracked this month
                </p>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Basics Row - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Basics Performance Chart */}
        <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
          isDarkMode
            ? 'bg-gray-800/80 border-gray-700'
            : 'bg-white/80 border-gray-100'
        }`} style={{animationDelay: '0.8s'}}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Top Basics Performance
          </h3>
          <div className="h-80">
            <Doughnut data={basicsChartData} options={basicsChartOptions} />
          </div>
        </div>

        {/* Basics Performance Table */}
        <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border animate-slide-up ${
          isDarkMode
            ? 'bg-gray-800/80 border-gray-700'
            : 'bg-white/80 border-gray-100'
        }`} style={{animationDelay: '0.9s'}}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <Heart className="w-5 h-5" />
            <span>Basics Performance</span>
          </h3>
          <div className="space-y-3">
            {monthlyInsights.topBasics.length > 0 ? (
              monthlyInsights.topBasics.map((basic, index) => {
                const basicImage = getBasicImage(basic.basic);
                return (
                  <div key={index} className={`p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-lg overflow-hidden ring-2 ring-purple-500/30">
                          <img 
                            src={basicImage} 
                            alt={basic.basic}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className={`font-medium text-sm ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {getBasicDisplayName(basic.basic)}
                        </span>
                      </div>
                      
                      {/* Compact two-state breakdown */}
                      <div className="flex items-center space-x-3">
                        <div className="text-center">
                          <div className={`text-sm font-bold text-green-500`}>
                            {basic.completed}
                          </div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            ✓
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`text-sm font-bold text-gray-500`}>
                            {basic.total - basic.completed}
                          </div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            —
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={`p-4 rounded-lg text-center ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  No basics tracked this month
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTrends;
