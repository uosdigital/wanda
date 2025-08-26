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

  // Handle close with animation
  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300); // Match animation duration
  };

  // On complete, close without celebration animation
  useEffect(() => {
    if (isCompleted) {
      handleClose();
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
      
      {/* Completion animation removed */}
      
      {/* Modal Content */}
      <div className="relative w-full h-full flex items-start justify-center p-2 md:p-4 md:items-center">
        <div className={`w-full max-w-5xl h-full max-h-[98vh] md:max-h-[95vh] rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden ${
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-100'
        } border ${isAnimatingOut ? 'animate-modal-exit' : 'animate-slide-up'}`}>
          {/* Content */}
          <div className="h-full overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenModal;
