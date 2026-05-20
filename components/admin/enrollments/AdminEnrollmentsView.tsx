'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaFileAlt,
  FaRedoAlt,
  FaSearch,
  FaSpinner,
  FaTimes,
} from 'react-icons/fa';

import {
  getAdminEnrollmentStats,
  getAdminEnrollments,
  updateAdminEnrollment,
} from '@/apis/enrollment.api';
import { createInvoice, markInvoicePaid } from '@/apis/courseCatalog.api';
import {
  CRM_STATUSES,
  ENROLLMENT_PAYMENT_STATUSES,
  getCrmStatusMeta,
  getEnrollmentPaymentMeta,
  type AdminEnrollment,
  type AdminEnrollmentUpdatePayload,
  type EnrollmentCrmStatus,
  type EnrollmentPaymentStatus,
} from '@/types/enrollment';

// ── Colour helpers ─────────────────────────────────────────────────────────────
const colorMap: Record<string, string> = {
  sky:     'bg-sky-100 text-sky-700 border-sky-200',
  blue:    'bg-blue-100 text-blue-700 border-blue-200',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  gray:    'bg-gray-100 text-gray-600 border-gray-200',
  purple:  'bg-purple-100 text-purple-700 border-purple-200',
  red:     'bg-red-100 text-red-700 border-red-200',
  amber:   'bg-amber-100 text-amber-700 border-amber-200',
  orange:  'bg-orange-100 text-orange-700 border-orange-200',
};

