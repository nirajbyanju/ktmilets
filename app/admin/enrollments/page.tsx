'use client';

import { useEffect, useState } from 'react';

import AdminEnrollmentsView from '@/components/admin/enrollments/AdminEnrollmentsView';
import { canAccessEnrollments } from '@/data/adminMenu';
import { getMyEnrollments } from '@/apis/enrollment.api';
import useAuthStore from '@/stores/auth/AuthStore';
import { type AdminEnrollment, getCrmStatusMeta, getEnrollmentPaymentMeta } from '@/types/enrollment';

export default function EnrollmentsPage() {
  const user    = useAuthStore((state) => state.user) as Record<string, unknown> | null;
  const roles   = useAuthStore((state) => state.roles);
  const email   = typeof user?.email === 'string' ? user.email : '';
  const allowed = canAccessEnrollments(email, roles);

  if (allowed) {
    return <AdminEnrollmentsViewWrapper />;
  }

  return <MyEnrollmentsView />;
}

function AdminEnrollmentsViewWrapper() {
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

function MyEnrollmentsView() {
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyEnrollments()
      .then((res) => setEnrollments(res.data))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">My Account</p>
        <h1 className="mt-1 text-2xl font-black text-opsh-primary">My Enrollments</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your course enrollments and payment status.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-slate-400">Loading…</div>
      ) : enrollments.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          No enrollments found. Contact admin to get enrolled in a course.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Course / Batch', 'Enrolled On', 'Payment', 'Status', 'Invoice'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrollments.map((e) => {
                const crmMeta = getCrmStatusMeta(e.crm_status);
                const payMeta = getEnrollmentPaymentMeta(e.payment_status);
                const courseName = e.batch?.course?.course_name ?? '—';
                const batchType  = e.batch?.batch_type ?? '';
                const classTime  = e.batch?.class_time ?? '';
                return (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-bold text-opsh-primary">{courseName}</p>
                      {(batchType || classTime) && (
                        <p className="text-xs text-slate-400">{[batchType, classTime].filter(Boolean).join(' · ')}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {e.enrollment_date ? new Date(e.enrollment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold bg-${payMeta.color}-100 text-${payMeta.color}-700`}>
                        {payMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold bg-${crmMeta.color}-100 text-${crmMeta.color}-700`}>
                        {crmMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {e.invoice?.invoice_number ?? '—'}
                    </td>
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
