"use client";

import { useSyncExternalStore, useMemo } from 'react';

export type StoredUser = { id?: number; name?: string; email?: string; role?: string } | null;

export function useStoredUser(): StoredUser {
  const userStr = useSyncExternalStore<string | null>(
    (onStoreChange) => {
      if (globalThis.window === undefined) return () => {};
      const handler = () => onStoreChange();
      globalThis.window.addEventListener('storage', handler);
      globalThis.window.addEventListener('userchange', handler as EventListener);
      return () => {
        globalThis.window.removeEventListener('storage', handler);
        globalThis.window.removeEventListener('userchange', handler as EventListener);
      };
    },
    () => {
      if (globalThis.window === undefined) return null;
      return globalThis.window.localStorage.getItem('user');
    },
    () => null
  );

  return useMemo(() => {
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as StoredUser;
    } catch {
      return null;
    }
  }, [userStr]);
}
