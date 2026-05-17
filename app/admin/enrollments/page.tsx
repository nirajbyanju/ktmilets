'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import AdminEnrollmentsView from '@/components/admin/enrollments/AdminEnrollmentsView';
import { canAccessEnrollments } from '@/data/adminMenu';
import useAuthStore from '@/stores/auth/AuthStore';

export default function EnrollmentsPage() {
  const router  = useRouter();
  const user    = useAuthStore((state) => state.user) as Record<string, unknown> | null;
  const roles   = useAuthStore((state) => state.roles);
  const email   = typeof user?.email === 'string' ? user.email : '';
  const allowed = canAccessEnrollments(email, roles);

  useEffect(() => {
    if (!allowed) router.replace('/admin/invoices');
  }, [allowed, router]);

  if (!allowed) return null;

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">Admin Panel</p>
        <h1 className="mt-1 text-2xl font-black text-opsh-primary">Enrollments</h1>
        <p className="mt-1 text-sm text-slate-500">
          All student enrollments with CRM status, payment tracking, attendance, and teacher assignment.
        </p>
      </div>

      <AdminEnrollmentsView />
    </div>
  );
}
