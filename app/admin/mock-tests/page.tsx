'use client';

import { useEffect, useState } from 'react';

import AdminMockTestsView from '@/components/admin/mock-tests/AdminMockTestsView';
import { isPrivilegedUser } from '@/data/adminMenu';
import { getMyMockTestEnrollments } from '@/apis/mock-test-enrollment.api';
import useAuthStore from '@/stores/auth/AuthStore';
import type { MockTestEnrollment } from '@/types/mock-test-enrollment';

export default function MockTestsPage() {
  const roles       = useAuthStore((state) => state.roles);
  const permissions = useAuthStore((state) => state.permissions) as string[] | undefined;
  const isAdmin     = isPrivilegedUser({ roles, permissions });

  if (isAdmin) {
    return <AdminMockTestsWrapper />;
  }

  return <MyMockTestsView />;
}

function AdminMockTestsWrapper() {
  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">Admin Panel</p>
        <h1 className="mt-1 text-2xl font-black text-opsh-primary">Mock Test Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage subscription plans and student enrollments. Enrolling a student auto-generates an invoice.
        </p>
      </div>
      <AdminMockTestsView />
    </div>
  );
}

function MyMockTestsView() {
  const [enrollments, setEnrollments] = useState<MockTestEnrollment[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    getMyMockTestEnrollments()
      .then((res) => setEnrollments(res.data))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const invoiceStatusMeta = (status: string | undefined) => {
    if (status === 'paid')    return { label: 'Paid',    color: 'green' };
    if (status === 'overdue') return { label: 'Overdue', color: 'red'   };
    return                           { label: 'Unpaid',  color: 'amber' };
  };

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">My Account</p>
        <h1 className="mt-1 text-2xl font-black text-opsh-primary">My Mock Test Enrollments</h1>
        <p className="mt-1 text-sm text-slate-500">Your mock test access details and invoice status.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-slate-400">Loading…</div>
      ) : enrollments.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          No mock test enrollments found. Contact admin to get enrolled.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Plan', 'Type', 'Duration', 'Invoice #', 'Invoice Status', 'Enrolled', 'Start', 'End'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrollments.map((e) => {
                const { label, color } = invoiceStatusMeta(e.invoice?.status);
                const duration = e.subscription
                  ? `${e.subscription.duration ?? '—'} ${e.subscription.duration_type ?? ''}`
                  : '—';
                return (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {e.subscription?.subscriptions_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {e.subscription?.subscriptions_type ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{duration}</td>
                    <td className="px-4 py-3 font-mono text-xs text-opsh-primary">
                      {e.invoice?.invoice_number ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold bg-${color}-100 text-${color}-700`}>
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{fmt(e.enrollment_date)}</td>
                    <td className="px-4 py-3 text-slate-600">{fmt(e.subscription_start)}</td>
                    <td className="px-4 py-3 text-slate-600">{fmt(e.subscription_end)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
