import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, ServerCrash, WifiOff, X } from 'lucide-react';
import {
  SERVER_AVAILABILITY_EVENT,
  ServerAvailabilityDetail,
} from '../../utils/serverAvailability';

export default function ServerAvailabilityToast() {
  const [toastState, setToastState] = useState<ServerAvailabilityDetail>({
    available: true,
  });
  const [dismissedReason, setDismissedReason] = useState<string | null>(null);

  useEffect(() => {
    const handleAvailabilityChanged = (event: Event) => {
      const detail = (event as CustomEvent<ServerAvailabilityDetail>).detail;

      if (detail.available) {
        setToastState({ available: true });
        setDismissedReason(null);
        return;
      }

      setToastState(detail);
    };

    const handleOnline = () => {
      setDismissedReason(null);
    };

    const handleOffline = () => {
      setToastState({
        available: false,
        reason: 'offline',
      });
    };

    window.addEventListener(SERVER_AVAILABILITY_EVENT, handleAvailabilityChanged as EventListener);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener(SERVER_AVAILABILITY_EVENT, handleAvailabilityChanged as EventListener);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const reason = toastState.reason ?? 'server_unreachable';
  const isVisible = !toastState.available && dismissedReason !== reason;

  const content = useMemo(() => {
    if (reason === 'offline') {
      return {
        icon: WifiOff,
        title: 'Нет соединения с интернетом',
        description: 'Проверь сеть. Как только соединение вернётся, Vibic снова начнёт отвечать.',
        badge: 'Offline',
      };
    }

    return {
      icon: ServerCrash,
      title: 'Сервер сейчас недоступен',
      description: 'Мы не смогли достучаться до backend. Попробуй повторить через несколько секунд.',
      badge: 'Server unavailable',
    };
  }, [reason]);

  if (!isVisible) {
    return null;
  }

  const Icon = content.icon;

  return (
    <div className="pointer-events-none fixed right-5 top-5 z-[100]">
      <div className="pointer-events-auto w-[360px] overflow-hidden rounded-2xl border border-amber-400/30 bg-[linear-gradient(135deg,rgba(120,53,15,0.95),rgba(31,41,55,0.96))] p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl border border-white/10 bg-white/10 p-2">
            <Icon className="h-5 w-5 text-amber-200" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                {content.badge}
              </span>
            </div>
            <div className="text-sm font-semibold leading-5">{content.title}</div>
            <div className="mt-1 text-sm text-amber-50/80">
              {content.description}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-xl bg-white/12 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/18"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Повторить
              </button>
              <button
                type="button"
                onClick={() => setDismissedReason(reason)}
                className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/8 hover:text-white"
              >
                Скрыть
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDismissedReason(reason)}
            className="rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Скрыть уведомление"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
