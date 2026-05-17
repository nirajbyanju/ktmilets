'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaEdit,
  FaRedoAlt,
  FaSearch,
  FaSpinner,
  FaTimes,
} from 'react-icons/fa';

import {
  downloadPassportCopy,
  getAllExamBookings,
  getExamBookingStats,
  updateExamBooking,
} from '@/apis/examBooking.api';
import {
  EXAM_BOOKING_STATUSES,
  PAYMENT_STATUSES,
  getPaymentStatusMeta,
  getStatusMeta,
  type ExamBooking,
  type ExamBookingAdminUpdatePayload,
  type ExamBookingStatus,
  type PaymentStatus,
} from '@/types/examBooking';

// ── Helpers ───────────────────────────────────────────────────────────────────
const colorMap: Record<string, string> = {
  blue:    'bg-blue-100 text-blue-700 border-blue-200',
  amber:   'bg-amber-100 text-amber-700 border-amber-200',
  orange:  'bg-orange-100 text-orange-700 border-orange-200',
  purple:  'bg-purple-100 text-purple-700 border-purple-200',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  red:     'bg-red-100 text-red-700 border-red-200',
};

function StatusBadge({ status }: { status: ExamBookingStatus }) {
  const meta = getStatusMeta(status);
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorMap[meta.color]}`}>
      {meta.label}
    </span>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const meta = getPaymentStatusMeta(status);
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorMap[meta.color]}`}>
      {meta.label}
    </span>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar() {
  const { data } = useQuery({
    queryKey: ['exam-booking-stats'],
    queryFn: getExamBookingStats,
  });

  const cards = [
    { label: 'Total',           value: data?.total ?? 0,           cls: 'border-opsh-primary/20 bg-opsh-primary/5 text-opsh-primary' },
    { label: 'New',             value: data?.new_request ?? 0,     cls: 'border-blue-200 bg-blue-50 text-blue-700' },
    { label: 'Payment Pending', value: data?.payment_pending ?? 0, cls: 'border-orange-200 bg-orange-50 text-orange-700' },
    { label: 'Booked',          value: data?.booked ?? 0,          cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-2xl border px-4 py-3 ${c.cls}`}>
          <p className="text-xs font-medium opacity-75">{c.label}</p>
          <p className="mt-1 text-2xl font-black">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Admin update modal ────────────────────────────────────────────────────────
function AdminUpdateModal({
  booking,
  onClose,
}: {
  booking: ExamBooking;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch } = useForm<ExamBookingAdminUpdatePayload>({
    defaultValues: {
      status:                      booking.status,
      payment_status:              booking.payment_status ?? 'pending',
      available_slot_checked:      booking.available_slot_checked ?? false,
      pte_login_details_received:  booking.pte_login_details_received ?? false,
      pte_username_email:          booking.pte_username_email ?? '',
      pte_password_notes:          booking.pte_password_notes ?? '',
      admin_notes:                 booking.admin_notes ?? '',
    },
  });

  const isPTE = booking.test_type === 'PTE';
  const pteReceived = watch('pte_login_details_received');

  const mutation = useMutation({
    mutationFn: (payload: ExamBookingAdminUpdatePayload) => updateExamBooking(booking.id, payload),
    onSuccess: () => {
      toast.success('Booking updated.');
      void queryClient.invalidateQueries({ queryKey: ['admin-exam-bookings'] });
      void queryClient.invalidateQueries({ queryKey: ['exam-booking-stats'] });
      onClose();
    },
    onError: () => toast.error('Failed to update booking.'),
  });

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-opsh-primary focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 transition-all';

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' });

  const Row = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    ) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Booking #{booking.id} —{' '}
              <span className={`text-sm ${booking.test_type === 'PTE' ? 'text-purple-600' : 'text-blue-600'}`}>
                {booking.test_type}
              </span>
            </h3>
            <p className="text-xs text-gray-500">
              {booking.student_name} · Submitted {fmtDate(booking.created_at)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>

        {/* ── Booking details ── */}
        <div className="border-b border-gray-100 px-6 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Booking Details
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <Row label="Student Name"    value={booking.student_name} />
            <Row label="Phone"           value={booking.phone} />
            <Row label="Email"           value={booking.email} />
            <Row label="Preferred Date"  value={fmtDate(booking.preferred_date)} />
            <Row label="Preferred Time"  value={booking.preferred_time} />
            <Row label="Test Centre"     value={booking.preferred_test_centre} />
          </div>
        </div>

        {/* ── Passport details ── */}
        <div className="border-b border-gray-100 px-6 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Passport &amp; Identity
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <Row label="Name as Passport" value={booking.passport_name} />
            <Row label="Passport Number"  value={booking.passport_number} />
            <Row label="Date of Birth"    value={fmtDate(booking.date_of_birth)} />
          </div>
          {booking.passport_copy_path && (
            <button
              type="button"
              onClick={() =>
                void downloadPassportCopy(
                  booking.id,
                  booking.passport_copy_original_name ?? 'passport_copy'
                )
              }
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-opsh-primary/30 bg-opsh-primary/5 px-3 py-2 text-xs font-medium text-opsh-primary transition-colors hover:bg-opsh-primary/10"
            >
              <FaDownload />
              Download Passport Copy
            </button>
          )}
          {booking.special_message && (
            <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-2.5">
              <p className="text-xs font-semibold text-amber-700">Student Message</p>
              <p className="mt-0.5 text-sm text-amber-800">{booking.special_message}</p>
            </div>
          )}
        </div>

        {/* ── Admin update form ── */}
        <form
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          className="space-y-4 px-6 pb-6 pt-4"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Admin Actions
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Booking status */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Booking Status
              </label>
              <select {...register('status')} className={inputClass}>
                {EXAM_BOOKING_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Payment status */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Payment Status
              </label>
              <select {...register('payment_status')} className={inputClass}>
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Checkboxes row */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2.5 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                {...register('available_slot_checked')}
                className="h-4 w-4 rounded border-gray-300 accent-opsh-primary"
              />
              Available Slot Checked
            </label>
            {isPTE && (
              <label className="flex items-center gap-2.5 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('pte_login_details_received')}
                  className="h-4 w-4 rounded border-gray-300 accent-opsh-primary"
                />
                PTE Login Details Received
              </label>
            )}
          </div>

          {/* PTE-specific fields (only for PTE bookings) */}
          {isPTE && (
            <div className="grid gap-4 rounded-xl border border-purple-100 bg-purple-50 p-4 sm:grid-cols-2">
              <p className="col-span-2 text-xs font-semibold uppercase tracking-wide text-purple-600">
                PTE Account Details
              </p>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  PTE Username / Email
                </label>
                <input
                  type="text"
                  placeholder="student@pte.com"
                  {...register('pte_username_email')}
                  className={inputClass}
                  disabled={!pteReceived}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  PTE Password Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Temp@2025 or shared separately"
                  {...register('pte_password_notes')}
                  className={inputClass}
                  disabled={!pteReceived}
                />
              </div>
            </div>
          )}

          {/* Admin notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Admin Notes <span className="text-gray-400 font-normal">(visible to student)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Next steps, document requests, confirmation details…"
              {...register('admin_notes')}
              className={inputClass + ' resize-none'}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-opsh-primary px-5 py-2 text-sm font-medium text-white hover:bg-opsh-primary-hover disabled:opacity-50"
            >
              {mutation.isPending ? <FaSpinner className="animate-spin" /> : null}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function AdminExamBookingsView() {
  const [statusFilter, setStatusFilter]     = useState('');
  const [testTypeFilter, setTestTypeFilter] = useState('');
  const [search, setSearch]                 = useState('');
  const [page, setPage]                     = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<ExamBooking | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-exam-bookings', statusFilter, testTypeFilter, search, page],
    queryFn: () =>
      getAllExamBookings({
        status:    statusFilter    || undefined,
        test_type: testTypeFilter  || undefined,
        search:    search          || undefined,
        page,
        per_page:  20,
      }),
  });

  const bookings = data?.data     ?? [];
  const lastPage  = data?.last_page ?? 1;
  const total     = data?.total     ?? 0;

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' });

  const inputClass =
    'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-opsh-primary focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 transition-all';

  return (
    <div className="space-y-5">
      <StatsBar />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
          <input
            type="text"
            placeholder="Search name, phone, passport, email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className={inputClass + ' w-full pl-9'}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className={inputClass}
        >
          <option value="">All Statuses</option>
          {EXAM_BOOKING_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          value={testTypeFilter}
          onChange={(e) => { setTestTypeFilter(e.target.value); setPage(1); }}
          className={inputClass}
        >
          <option value="">All Test Types</option>
          <option value="IELTS">IELTS</option>
          <option value="PTE">PTE</option>
        </select>

        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          {isFetching ? <FaSpinner className="animate-spin" /> : <FaRedoAlt />}
          Refresh
        </button>
      </div>

      {!isLoading && (
        <p className="text-sm text-gray-500">
          Showing <strong>{bookings.length}</strong> of <strong>{total}</strong>{' '}
          booking{total !== 1 ? 's' : ''}
        </p>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-opsh-primary text-white">
              <tr>
                {['#', 'Student', 'Phone', 'Test', 'Preferred Date', 'Test Centre', 'Status', 'Payment', 'Submitted', 'Action'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <FaSpinner className="mx-auto animate-spin text-2xl text-opsh-primary" />
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-sm text-gray-400">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((b: ExamBooking) => (
                  <tr
                    key={b.id}
                    className={`transition-colors hover:bg-gray-50 ${
                      b.status === 'new_request' ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-bold text-opsh-primary">
                      #{b.id}
                      {b.status === 'new_request' && (
                        <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-800">{b.student_name}</p>
                      <p className="text-xs text-gray-400">{b.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{b.phone}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-black ${
                          b.test_type === 'PTE'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {b.test_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {fmt(b.preferred_date)}
                      {b.preferred_time && (
                        <p className="text-xs text-gray-400">{b.preferred_time}</p>
                      )}
                    </td>
                    <td className="max-w-40 px-4 py-3">
                      <p className="truncate text-sm text-gray-700">{b.preferred_test_centre}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                      {b.available_slot_checked && (
                        <p className="mt-1 text-xs text-emerald-600">✓ Slot checked</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentBadge status={b.payment_status ?? 'pending'} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{fmt(b.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(b)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-opsh-primary/10 px-3 py-1.5 text-xs font-medium text-opsh-primary transition-colors hover:bg-opsh-primary/20"
                      >
                        <FaEdit className="text-xs" />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-sm text-gray-500">Page {page} of {lastPage}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FaChevronLeft className="text-xs" /> Prev
              </button>
              <button
                type="button"
                disabled={page >= lastPage}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedBooking && (
        <AdminUpdateModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
