import React from 'react';
import { createPortal } from 'react-dom';

type Toast = {
  id: string;
  message: string;
  durationMs?: number;
};

type ToastContextValue = {
  showToast: (message: string, durationMs?: number) => void;
};

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

const DEFAULT_DURATION = 3000;

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = React.useCallback((message: string, durationMs: number = DEFAULT_DURATION) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { id, message, durationMs }]);
    window.setTimeout(() => removeToast(id), durationMs);
  }, [removeToast]);

  const toastContainer = (
    <div className="pointer-events-none" style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
      <div className="space-y-3">
        {toasts.map(t => {
          const parts = t.message.split('—');
          const pointsText = parts[0]?.trim();
          const reasonText = parts[1]?.trim();

          return (
            <div
              key={t.id}
              className="pointer-events-auto rounded-2xl shadow-xl border px-6 py-5 max-w-md w-full bg-green-50 border-green-200 text-green-900 dark:bg-green-900/30 dark:border-green-800 dark:text-green-100 transition-all duration-300"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
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

