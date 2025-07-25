import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Toast from './toast';

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error') => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  }, []);

  const hideToast = useCallback(() => setToast(t => ({ ...t, show: false })), []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />
    </ToastContext.Provider>
  );
}; 