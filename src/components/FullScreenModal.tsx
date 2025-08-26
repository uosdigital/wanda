import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  isCompleted?: boolean;
  isDarkMode?: boolean;
}

const FullScreenModal: React.FC<FullScreenModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  isCompleted = false,
  isDarkMode = false
}) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);

  // Handle close with animation
  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300); // Match animation duration
  };

  // Handle completion animation
  useEffect(() => {
    if (isCompleted) {
      setShowCompletionAnimation(true);
      setTimeout(() => {
        setShowCompletionAnimation(false);
        handleClose();
      }, 1500);
    }
  }, [isCompleted]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${
      isAnimatingOut ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity duration-300 ${
          isAnimatingOut ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      {/* Completion Animation Overlay */}
      {showCompletionAnimation && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-confetti`}
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              />
            ))}
            {[...Array(15)].map((_, i) => (
              <div
                key={`star-${i}`}
                className={`absolute text-yellow-300 animate-confetti`}
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1.5 + Math.random()}s`
                }}
              >
                ⭐
              </div>
            ))}
          </div>
          
          <div className="text-center animate-celebration">
            <div className="text-8xl mb-4 animate-bounce">🎉</div>
            <div className="text-4xl font-bold text-white mb-2 animate-pulse">Great job!</div>
            <div className="text-xl text-white/90">You've completed your flow</div>
            <div className="text-2xl text-yellow-300 mt-4 animate-pulse">+5 points earned!</div>
          </div>
        </div>
      )}
      
      {/* Modal Content */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div className={`w-full max-w-5xl h-full max-h-[95vh] rounded-3xl shadow-2xl overflow-hidden ${
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-100'
        } border ${
          isAnimatingOut 
            ? 'animate-modal-exit' 
            : showCompletionAnimation
            ? 'scale-105 rotate-1'
            : 'animate-slide-up'
        }`}>
          {/* Content */}
          <div className="h-full overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenModal;
