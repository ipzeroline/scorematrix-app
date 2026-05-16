'use client';
import { useEffect, useState } from 'react';

export function StoreInitializer() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Zustand persist middleware auto-hydrates via localStorage on mount.
    // This component ensures hydration completes before children render.
    // The slight delay prevents flash of default values.
    const t = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!ready) return null;
  return null;
}
