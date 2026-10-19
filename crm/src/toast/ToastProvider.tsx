import { createContext, useCallback, useRef, useState, type ReactNode } from 'react';
import type { ToastItem, ToastType } from '../types';

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4500) => {
    const id = `toast-${idRef.current++}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" id="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type === 'alert' ? 'toast-alert' : t.type === 'sos' ? 'toast-sos' : ''}`}>
            <span style={{ fontSize: '1.1rem' }}>{t.type === 'alert' ? '⚡' : t.type === 'sos' ? '🚨' : '🔔'}</span>
            <div style={{ flex: 1 }}>{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
