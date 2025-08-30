import React from 'react';
import { createPortal } from 'react-dom';
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
import runImg from '../../images/run.jpg';

type Toast = {
  id: string;
  message: string;
  durationMs?: number;
  icon?: string;
};

type ToastContextValue = {
  showToast: (message: string, durationMs?: number, icon?: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

const DEFAULT_DURATION = 3000;

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getIconForReason = (reason: string): string => {
    const lowerReason = reason.toLowerCase();
    
    if (lowerReason.includes('priority') || lowerReason.includes('main task')) return priorityImg;
    if (lowerReason.includes('habit')) return guitarImg;
    if (lowerReason.includes('connect')) return connectImg;
    if (lowerReason.includes('task')) return tasksImg;
    if (lowerReason.includes('focus session') || lowerReason.includes('pomodoro')) return focusImg;
    if (lowerReason.includes('morning') || lowerReason.includes('evening') || lowerReason.includes('check-in') || lowerReason.includes('review')) return visionImg;
    if (lowerReason.includes('water')) return basicsImg;
    if (lowerReason.includes('healthy') || lowerReason.includes('meals')) return healthyImg;
    if (lowerReason.includes('listen')) return listenImg;
    if (lowerReason.includes('mindful')) return mindfulImg;
    if (lowerReason.includes('steps') || lowerReason.includes('10k')) return runImg;
    if (lowerReason.includes('sleep') || lowerReason.includes('7+')) return basicsImg;
    if (lowerReason.includes('worry') || lowerReason.includes('dread')) return mindfulImg;
    if (lowerReason.includes('reframe')) return visionImg;
    
    // Default icon
    return priorityImg;
  };
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = React.useCallback((message: string, durationMs: number = DEFAULT_DURATION, icon?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { id, message, durationMs, icon }]);
    window.setTimeout(() => removeToast(id), durationMs);
  }, [removeToast]);

  const toastContainer = (
    <div className="pointer-events-none" style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
      <div className="space-y-3">
        {toasts.map(t => {
          const parts = t.message.split('—');
          const pointsText = parts[0]?.trim();
          const reasonText = parts[1]?.trim();
          const iconSrc = reasonText ? getIconForReason(reasonText) : priorityImg;

          return (
            <div
              key={t.id}
              className="pointer-events-auto rounded-2xl shadow-xl border px-6 py-5 max-w-md w-full bg-green-50 border-green-200 text-green-900 dark:bg-green-900/30 dark:border-green-800 dark:text-green-100 transition-all duration-300"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-green-500 flex items-center justify-center">
                  <img 
                    src={iconSrc} 
                    alt="Activity" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  {pointsText && (
                    <div className="text-xl font-extrabold leading-6">{pointsText}</div>
                  )}
                  {reasonText && (
                    <div className="text-sm font-normal leading-5 mt-0.5 opacity-90">{reasonText}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(toastContainer, document.body)}
    </ToastContext.Provider>
  );
};

export default ToastProvider;

// Simple keyframes via Tailwind plugin-less approach (optional if you have global CSS)
// You can add this to index.css if you want smoother entry/exit animations.

