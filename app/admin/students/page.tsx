'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import AdminStudentsView from '@/components/admin/enrollment/AdminStudentsView';
import { canAccessEnrollments, isAdminUser } from '@/data/adminMenu';
import useAuthStore from '@/stores/auth/AuthStore';

export default function AdminStudentsPage() {
  const router = useRouter();
  const roles             = useAuthStore((state) => state.roles);
  const permissions       = useAuthStore((state) => state.permissions);
  const directPermissions = useAuthStore((state) => state.directPermissions);
  const user              = useAuthStore((state) => state.user) as Record<string, unknown> | null;
  const isAdmin = isAdminUser({ roles, permissions, directPermissions });
  const email = typeof user?.email === 'string' ? user.email : '';
  const allowed = isAdmin && canAccessEnrollments(email, roles);

  useEffect(() => {
    if (!allowed) {
      router.replace('/admin/dashboard');
    }
  }, [allowed, router]);

  if (!allowed) return null;

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">Admin Panel</p>
        <h1 className="mt-1 text-2xl font-black text-opsh-primary">Students</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage student enrollments, CRM status, payments, and certificates.
        </p>
      </div>

      <AdminStudentsView />
    </div>
  );
}
