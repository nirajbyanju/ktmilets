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
  FaPlus,
  FaRedoAlt,
  FaSearch,
  FaSpinner,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';

import {
  createExamBookingPlan,
  deleteExamBookingEnrollment,
  deleteExamBookingPlan,
  downloadPassportCopy,
  getAdminExamBookingPlans,
  getAllExamBookings,
  getExamBookingStats,
  updateExamBooking,
  updateExamBookingPlan,
} from '@/apis/examBooking.api';
import {
  EXAM_BOOKING_STATUSES,
  getStatusMeta,
  type ExamBookingAdminUpdatePayload,
  type ExamBookingEnrollment,
  type ExamBookingPlan,
  type ExamBookingPlanCreatePayload,
  type ExamBookingStatus,
} from '@/types/examBooking';

// ── Shared ────────────────────────────────────────────────────────────────────
const colorMap: Record<string, string> = {
  blue:    'bg-blue-100 text-blue-700 border-blue-200',
  amber:   'bg-amber-100 text-amber-700 border-amber-200',
  orange:  'bg-orange-100 text-orange-700 border-orange-200',
  purple:  'bg-purple-100 text-purple-700 border-purple-200',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  red:     'bg-red-100 text-red-700 border-red-200',
  green:   'bg-green-100 text-green-700 border-green-200',
};

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-opsh-primary focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 transition-all';

