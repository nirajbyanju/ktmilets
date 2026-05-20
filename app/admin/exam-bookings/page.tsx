'use client';

import { useEffect, useState } from 'react';

import AdminExamBookingsView from '@/components/admin/examBooking/AdminExamBookingsView';
import { isAdminUser } from '@/data/adminMenu';
import { getMyExamBookings } from '@/apis/examBooking.api';
import useAuthStore from '@/stores/auth/AuthStore';
import { type ExamBookingEnrollment, getStatusMeta } from '@/types/examBooking';

export default function AdminExamBookingsPage() {
  const roles             = useAuthStore((state) => state.roles);
  const permissions       = useAuthStore((state) => state.permissions);
  const directPermissions = useAuthStore((state) => state.directPermissions);
  const isAdmin = isAdminUser({ roles, permissions, directPermissions });

  if (isAdmin) {
    return <AdminExamBookingsWrapper />;
  }

  return <MyExamBookingsView />;
}

function AdminExamBookingsWrapper() {
  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">Admin Panel</p>
        <h1 className="mt-1 text-2xl font-black text-opsh-primary">Exam Booking Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage exam booking plans and student enrollments. Submitting an enrollment auto-generates an invoice.
        </p>
      </div>
      <AdminExamBookingsView />
    </div>
  );
}

function MyExamBookingsView() {
  const [enrollments, setEnrollments] = useState<ExamBookingEnrollment[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    getMyExamBookings()
      .then(setEnrollments)
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const invoiceMeta = (status?: string) => {
    if (status === 'paid')    return { label: 'Paid',    color: 'green' };
    if (status === 'overdue') return { label: 'Overdue', color: 'red'   };
    return                           { label: 'Unpaid',  color: 'amber' };
  };

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">My Account</p>
        <h1 className="mt-1 text-2xl font-black text-opsh-primary">My Exam Bookings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your exam booking requests, invoice status, and current booking progress.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-slate-400">Loading…</div>
      ) : enrollments.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          No exam booking requests yet. Use the Exam Booking page to submit a request.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Test / Plan', 'Preferred Date', 'Centre', 'Status', 'Invoice', 'Amount', 'Submitted'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrollments.map((e) => {
                const statusMeta = getStatusMeta(e.status);
                const inv        = invoiceMeta(e.invoice?.status);
                return (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-opsh-primary/10 px-2.5 py-0.5 text-xs font-black text-opsh-primary">
                        {e.examBooking?.exam_type ?? '—'}
                      </span>
                      {e.examBooking?.exam_name && (
                        <p className="mt-0.5 text-xs text-slate-500">{e.examBooking.exam_name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {fmt(e.preferred_date)}
                      {e.preferred_time && <span className="ml-1 text-xs text-slate-400">{e.preferred_time}</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{e.preferred_test_centre ?? e.test_location ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold bg-${statusMeta.color}-100 text-${statusMeta.color}-700`}>
                        {statusMeta.label}
                      </span>
                      {e.available_slot_checked && (
                        <p className="mt-0.5 text-xs text-emerald-600">✓ Slot checked</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {e.invoice ? (
                        <>
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold bg-${inv.color}-100 text-${inv.color}-700`}>
                            {inv.label}
                          </span>
                          <p className="mt-0.5 font-mono text-xs text-slate-400">{e.invoice.invoice_number}</p>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {e.invoice
                        ? `NPR ${Number(e.invoice.total_npr).toLocaleString('en-NP')}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{fmt(e.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin notes */}
      {enrollments.some((e) => e.admin_notes) && (
        <div className="mt-4 space-y-2">
          {enrollments.filter((e) => e.admin_notes).map((e) => (
            <div key={e.id} className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold text-amber-700">
                Note from admin — Booking #{e.id} ({e.examBooking?.exam_type}):
              </p>
              <p className="mt-0.5 text-sm text-amber-800">{e.admin_notes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
