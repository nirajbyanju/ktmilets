'use client';

import useAuthStore from '@/stores/auth/AuthStore';
import { useEffect, useState } from 'react';

export default function AuthDebugger() {
  const [mounted, setMounted] = useState(false);
  const { token, user, isAuthenticated, isLoading } = useAuthStore();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg opacity-75 text-xs z-50 max-w-md overflow-auto">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <p>Mounted: {mounted ? 'Yes' : 'No'}</p>
      <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
      <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      <p>Token: {token ? `${token.substring(0, 20)}...` : 'None'}</p>
      <p>User: {user ? JSON.stringify(user).substring(0, 50) : 'None'}</p>
      <p>LocalStorage Token: {typeof window !== 'undefined' ? localStorage.getItem('authToken')?.substring(0, 20) : 'N/A'}</p>
      <p>LocalStorage Refresh: {typeof window !== 'undefined' ? localStorage.getItem('refreshToken')?.substring(0, 20) : 'N/A'}</p>
    </div>
  );
}