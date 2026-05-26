'use client';
import { useSyncExternalStore } from 'react';
import { useNotificationStore } from '@/stores/notification-store';
import { Toast } from './Toast';

const emptySubscribe = () => () => {};

export function ToastContainer() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const toasts = useNotificationStore((s) => s.toastQueue);
  const removeToast = useNotificationStore((s) => s.removeToast);

  if (!isMounted || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast {...t} onDismiss={removeToast} />
        </div>
      ))}
    </div>
  );
}
