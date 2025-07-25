import React from 'react';

interface ToastProps {
  show: boolean;
  message: string;
  type?: 'success' | 'error';
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ show, message, type = 'success', onClose }) => {
  if (!show) return null;
  return (
    <div 
      className="fixed top-4 right-4 z-[100] transition-all duration-300 ease-in-out transform"
      style={{ animation: 'slideInFromRight 0.3s ease-out' }}
    >
      <div 
        className="flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg max-w-sm min-w-[300px]"
        style={{ backgroundColor: type === 'success' ? '#347474' : '#E76F51', color: '#FFFFFF' }}
      >
        {type === 'success' ? (
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        ) : (
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        )}
        <p className="font-medium flex-1">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors flex-shrink-0"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>
      <style>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast; 