'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaRedoAlt,
  FaSearch,
  FaSpinner,
  FaTimes,
  FaUserGraduate,
} from 'react-icons/fa';

import { getAdminEnrollmentStats, getAdminEnrollments, updateAdminEnrollment } from '@/apis/enrollment.api';
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

// ── Badge helpers ─────────────────────────────────────────────────────────────

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  amber:   'bg-amber-100   text-amber-700   border-amber-200',
  orange:  'bg-orange-100  text-orange-700  border-orange-200',
  blue:    'bg-blue-100    text-blue-700    border-blue-200',
  sky:     'bg-sky-100     text-sky-700     border-sky-200',
  purple:  'bg-purple-100  text-purple-700  border-purple-200',
  red:     'bg-red-100     text-red-700     border-red-200',
  gray:    'bg-gray-100    text-gray-600    border-gray-200',
};

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorMap[color] ?? colorMap.gray}`}>
      {label}
    </span>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

function StatsBar() {
  const { data } = useQuery({ queryKey: ['admin-enrollment-stats'], queryFn: getAdminEnrollmentStats });

  const cards = [
    { label: 'Total',        value: data?.total ?? 0,        cls: 'border-opsh-primary/20 bg-opsh-primary/5 text-opsh-primary' },
    { label: 'Active',       value: data?.active ?? 0,       cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    { label: 'Completed',    value: data?.completed ?? 0,    cls: 'border-purple-200 bg-purple-50 text-purple-700' },
    { label: 'Payment Due',  value: data?.payment_due ?? 0,  cls: 'border-amber-200 bg-amber-50 text-amber-700' },
    { label: 'Cert Eligible',value: data?.cert_eligible ?? 0,cls: 'border-blue-200 bg-blue-50 text-blue-700' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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

function EditModal({ enrollment, onClose }: { enrollment: AdminEnrollment; onClose: () => void }) {
  const queryClient = useQueryClient();

  const { register, handleSubmit } = useForm<AdminEnrollmentUpdatePayload>({
    defaultValues: {
      lead_id:               enrollment.lead_id ?? undefined,
      student_name:          enrollment.student_name,
      phone:                 enrollment.phone ?? '',
      email:                 enrollment.email ?? '',
      teacher:               enrollment.teacher ?? '',
      attendance_percentage: enrollment.attendance_percentage != null ? Number(enrollment.attendance_percentage) : undefined,
      certificate_eligible:  enrollment.certificate_eligible,
      payment_status:        enrollment.payment_status,
      crm_status:            enrollment.crm_status,
      notes:                 enrollment.notes ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: AdminEnrollmentUpdatePayload) => updateAdminEnrollment(enrollment.id, payload),
    onSuccess: () => {
      toast.success('Student record updated.');
      void queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-enrollment-stats'] });
      onClose();
    },
    onError: () => toast.error('Failed to update.'),
  });

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-opsh-primary focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 transition-all';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';

  const courseName = enrollment.batch?.course?.course_name ?? '—';
  const batchType  = enrollment.batch?.batch_type  ?? '—';
  const classTime  = enrollment.batch?.class_time  ?? '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
        style={{ maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Edit Student #{enrollment.id}</h3>
            <p className="text-xs text-gray-500">{courseName} · {batchType} · Class {classTime}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100">
            <FaTimes />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <form
            id="edit-enrollment-form"
            onSubmit={handleSubmit((v) => mutation.mutate(v))}
            className="grid grid-cols-2 gap-4 px-6 py-5"
          >
            {/* Read-only info */}
            <div className="col-span-2 grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-3 text-sm">
              <div><p className="text-xs text-gray-400">Course</p><p className="font-semibold">{courseName}</p></div>
              <div><p className="text-xs text-gray-400">Plan</p><p className="font-semibold">{batchType}</p></div>
              <div><p className="text-xs text-gray-400">Batch ID</p><p className="font-semibold">#{enrollment.batch_id}</p></div>
              <div><p className="text-xs text-gray-400">Class Time</p><p className="font-semibold">{classTime}</p></div>
              <div><p className="text-xs text-gray-400">Enrolled</p><p className="font-semibold">{enrollment.enrollment_date ? String(enrollment.enrollment_date).slice(0, 10) : '—'}</p></div>
              <div><p className="text-xs text-gray-400">Invoice</p><p className="font-semibold">{enrollment.invoice?.invoice_number ?? '—'}</p></div>
            </div>

            {/* Lead ID */}
            <div>
              <label className={labelClass}>Lead ID</label>
              <input type="number" {...register('lead_id', { valueAsNumber: true })} className={inputClass} placeholder="Optional" />
            </div>

            {/* Student name */}
            <div>
              <label className={labelClass}>Student Name</label>
              <input type="text" {...register('student_name')} className={inputClass} />
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>Phone / WhatsApp</label>
              <input type="tel" {...register('phone')} className={inputClass} placeholder="+977 98XXXXXXXX" />
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" {...register('email')} className={inputClass} />
            </div>

            {/* Teacher */}
            <div>
              <label className={labelClass}>Teacher</label>
              <input type="text" {...register('teacher')} className={inputClass} placeholder="Teacher name" />
            </div>

            {/* Attendance */}
            <div>
              <label className={labelClass}>Attendance %</label>
              <input type="number" min={0} max={100} step={0.1} {...register('attendance_percentage', { valueAsNumber: true })} className={inputClass} placeholder="0 – 100" />
            </div>

            {/* CRM Status */}
            <div>
              <label className={labelClass}>CRM Status</label>
              <select {...register('crm_status')} className={inputClass}>
                {CRM_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Payment status */}
            <div>
              <label className={labelClass}>Payment Status</label>
              <select {...register('payment_status')} className={inputClass}>
                {ENROLLMENT_PAYMENT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Certificate eligible */}
            <div className="col-span-2 flex items-center gap-3">
              <input type="checkbox" id="cert-eligible" {...register('certificate_eligible')} className="h-4 w-4 rounded border-gray-300 text-opsh-primary focus:ring-opsh-primary" />
              <label htmlFor="cert-eligible" className="text-sm font-medium text-gray-700">Certificate Eligible</label>
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label className={labelClass}>Notes</label>
              <textarea rows={3} {...register('notes')} className={inputClass + ' resize-none'} placeholder="CRM notes, follow-up actions, remarks..." />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            form="edit-enrollment-form"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-opsh-primary px-5 py-2 text-sm font-semibold text-white hover:bg-opsh-primary-hover disabled:opacity-50"
          >
            {mutation.isPending ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export default function AdminStudentsView() {
  const [search, setSearch]             = useState('');
  const [crmFilter, setCrmFilter]       = useState('');
  const [payFilter, setPayFilter]       = useState('');
  const [page, setPage]                 = useState(1);
  const [editing, setEditing]           = useState<AdminEnrollment | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-enrollments', search, crmFilter, payFilter, page],
    queryFn: () => getAdminEnrollments({
      search:         search || undefined,
      crm_status:     crmFilter || undefined,
      payment_status: payFilter || undefined,
      page,
      limit: 20,
    }),
  });

  const rows     = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;
  const total    = data?.total ?? 0;

  const inputCls = 'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-opsh-primary focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 transition-all';

  const fmt = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const phone = (e: AdminEnrollment) =>
    e.phone || e.user?.phone || '—';

  const email = (e: AdminEnrollment) =>
    e.email || e.user?.email || '—';

  const columns = [
    '#', 'Lead', 'Student', 'Phone/WA', 'Email',
    'Course', 'Plan', 'Batch', 'Class Time', 'Teacher',
    'Attend %', 'Cert', 'CRM', 'Payment', 'Enrolled', 'Action',
  ];

  return (
    <div className="space-y-5">
      <StatsBar />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className={inputCls + ' w-full pl-9'}
          />
        </div>

        <select value={crmFilter} onChange={(e) => { setCrmFilter(e.target.value); setPage(1); }} className={inputCls}>
          <option value="">All CRM</option>
          {CRM_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <select value={payFilter} onChange={(e) => { setPayFilter(e.target.value); setPage(1); }} className={inputCls}>
          <option value="">All Payment</option>
          {ENROLLMENT_PAYMENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
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
          Showing <strong>{rows.length}</strong> of <strong>{total}</strong> students
        </p>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-opsh-primary text-white">
              <tr>
                {columns.map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-3 text-left text-xs font-bold uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center">
                    <FaSpinner className="mx-auto animate-spin text-2xl text-opsh-primary" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-gray-400">No students found.</td>
                </tr>
              ) : (
                rows.map((e: AdminEnrollment) => {
                  const crm = getCrmStatusMeta(e.crm_status);
                  const pay = getEnrollmentPaymentMeta(e.payment_status);
                  return (
                    <tr key={e.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-3 py-3 font-bold text-opsh-primary">#{e.id}</td>
                      <td className="px-3 py-3 text-gray-500">{e.lead_id ?? '—'}</td>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-gray-800">{e.student_name}</p>
                        {e.user && (
                          <p className="text-xs text-gray-400">
                            {[e.user.first_name, e.user.last_name].filter(Boolean).join(' ')}
                          </p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-700">{phone(e)}</td>
                      <td className="px-3 py-3 max-w-40">
                        <p className="truncate text-gray-700">{email(e)}</p>
                      </td>
                      <td className="px-3 py-3 font-medium text-opsh-primary">
                        {e.batch?.course?.course_name ?? '—'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-600">
                        {e.batch?.batch_type ?? '—'}
                      </td>
                      <td className="px-3 py-3 text-gray-500">#{e.batch_id}</td>
                      <td className="px-3 py-3 text-gray-600">{e.batch?.class_time ?? '—'}</td>
                      <td className="px-3 py-3 text-gray-600">{e.teacher ?? '—'}</td>
                      <td className="px-3 py-3 text-center">
                        {e.attendance_percentage != null
                          ? <span className="font-semibold text-opsh-primary">{Number(e.attendance_percentage).toFixed(0)}%</span>
                          : '—'}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {e.certificate_eligible
                          ? <FaCheckCircle className="mx-auto text-emerald-500" />
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-3"><Badge label={crm.label} color={crm.color} /></td>
                      <td className="px-3 py-3"><Badge label={pay.label} color={pay.color} /></td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-gray-400">{fmt(e.enrollment_date)}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setEditing(e)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-opsh-primary/10 px-3 py-1.5 text-xs font-medium text-opsh-primary hover:bg-opsh-primary/20"
                        >
                          <FaUserGraduate className="text-xs" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-sm text-gray-500">Page {page} of {lastPage}</p>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                <FaChevronLeft className="text-xs" /> Prev
              </button>
              <button type="button" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                Next <FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>

      {editing && <EditModal enrollment={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

