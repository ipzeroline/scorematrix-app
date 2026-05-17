'use client';
import { useEffect, useState } from 'react';
import { useNotificationStore } from '@/stores/notification-store';
import { Toast } from './Toast';

export function ToastContainer() {
  const [isMounted, setIsMounted] = useState(false);
  const toasts = useNotificationStore((s) => s.toastQueue);
  const removeToast = useNotificationStore((s) => s.removeToast);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast {...t} onDismiss={removeToast} />
        </div>
      ))}
    </div>
  );
}
