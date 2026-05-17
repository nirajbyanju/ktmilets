'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

import useAuthStore from '@/stores/auth/AuthStore';
import SetPasswordModal from '@/components/auth/SetPasswordModal';
import type { AuthSessionPayload } from '@/types/auth/LoginTypes';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { setToken, loadUserMenu, markPasswordSet } = useAuthStore();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawError = params.get('error');
    const session  = params.get('session');

    if (rawError) {
      setError('Google sign-in failed. Please try again.');
      return;
    }

    if (!session) {
      setError('No session data received.');
      return;
    }

    try {
      const decoded  = JSON.parse(atob(decodeURIComponent(session))) as AuthSessionPayload & { needs_password?: boolean };
      const token    = decoded.token ?? decoded.access_token ?? '';

      if (!token) {
        setError('Invalid session data received.');
        return;
      }

      // Store the session — setToken handles persisting and hydrating roles/menu
      setToken(token, decoded as Record<string, unknown>);

      // Clean the URL immediately
      window.history.replaceState({}, '', '/auth/google/callback');

      toast.success('Signed in with Google!');

      if (decoded.needs_password) {
        setShowPasswordModal(true);
        return;
      }

      void loadUserMenu().then(() => {
        router.replace('/admin/courses');
      });
    } catch {
      setError('Failed to process Google sign-in. Please try again.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="w-full max-w-sm rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => router.replace('/login')}
            className="mt-4 rounded-lg bg-opsh-primary px-5 py-2 text-sm font-bold text-white hover:bg-opsh-primary-hover"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (showPasswordModal) {
    return (
      <SetPasswordModal
        onSuccess={() => {
          markPasswordSet();
          void loadUserMenu().then(() => router.replace('/admin/courses'));
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <FaSpinner className="animate-spin text-3xl text-opsh-primary" />
        <p className="text-sm font-semibold text-slate-500">Signing you in…</p>
      </div>
    </div>
  );
}
