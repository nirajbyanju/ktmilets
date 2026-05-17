'use client';

import { useEffect, useState } from 'react';

import AdminExamBookingsView from '@/components/admin/examBooking/AdminExamBookingsView';
import { isAdminUser } from '@/data/adminMenu';
import { getMyExamBookings } from '@/apis/examBooking.api';
import useAuthStore from '@/stores/auth/AuthStore';
import { type ExamBooking, getStatusMeta, getPaymentStatusMeta } from '@/types/examBooking';

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
        <h1 className="mt-1 text-2xl font-black text-opsh-primary">Exam Booking Requests</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review all submitted booking requests, update statuses, and download passport copies.
        </p>
      </div>
      <AdminExamBookingsView />
    </div>
  );
}

function MyExamBookingsView() {
  const [bookings, setBookings] = useState<ExamBooking[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getMyExamBookings()
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">My Account</p>
        <h1 className="mt-1 text-2xl font-black text-opsh-primary">My Exam Bookings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your exam booking requests and their current status.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-slate-400">Loading…</div>
      ) : bookings.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          No exam booking requests yet. Use the Exam Booking page to submit a request.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Test', 'Name', 'Preferred Date', 'Centre', 'Status', 'Payment', 'Submitted'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => {
                const statusMeta  = getStatusMeta(b.status);
                const payMeta     = getPaymentStatusMeta(b.payment_status);
                return (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-opsh-primary/10 px-2.5 py-0.5 text-xs font-black text-opsh-primary">
                        {b.test_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{b.student_name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(b.preferred_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {b.preferred_time && <span className="ml-1 text-xs text-slate-400">{b.preferred_time}</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{b.preferred_test_centre}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold bg-${statusMeta.color}-100 text-${statusMeta.color}-700`}>
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold bg-${payMeta.color}-100 text-${payMeta.color}-700`}>
                        {payMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(b.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
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
