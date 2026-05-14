'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import AdminExamBookingsView from '@/components/admin/examBooking/AdminExamBookingsView';
import { isAdminUser } from '@/data/adminMenu';
import useAuthStore from '@/stores/auth/AuthStore';

export default function AdminExamBookingsPage() {
  const router = useRouter();
  const roles       = useAuthStore((state) => state.roles);
  const permissions = useAuthStore((state) => state.permissions);
  const directPermissions = useAuthStore((state) => state.directPermissions);
  const isAdmin = isAdminUser({ roles, permissions, directPermissions });

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/admin/exam-booking');
    }
  }, [isAdmin, router]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">Admin Panel</p>
        <h1 className="mt-1 text-2xl font-black text-opsh-primary">Exam Booking Requests</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review all submitted booking requests, update statuses, and download passport copies.
        </p>
      </div>

      <AdminExamBookingsView />
    </div>
  );
}
