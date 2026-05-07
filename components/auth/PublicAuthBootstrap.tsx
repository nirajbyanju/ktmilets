'use client';

import { useEffect } from 'react';
import useAuthStore from '@/stores/auth/AuthStore';

export default function PublicAuthBootstrap() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    void initializeAuth({ preloadMenu: false });
  }, [initializeAuth]);

  return null;
}
