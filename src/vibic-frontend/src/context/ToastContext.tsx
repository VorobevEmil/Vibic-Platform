import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'error' | 'success' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const DURATION: Record<ToastType, number> = {
  success: 3500,
  info: 4000,
  error: 6000,
};

const STYLES: Record<ToastType, { border: string; icon: React.FC<{ className?: string }>; iconClass: string; badge: string }> = {
  error: {
    border: 'border-red-400/30',
    icon: AlertCircle,
    iconClass: 'text-red-300',
    badge: 'bg-red-400/10 border-red-300/30 text-red-100',
  },
  success: {
    border: 'border-green-400/30',
    icon: CheckCircle2,
    iconClass: 'text-green-300',
    badge: 'bg-green-400/10 border-green-300/30 text-green-100',
  },
  info: {
    border: 'border-sky-400/30',
    icon: Info,
    iconClass: 'text-sky-300',
    badge: 'bg-sky-400/10 border-sky-300/30 text-sky-100',
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const style = STYLES[toast.type];
  const Icon = style.icon;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));

    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, DURATION[toast.type]);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.type, onRemove]);

  return (
    <div
      className={`w-[340px] overflow-hidden rounded-2xl border ${style.border} bg-[#18191d]/95 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="mt-0.5 shrink-0 rounded-xl border border-white/10 bg-white/8 p-1.5">
          <Icon className={`h-4 w-4 ${style.iconClass}`} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white leading-snug">{toast.title}</p>
          {toast.message && (
            <p className="mt-0.5 text-xs text-gray-400 leading-relaxed">{toast.message}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            setVisible(false);
            setTimeout(() => onRemove(toast.id), 300);
          }}
          className="shrink-0 rounded-full p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      <div
        className={`h-0.5 ${toast.type === 'error' ? 'bg-red-400/50' : toast.type === 'success' ? 'bg-green-400/50' : 'bg-sky-400/50'}`}
        style={{
          animation: `shrink ${DURATION[toast.type]}ms linear forwards`,
        }}
      />
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="pointer-events-none fixed right-5 top-5 z-[200] flex flex-col gap-2">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
