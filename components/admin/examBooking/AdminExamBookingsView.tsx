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

import { downloadPassportCopy, getAllExamBookings, updateExamBookingStatus } from '@/apis/examBooking.api';
import {
  EXAM_BOOKING_STATUSES,
  getStatusMeta,
  type ExamBooking,
  type ExamBookingStatus,
  type ExamBookingStatusUpdatePayload,
} from '@/types/examBooking';

const statusColorMap: Record<string, string> = {
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
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColorMap[meta.color]}`}>
      {meta.label}
    </span>
  );
}

function UpdateStatusModal({
  booking,
  onClose,
}: {
  booking: ExamBooking;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { register, handleSubmit } = useForm<ExamBookingStatusUpdatePayload>({
    defaultValues: {
      status: booking.status,
      admin_notes: booking.admin_notes ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: ExamBookingStatusUpdatePayload) =>
      updateExamBookingStatus(booking.id, payload),
    onSuccess: () => {
      toast.success('Status updated successfully.');
      void queryClient.invalidateQueries({ queryKey: ['admin-exam-bookings'] });
      onClose();
    },
    onError: () => {
      toast.error('Failed to update status.');
    },
  });

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' });

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-opsh-primary focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Update Booking #{booking.id}</h3>
            <p className="text-xs text-gray-500">{booking.passport_name} — {booking.test_type}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>

        {/* Details summary */}
        <div className="grid grid-cols-2 gap-3 px-6 py-4 text-sm">
          <div>
            <p className="text-xs text-gray-400">Preferred Date</p>
            <p className="font-medium">{fmt(booking.preferred_date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Location</p>
            <p className="font-medium truncate">{booking.test_location}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Passport No.</p>
            <p className="font-medium">{booking.passport_number}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Contact</p>
            <p className="font-medium">{booking.contact_number}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-400">Email</p>
            <p className="font-medium">{booking.email}</p>
          </div>
          {booking.special_message && (
            <div className="col-span-2">
              <p className="text-xs text-gray-400">Special Message</p>
              <p className="text-gray-700">{booking.special_message}</p>
            </div>
          )}
          {booking.passport_copy_path && (
            <div className="col-span-2">
              <button
                type="button"
                onClick={() =>
                  void downloadPassportCopy(booking.id, booking.passport_copy_original_name ?? 'passport_copy')
                }
                className="inline-flex items-center gap-2 rounded-xl border border-opsh-primary/30 bg-opsh-primary/5 px-3 py-2 text-xs font-medium text-opsh-primary hover:bg-opsh-primary/10 transition-colors"
              >
                <FaDownload />
                Download Passport Copy
              </button>
            </div>
          )}
        </div>

        {/* Status update form */}
        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="border-t border-gray-100 px-6 pb-6 pt-4 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Update Status</label>
            <select {...register('status')} className={inputClass}>
              {EXAM_BOOKING_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Notes</label>
            <textarea
              rows={3}
              placeholder="Optional notes visible to the applicant..."
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

export default function AdminExamBookingsView() {
  const [statusFilter, setStatusFilter] = useState('');
  const [testTypeFilter, setTestTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<ExamBooking | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-exam-bookings', statusFilter, testTypeFilter, search, page],
    queryFn: () =>
      getAllExamBookings({
        status: statusFilter || undefined,
        test_type: testTypeFilter || undefined,
        search: search || undefined,
        page,
        per_page: 20,
      }),
  });

  const bookings = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' });

  const inputClass =
    'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-opsh-primary focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 transition-all';

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search by name, passport, email..."
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
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {isFetching ? <FaSpinner className="animate-spin" /> : <FaRedoAlt />}
          Refresh
        </button>
      </div>

      {/* Stats row */}
      {!isLoading && (
        <p className="text-sm text-gray-500">
          Showing <strong>{bookings.length}</strong> of <strong>{total}</strong> booking{total !== 1 ? 's' : ''}
        </p>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-opsh-primary text-white">
              <tr>
                {['#', 'Applicant', 'Test', 'Preferred Date', 'Location', 'Status', 'Submitted', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <FaSpinner className="mx-auto animate-spin text-2xl text-opsh-primary" />
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                    No booking requests found.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-bold text-opsh-primary">#{booking.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-800">{booking.passport_name}</p>
                      <p className="text-xs text-gray-400">{booking.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-opsh-primary px-2 py-0.5 text-xs font-bold text-white">
                        {booking.test_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{fmt(booking.preferred_date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-36 truncate">{booking.test_location}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{fmt(booking.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(booking)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-opsh-primary/10 px-3 py-1.5 text-xs font-medium text-opsh-primary hover:bg-opsh-primary/20 transition-colors"
                      >
                        <FaEdit />
                        Update
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
            <p className="text-sm text-gray-500">
              Page {page} of {lastPage}
            </p>
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

      {/* Status update modal */}
      {selectedBooking && (
        <UpdateStatusModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
