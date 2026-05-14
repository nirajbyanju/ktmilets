'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import AdminContactMessagesView from '@/components/admin/contact/AdminContactMessagesView';
import { isAdminUser } from '@/data/adminMenu';
import useAuthStore from '@/stores/auth/AuthStore';

export default function AdminContactMessagesPage() {
  const router = useRouter();
  const roles            = useAuthStore((state) => state.roles);
  const permissions      = useAuthStore((state) => state.permissions);
  const directPermissions = useAuthStore((state) => state.directPermissions);
  const isAdmin = isAdminUser({ roles, permissions, directPermissions });

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/admin/dashboard');
    }
  }, [isAdmin, router]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">Admin Panel</p>
        <h1 className="mt-1 text-2xl font-black text-opsh-primary">Contact Messages</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review messages submitted via the public contact form and manage follow-up status.
        </p>
      </div>

      <AdminContactMessagesView />
    </div>
  );
}