function CrmBadge({ status }: { status: string }) {
  const meta = getCrmStatusMeta(status);
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorMap[meta.color] ?? colorMap.gray}`}>
      {meta.label}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const meta = getEnrollmentPaymentMeta(status);
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorMap[meta.color] ?? colorMap.gray}`}>
      {meta.label}
    </span>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar() {
  const { data } = useQuery({
    queryKey: ['admin-enrollment-stats'],
    queryFn: getAdminEnrollmentStats,
  });

  const cards = [
    { label: 'Total',        value: data?.total        ?? 0, cls: 'border-opsh-primary/20 bg-opsh-primary/5 text-opsh-primary' },
    { label: 'Paid',         value: data?.paid         ?? 0, cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    { label: 'Payment Due',  value: data?.payment_due  ?? 0, cls: 'border-amber-200 bg-amber-50 text-amber-700' },
    { label: 'Completed',    value: data?.completed    ?? 0, cls: 'border-purple-200 bg-purple-50 text-purple-700' },
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

// ── Edit modal ────────────────────────────────────────────────────────────────
function EditModal({
  enrollment,
  onClose,
}: {
  enrollment: AdminEnrollment;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const { register, handleSubmit } = useForm<AdminEnrollmentUpdatePayload>({
    defaultValues: {
      student_name:          enrollment.student_name,
      phone:                 enrollment.phone ?? '',
      email:                 enrollment.email ?? '',
      teacher:               enrollment.teacher ?? '',
      attendance_percentage: enrollment.attendance_percentage ? Number(enrollment.attendance_percentage) : null,
      certificate_eligible:  enrollment.certificate_eligible,
      payment_status:        enrollment.payment_status,
      crm_status:            enrollment.crm_status,
      notes:                 enrollment.notes ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: AdminEnrollmentUpdatePayload) =>
      updateAdminEnrollment(enrollment.id, payload),
    onSuccess: () => {
      toast.success('Enrollment updated.');
      void queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-enrollment-stats'] });
      onClose();
    },
    onError: () => toast.error('Failed to update enrollment.'),
  });

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-opsh-primary focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 transition-all';

  const course = enrollment.batch?.course?.course_name ?? '—';
  const batch  = enrollment.batch?.batch_type   ?? '—';

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
              #{enrollment.id} — {enrollment.student_name}
            </h3>
            <p className="text-xs text-gray-500">{course} · {batch}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>

        {/* Student info (read-only) */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-b border-gray-100 px-6 py-4 text-sm sm:grid-cols-3">
          {[
            { label: 'Email',   value: enrollment.email },
            { label: 'Phone',   value: enrollment.phone },
            { label: 'Invoice', value: enrollment.invoice?.invoice_number },
            { label: 'Invoice Status', value: enrollment.invoice?.status },
            { label: 'Amount',  value: enrollment.amount_paid != null ? `NPR ${Number(enrollment.amount_paid).toLocaleString('en-NP')}` : null },
            { label: 'Enrolled', value: enrollment.enrollment_date?.slice(0, 10) },
          ].map(({ label, value }) =>
            value ? (
              <div key={label}>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-medium text-gray-800">{value}</p>
              </div>
            ) : null
          )}
        </div>

        {/* Editable form */}
        <form
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          className="space-y-4 px-6 pb-6 pt-4"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Update Record
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">CRM Status</label>
              <select {...register('crm_status')} className={inputClass}>
                {CRM_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Payment Status</label>
              <select {...register('payment_status')} className={inputClass}>
                {ENROLLMENT_PAYMENT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Teacher</label>
              <input type="text" {...register('teacher')} className={inputClass} placeholder="Teacher name" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Attendance %</label>
              <input
                type="number"
                min={0}
                max={100}
                {...register('attendance_percentage', { valueAsNumber: true })}
                className={inputClass}
                placeholder="0–100"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              {...register('certificate_eligible')}
              className="h-4 w-4 rounded border-gray-300 accent-opsh-primary"
            />
            Certificate Eligible
          </label>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              rows={3}
              {...register('notes')}
              className={`${inputClass} resize-none`}
              placeholder="Internal notes…"
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
              {mutation.isPending && <FaSpinner className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function AdminEnrollmentsView() {
  const [search, setSearch]               = useState('');
  const [crmFilter, setCrmFilter]         = useState<EnrollmentCrmStatus | ''>('');
  const [payFilter, setPayFilter]         = useState<EnrollmentPaymentStatus | ''>('');
  const [page, setPage]                   = useState(1);
  const [selected, setSelected]           = useState<AdminEnrollment | null>(null);
  const [processingId, setProcessingId]   = useState<number | null>(null);
  const queryClient                       = useQueryClient();

  const generateInvoiceMutation = useMutation({
    mutationFn: (batchId: number) => createInvoice(batchId),
    onSuccess: () => {
      toast.success('Invoice generated successfully.');
      void queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] });
    },
    onError: () => toast.error('Failed to generate invoice.'),
    onSettled: () => setProcessingId(null),
  });

  const markPaidMutation = useMutation({
    mutationFn: (invoiceId: number) => markInvoicePaid(invoiceId),
    onSuccess: () => {
      toast.success('Invoice marked as paid.');
      void queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] });
    },
    onError: () => toast.error('Failed to mark invoice paid.'),
    onSettled: () => setProcessingId(null),
  });

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-enrollments', search, crmFilter, payFilter, page],
    queryFn: () =>
      getAdminEnrollments({
        search:         search        || undefined,
        crm_status:     crmFilter     || undefined,
        payment_status: payFilter     || undefined,
        page,
        limit: 20,
      }),
  });

  const enrollments = data?.data      ?? [];
  const lastPage    = data?.last_page ?? 1;
  const total       = data?.total     ?? 0;

  const inputClass =
    'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-opsh-primary focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 transition-all';

  const fmt = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="space-y-5">
      <StatsBar />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className={`${inputClass} w-full pl-9`}
          />
        </div>

        <select
          value={crmFilter}
          onChange={(e) => { setCrmFilter(e.target.value as EnrollmentCrmStatus | ''); setPage(1); }}
          className={inputClass}
        >
          <option value="">All CRM Status</option>
          {CRM_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          value={payFilter}
          onChange={(e) => { setPayFilter(e.target.value as EnrollmentPaymentStatus | ''); setPage(1); }}
          className={inputClass}
        >
          <option value="">All Payments</option>
          {ENROLLMENT_PAYMENT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
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
          Showing <strong>{enrollments.length}</strong> of <strong>{total}</strong> enrollment{total !== 1 ? 's' : ''}
        </p>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-opsh-primary text-white">
              <tr>
                {['#', 'Student', 'Course / Batch', 'Teacher', 'Enrolled', 'Attendance', 'CRM', 'Payment', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <FaSpinner className="mx-auto animate-spin text-2xl text-opsh-primary" />
                  </td>
                </tr>
              ) : enrollments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-gray-400">
                    No enrollments found.
                  </td>
                </tr>
              ) : (
                enrollments.map((e: AdminEnrollment) => (
                  <tr key={e.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-bold text-opsh-primary">#{e.id}</td>

                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-800">{e.student_name}</p>
                      <p className="text-xs text-gray-400">{e.email ?? e.user?.email ?? '—'}</p>
                      <p className="text-xs text-gray-400">{e.phone ?? e.user?.phone ?? ''}</p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{e.batch?.course?.course_name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{e.batch?.batch_type ?? ''}</p>
                      {e.batch?.class_time && (
                        <p className="text-xs text-gray-400">{e.batch.class_time.slice(0, 5)}</p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">{e.teacher ?? '—'}</td>

                    <td className="px-4 py-3 text-sm text-gray-700">{fmt(e.enrollment_date)}</td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {e.attendance_percentage != null
                        ? `${Number(e.attendance_percentage).toFixed(0)}%`
                        : '—'}
                      {e.certificate_eligible && (
                        <span className="ml-1.5 inline-block rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                          CERT
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <CrmBadge status={e.crm_status} />
                    </td>

                    <td className="px-4 py-3">
                      <PaymentBadge status={e.payment_status} />
                      {e.invoice && (
                        <p className="mt-0.5 text-xs text-gray-400">{e.invoice.invoice_number}</p>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelected(e)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-opsh-primary/10 px-3 py-1.5 text-xs font-medium text-opsh-primary transition-colors hover:bg-opsh-primary/20"
                        >
                          <FaEdit className="text-xs" />
                          Edit
                        </button>

                        {!e.invoice && (
                          <button
                            type="button"
                            disabled={processingId === e.id}
                            onClick={() => {
                              setProcessingId(e.id);
                              generateInvoiceMutation.mutate(e.batch_id);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50"
                          >
                            {processingId === e.id ? <FaSpinner className="animate-spin text-xs" /> : <FaFileAlt className="text-xs" />}
                            Invoice
                          </button>
                        )}

                        {e.invoice?.status === 'unpaid' && (
                          <button
                            type="button"
                            disabled={processingId === e.id}
                            onClick={() => {
                              setProcessingId(e.id);
                              markPaidMutation.mutate(e.invoice!.id);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                          >
                            {processingId === e.id ? <FaSpinner className="animate-spin text-xs" /> : <FaCheck className="text-xs" />}
                            Mark Paid
                          </button>
                        )}
                      </div>
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

      {selected && (
        <EditModal enrollment={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
