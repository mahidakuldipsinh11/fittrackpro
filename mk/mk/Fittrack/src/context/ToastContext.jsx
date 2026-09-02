import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3s
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    // Wait for animation to finish before removing from DOM
    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  const success = useCallback((message) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message) => addToast(message, 'error'), [addToast]);
  const info = useCallback((message) => addToast(message, 'info'), [addToast]);
  const warning = useCallback((message) => addToast(message, 'warning'), [addToast]);

  const getIcon = (type) => {
    switch(type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'info': return 'ℹ';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  };

  return (
    <ToastContext.Provider value={{ success, error, info, warning }}>
      {children}
      <div className="toast-container" id="toast-container">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`toast toast--${toast.type} ${toast.exiting ? 'exiting' : ''}`}
            id={`toast-${toast.id}`}
          >
            <div className="toast-icon">{getIcon(toast.type)}</div>
            <div className="toast-message">{toast.message}</div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
