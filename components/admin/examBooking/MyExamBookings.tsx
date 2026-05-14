'use client';

import { useQuery } from '@tanstack/react-query';
import { FaCalendarAlt, FaMapMarkerAlt, FaPassport, FaRedoAlt, FaSpinner } from 'react-icons/fa';

import { getMyExamBookings } from '@/apis/examBooking.api';
import {
  EXAM_BOOKING_STATUSES,
  STATUS_WORKFLOW,
  getStatusMeta,
  type ExamBooking,
  type ExamBookingStatus,
} from '@/types/examBooking';

const statusColorMap: Record<string, string> = {
  blue:    'bg-blue-100 text-blue-700',
  amber:   'bg-amber-100 text-amber-700',
  orange:  'bg-orange-100 text-orange-700',
  purple:  'bg-purple-100 text-purple-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  red:     'bg-red-100 text-red-700',
};

function StatusBadge({ status }: { status: ExamBookingStatus }) {
  const meta = getStatusMeta(status);
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColorMap[meta.color]}`}>
      {meta.label}
    </span>
  );
}

function StatusStepper({ status }: { status: ExamBookingStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
        <span className="font-semibold">Status:</span> Cancelled
      </div>
    );
  }

  const currentIndex = STATUS_WORKFLOW.indexOf(status);

  return (
    <div className="mt-3 overflow-x-auto">
      <div className="flex min-w-max items-center gap-0">
        {STATUS_WORKFLOW.map((step, index) => {
          const meta = EXAM_BOOKING_STATUSES.find((s) => s.value === step)!;
          const isDone    = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture  = index > currentIndex;

          return (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-opsh-primary text-white ring-4 ring-opsh-primary/20'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isDone ? '✓' : index + 1}
                </div>
                <span
                  className={`mt-1 max-w-[72px] text-center text-[10px] leading-tight ${
                    isCurrent ? 'font-semibold text-opsh-primary' : isFuture ? 'text-gray-400' : 'text-emerald-600'
                  }`}
                >
                  {meta.label}
                </span>
              </div>
              {index < STATUS_WORKFLOW.length - 1 && (
                <div className={`mb-4 h-0.5 w-8 ${isDone ? 'bg-emerald-400' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: ExamBooking }) {
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-opsh-primary px-2.5 py-0.5 text-xs font-bold text-white">
              {booking.test_type}
            </span>
            <span className="text-xs text-gray-400">#{booking.id}</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-gray-800">{booking.passport_name}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="shrink-0 text-opsh-primary/60" />
          <span>Preferred: <strong>{fmt(booking.preferred_date)}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="shrink-0 text-opsh-primary/60" />
          <span className="truncate">{booking.test_location}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaPassport className="shrink-0 text-opsh-primary/60" />
          <span>{booking.passport_number}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          Submitted: {fmt(booking.created_at)}
        </div>
      </div>

      <StatusStepper status={booking.status} />

      {booking.admin_notes && (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Admin Note</p>
          <p className="mt-1 text-sm text-blue-800">{booking.admin_notes}</p>
        </div>
      )}

      {booking.special_message && (
        <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Your Note</p>
          <p className="mt-1 text-sm text-gray-700">{booking.special_message}</p>
        </div>
      )}
    </div>
  );
}

export default function MyExamBookings() {
  const { data: bookings, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['my-exam-bookings'],
    queryFn: getMyExamBookings,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">My Booking Applications</h2>
          <p className="text-sm text-gray-500">Track the status of your exam booking requests.</p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          {isFetching ? <FaSpinner className="animate-spin" /> : <FaRedoAlt />}
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <FaSpinner className="animate-spin text-2xl text-opsh-primary" />
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <FaPassport className="text-4xl text-gray-300" />
          <p className="mt-3 text-base font-semibold text-gray-500">No booking applications yet</p>
          <p className="mt-1 text-sm text-gray-400">Submit your first exam booking request using the form.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