function StatusBadge({ status }: { status: ExamBookingStatus }) {
  const meta = getStatusMeta(status);
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorMap[meta.color]}`}>
      {meta.label}
    </span>
  );
}

function InvoiceBadge({ status }: { status?: string }) {
  const cls =
    status === 'paid'    ? 'bg-green-100 text-green-700 border-green-200' :
    status === 'overdue' ? 'bg-red-100 text-red-700 border-red-200'       :
                          'bg-amber-100 text-amber-700 border-amber-200';
  const label = status === 'paid' ? 'Paid' : status === 'overdue' ? 'Overdue' : 'Unpaid';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' });

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — PLANS
// ══════════════════════════════════════════════════════════════════════════════

function PlanFormModal({
  plan,
  onClose,
}: {
  plan?: ExamBookingPlan;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!plan;

  const { register, handleSubmit, formState: { errors } } = useForm<ExamBookingPlanCreatePayload>({
    defaultValues: {
      exam_name: plan?.exam_name ?? '',
      exam_type: plan?.exam_type ?? '',
      price:     plan?.price != null ? Number(plan.price) : undefined,
      discount:  plan?.discount != null ? Number(plan.discount) : undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ExamBookingPlanCreatePayload) =>
      isEdit ? updateExamBookingPlan(plan!.id, data) : createExamBookingPlan(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Plan updated.' : 'Plan created.');
      void queryClient.invalidateQueries({ queryKey: ['admin-exam-booking-plans'] });
      onClose();
    },
    onError: () => toast.error('Failed to save plan.'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-base font-bold text-gray-900">{isEdit ? 'Edit Plan' : 'New Exam Booking Plan'}</h3>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 px-6 pb-6 pt-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Exam Type *</label>
            <input
              {...register('exam_type', { required: 'Required' })}
              placeholder="e.g. IELTS, PTE, TOEFL"
              className={inputClass}
            />
            {errors.exam_type && <p className="mt-1 text-xs text-red-500">{errors.exam_type.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Plan Name</label>
            <input
              {...register('exam_name')}
              placeholder="e.g. IELTS Academic, PTE Academic"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Price (NPR)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('price', { valueAsNumber: true })}
                placeholder="0.00"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Discount (NPR)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('discount', { valueAsNumber: true })}
                placeholder="0.00"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-opsh-primary px-5 py-2 text-sm font-medium text-white hover:bg-opsh-primary-hover disabled:opacity-50">
              {mutation.isPending ? <FaSpinner className="animate-spin" /> : null}
              {isEdit ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PlansTab() {
  const queryClient = useQueryClient();
  const [editPlan, setEditPlan]       = useState<ExamBookingPlan | null>(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [deletingId, setDeletingId]   = useState<number | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['admin-exam-booking-plans'],
    queryFn: getAdminExamBookingPlans,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteExamBookingPlan(id),
    onSuccess: () => {
      toast.success('Plan deleted.');
      void queryClient.invalidateQueries({ queryKey: ['admin-exam-booking-plans'] });
      setDeletingId(null);
    },
    onError: () => toast.error('Failed to delete plan.'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Define exam types and pricing. Students select a plan when submitting a booking request.
        </p>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-opsh-primary px-4 py-2 text-sm font-medium text-white hover:bg-opsh-primary-hover"
        >
          <FaPlus className="text-xs" /> New Plan
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-opsh-primary text-white">
            <tr>
              {['#', 'Exam Type', 'Plan Name', 'Price (NPR)', 'Discount (NPR)', 'Net Price', 'Enrollments', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {isLoading ? (
              <tr><td colSpan={8} className="py-16 text-center"><FaSpinner className="mx-auto animate-spin text-2xl text-opsh-primary" /></td></tr>
            ) : plans.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-sm text-gray-400">No plans yet. Create one to allow students to book.</td></tr>
            ) : (
              plans.map((p) => {
                const price    = Number(p.price ?? 0);
                const discount = Number(p.discount ?? 0);
                const net      = Math.max(0, price - discount);
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs font-bold text-opsh-primary">#{p.id}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-opsh-primary/10 px-2 py-0.5 text-xs font-black text-opsh-primary">
                        {p.exam_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.exam_name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{price > 0 ? `NPR ${price.toLocaleString('en-NP')}` : '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{discount > 0 ? `NPR ${discount.toLocaleString('en-NP')}` : '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {net > 0 ? `NPR ${net.toLocaleString('en-NP')}` : 'Free'}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-opsh-primary">
                      {p.enrollments_count ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditPlan(p)}
                          className="inline-flex items-center gap-1 rounded-xl bg-opsh-primary/10 px-3 py-1.5 text-xs font-medium text-opsh-primary hover:bg-opsh-primary/20"
                        >
                          <FaEdit className="text-xs" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(p.id)}
                          className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                        >
                          <FaTrash className="text-xs" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900">Delete Plan?</h3>
            <p className="mt-2 text-sm text-gray-500">This will permanently delete the plan. Existing enrollments will still reference it.</p>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setDeletingId(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button
                onClick={() => deleteMutation.mutate(deletingId)}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? <FaSpinner className="animate-spin" /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {(showCreate || editPlan) && (
        <PlanFormModal
          plan={editPlan ?? undefined}
          onClose={() => { setShowCreate(false); setEditPlan(null); }}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — ENROLLMENTS
// ══════════════════════════════════════════════════════════════════════════════

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

function ManageModal({
  enrollment,
  onClose,
}: {
  enrollment: ExamBookingEnrollment;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const { register, handleSubmit } = useForm<ExamBookingAdminUpdatePayload>({
    defaultValues: {
      status:                 enrollment.status,
      available_slot_checked: enrollment.available_slot_checked ?? false,
      admin_notes:            enrollment.admin_notes ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: ExamBookingAdminUpdatePayload) => updateExamBooking(enrollment.id, payload),
    onSuccess: () => {
      toast.success('Enrollment updated.');
      void queryClient.invalidateQueries({ queryKey: ['admin-exam-bookings'] });
      void queryClient.invalidateQueries({ queryKey: ['exam-booking-stats'] });
      onClose();
    },
    onError: () => toast.error('Failed to update.'),
  });

  const Row = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-8" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Enrollment #{enrollment.id} —{' '}
              <span className="text-sm text-opsh-primary">{enrollment.examBooking?.exam_type}</span>
              {enrollment.examBooking?.exam_name && (
                <span className="text-sm text-gray-500"> · {enrollment.examBooking.exam_name}</span>
              )}
            </h3>
            <p className="text-xs text-gray-500">
              {enrollment.user
                ? `${enrollment.user.first_name ?? ''} ${enrollment.user.last_name ?? ''}`.trim() || enrollment.user.email
                : enrollment.email}
              {' · '}Submitted {fmt(enrollment.created_at)}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100">
            <FaTimes />
          </button>
        </div>

        {/* Invoice */}
        {enrollment.invoice && (
          <div className="border-b border-gray-100 px-6 py-3">
            <div className="flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-2.5">
              <div>
                <p className="text-xs text-gray-400">Invoice</p>
                <p className="text-sm font-mono font-bold text-opsh-primary">{enrollment.invoice.invoice_number}</p>
              </div>
              <InvoiceBadge status={enrollment.invoice.status} />
              <div className="ml-auto">
                <p className="text-xs text-gray-400">Amount</p>
                <p className="text-sm font-bold text-gray-800">
                  NPR {Number(enrollment.invoice.total_npr).toLocaleString('en-NP')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Booking details */}
        <div className="border-b border-gray-100 px-6 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Booking Details</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            <Row label="Email"          value={enrollment.email} />
            <Row label="Phone"          value={enrollment.phone ?? enrollment.contact_number} />
            <Row label="Preferred Date" value={fmt(enrollment.preferred_date)} />
            <Row label="Preferred Time" value={enrollment.preferred_time} />
            <Row label="Test Centre"    value={enrollment.preferred_test_centre ?? enrollment.test_location} />
            <Row label="Special Note"   value={enrollment.special_message} />
          </div>
        </div>

        {/* Passport */}
        <div className="border-b border-gray-100 px-6 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Passport &amp; Identity</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            <Row label="Name as Passport" value={enrollment.passport_name} />
            <Row label="Passport Number"  value={enrollment.passport_number} />
            <Row label="Date of Birth"    value={fmt(enrollment.date_of_birth)} />
          </div>
          {enrollment.passport_copy_path && (
            <button
              type="button"
              onClick={() => void downloadPassportCopy(enrollment.id, enrollment.passport_copy_original_name ?? 'passport_copy')}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-opsh-primary/30 bg-opsh-primary/5 px-3 py-2 text-xs font-medium text-opsh-primary hover:bg-opsh-primary/10"
            >
              <FaDownload /> Download Passport Copy
            </button>
          )}
        </div>

        {/* Admin form */}
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4 px-6 pb-6 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Admin Actions</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Booking Status</label>
              <select {...register('status')} className={inputClass}>
                {EXAM_BOOKING_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  {...register('available_slot_checked')}
                  className="h-4 w-4 rounded border-gray-300 accent-opsh-primary"
                />
                Available Slot Checked
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Admin Notes <span className="font-normal text-gray-400">(visible to student)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Next steps, document requests, confirmation details…"
              {...register('admin_notes')}
              className={inputClass + ' resize-none'}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-opsh-primary px-5 py-2 text-sm font-medium text-white hover:bg-opsh-primary-hover disabled:opacity-50">
              {mutation.isPending ? <FaSpinner className="animate-spin" /> : null}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EnrollmentsTab() {
  const [statusFilter, setStatusFilter]   = useState('');
  const [examTypeFilter, setExamTypeFilter] = useState('');
  const [search, setSearch]               = useState('');
  const [page, setPage]                   = useState(1);
  const [selected, setSelected]           = useState<ExamBookingEnrollment | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-exam-bookings', statusFilter, examTypeFilter, search, page],
    queryFn: () =>
      getAllExamBookings({
        status:    statusFilter   || undefined,
        exam_type: examTypeFilter || undefined,
        search:    search         || undefined,
        page,
        per_page: 20,
      }),
  });

  const bookings = data?.data     ?? [];
  const lastPage  = data?.last_page ?? 1;
  const total     = data?.total     ?? 0;

  const filterInputClass =
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
            placeholder="Search name, passport, email, phone…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className={filterInputClass + ' w-full pl-9'}
          />
        </div>

        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={filterInputClass}>
          <option value="">All Statuses</option>
          {EXAM_BOOKING_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select value={examTypeFilter} onChange={(e) => { setExamTypeFilter(e.target.value); setPage(1); }} className={filterInputClass}>
          <option value="">All Types</option>
          <option value="IELTS">IELTS</option>
          <option value="PTE">PTE</option>
          <option value="TOEFL">TOEFL</option>
          <option value="Duolingo">Duolingo</option>
        </select>

        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          {isFetching ? <FaSpinner className="animate-spin" /> : <FaRedoAlt />}
          Refresh
        </button>
      </div>

      {!isLoading && (
        <p className="text-sm text-gray-500">
          Showing <strong>{bookings.length}</strong> of <strong>{total}</strong> enrollment{total !== 1 ? 's' : ''}
        </p>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-opsh-primary text-white">
              <tr>
                {['#', 'Student', 'Test / Plan', 'Preferred Date', 'Test Centre', 'Status', 'Invoice', 'Submitted', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {isLoading ? (
                <tr><td colSpan={9} className="py-16 text-center"><FaSpinner className="mx-auto animate-spin text-2xl text-opsh-primary" /></td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={9} className="py-12 text-center text-sm text-gray-400">No enrollments found.</td></tr>
              ) : (
                bookings.map((b) => {
                  const name = b.user
                    ? `${b.user.first_name ?? ''} ${b.user.last_name ?? ''}`.trim() || b.user.email
                    : b.passport_name;
                  return (
                    <tr key={b.id} className={`transition-colors hover:bg-gray-50 ${b.status === 'new_request' ? 'bg-blue-50/40' : ''}`}>
                      <td className="px-4 py-3 text-sm font-bold text-opsh-primary">
                        #{b.id}
                        {b.status === 'new_request' && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-800">{name}</p>
                        <p className="text-xs text-gray-400">{b.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded px-2 py-0.5 text-xs font-black bg-opsh-primary/10 text-opsh-primary`}>
                          {b.examBooking?.exam_type ?? '—'}
                        </span>
                        {b.examBooking?.exam_name && (
                          <p className="mt-0.5 text-xs text-gray-500">{b.examBooking.exam_name}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {fmt(b.preferred_date)}
                        {b.preferred_time && <p className="text-xs text-gray-400">{b.preferred_time}</p>}
                      </td>
                      <td className="max-w-36 px-4 py-3">
                        <p className="truncate text-sm text-gray-700">{b.preferred_test_centre ?? b.test_location ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.status} />
                        {b.available_slot_checked && (
                          <p className="mt-1 text-xs text-emerald-600">✓ Slot checked</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {b.invoice ? (
                          <>
                            <InvoiceBadge status={b.invoice.status} />
                            <p className="mt-0.5 font-mono text-xs text-gray-500">{b.invoice.invoice_number}</p>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{fmt(b.created_at)}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelected(b)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-opsh-primary/10 px-3 py-1.5 text-xs font-medium text-opsh-primary hover:bg-opsh-primary/20"
                        >
                          <FaEdit className="text-xs" /> Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

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

      {selected && (
        <ManageModal enrollment={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT EXPORT
// ══════════════════════════════════════════════════════════════════════════════

export default function AdminExamBookingsView() {
  const [tab, setTab] = useState<'plans' | 'enrollments'>('enrollments');

  return (
    <div className="space-y-5">
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-2xl border border-gray-100 bg-white p-1 shadow-sm w-fit">
        {(['enrollments', 'plans'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-xl px-5 py-2 text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-opsh-primary text-white shadow'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t === 'plans' ? 'Booking Plans' : 'Enrollments'}
          </button>
        ))}
      </div>

      {tab === 'plans'       ? <PlansTab       /> : null}
      {tab === 'enrollments' ? <EnrollmentsTab /> : null}
    </div>
  );
}
