'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useAuthStore from '@/stores/auth/AuthStore';
import AdminLoader from '@/components/loader/Loader';

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      await initializeAuth();
      setIsInitialized(true);
    };

    void init();
  }, [initializeAuth]);

  // Redirect logic based on auth status
  useEffect(() => {
    if (isInitialized && !isLoading) {
      const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
      const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
      
      if (!isAuthenticated && !isPublicPath) {
        router.replace('/login');
      } else if (isAuthenticated && isPublicPath) {
        router.replace('/admin/dashboard');
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, pathname, router]);

  if (!isInitialized || isLoading) {
    return (
      <AdminLoader
        title="Starting Application"
        message="Checking your session and restoring the initial app state."
        hint="You will be redirected automatically when initialization completes."
      />
    );
  }

  return <>{children}</>;
}
