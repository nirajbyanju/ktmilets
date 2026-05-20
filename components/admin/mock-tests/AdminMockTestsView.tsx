'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  FaChevronLeft, FaChevronRight, FaEdit, FaPlus,
  FaRedoAlt, FaSearch, FaSpinner, FaTimes, FaTrash,
} from 'react-icons/fa';

import {
  createMockTestSubscription, deleteMockTestSubscription,
  getAdminMockTestSubscriptions, updateMockTestSubscription,
} from '@/apis/mock-test-subscription.api';
import {
  createMockTestEnrollment, deleteMockTestEnrollment,
  getAdminMockTestEnrollments, getMockTestEnrollmentStats,
} from '@/apis/mock-test-enrollment.api';
import type { MockTestSubscription, MockTestSubscriptionCreatePayload, MockTestSubscriptionUpdatePayload } from '@/types/mock-test-subscription';
import type { MockTestEnrollment, MockTestEnrollmentCreatePayload } from '@/types/mock-test-enrollment';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const npr = (v: string | number | null | undefined) =>
  v != null ? `NPR ${Number(v).toLocaleString('en-NP')}` : '—';

const INPUT =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-opsh-primary focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 transition-all';

// ── Invoice status badge ──────────────────────────────────────────────────────
function InvoiceBadge({ status }: { status: string }) {
  const cls =
    status === 'paid'   ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
    status === 'unpaid' ? 'bg-red-100 text-red-700 border-red-200'             :
                          'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>
      {status}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PLANS TAB
// ══════════════════════════════════════════════════════════════════════════════

function PlanForm({
  defaultValues, onSubmit, isPending, onCancel, submitLabel,
}: {
  defaultValues: Partial<MockTestSubscriptionCreatePayload>;
  onSubmit: (v: MockTestSubscriptionCreatePayload) => void;
  isPending: boolean;
  onCancel: () => void;
  submitLabel: string;
}) {
  const { register, handleSubmit } = useForm<MockTestSubscriptionCreatePayload>({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6 pt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Plan Name <span className="text-red-500">*</span></label>
          <input type="text" {...register('subscriptions_name', { required: true })} className={INPUT} placeholder="e.g. Alfa IELTS 1 Month" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Type <span className="text-red-500">*</span></label>
          <input type="text" {...register('subscriptions_type', { required: true })} className={INPUT} placeholder="e.g. IELTS, PTE" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
          <input type="text" {...register('subscriptions_category', { required: true })} className={INPUT} placeholder="e.g. Monthly, Weekly" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Company <span className="text-red-500">*</span></label>
          <input type="text" {...register('company_name', { required: true })} className={INPUT} placeholder="e.g. Alfa IELTS" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Country <span className="text-red-500">*</span></label>
          <input type="text" {...register('country', { required: true })} className={INPUT} placeholder="e.g. Nepal" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Price (NPR)</label>
          <input type="number" min={0} step="0.01" {...register('price', { valueAsNumber: true })} className={INPUT} placeholder="1500" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Discount (NPR)</label>
          <input type="number" min={0} step="0.01" {...register('discount', { valueAsNumber: true })} className={INPUT} placeholder="0" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Duration <span className="text-red-500">*</span></label>
          <input type="number" min={1} {...register('duration', { required: true, valueAsNumber: true })} className={INPUT} placeholder="1" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Duration Type <span className="text-red-500">*</span></label>
          <select {...register('duration_type', { required: true })} className={INPUT}>
            <option value="">Select…</option>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 rounded-xl bg-opsh-primary px-5 py-2 text-sm font-medium text-white hover:bg-opsh-primary-hover disabled:opacity-50">
          {isPending && <FaSpinner className="animate-spin" />}{submitLabel}
        </button>
      </div>
    </form>
  );
}

function CreatePlanModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: createMockTestSubscription,
    onSuccess: () => { toast.success('Plan created.'); void qc.invalidateQueries({ queryKey: ['mock-plans'] }); onClose(); },
    onError: () => toast.error('Failed to create plan.'),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-8" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-base font-bold text-gray-900">New Mock Test Plan</h3>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100"><FaTimes /></button>
        </div>
        <PlanForm defaultValues={{}} onSubmit={(v) => mutation.mutate(v)} isPending={mutation.isPending} onCancel={onClose} submitLabel="Create Plan" />
      </div>
    </div>
  );
}

function EditPlanModal({ plan, onClose }: { plan: MockTestSubscription; onClose: () => void }) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (p: MockTestSubscriptionUpdatePayload) => updateMockTestSubscription(plan.id, p),
    onSuccess: () => { toast.success('Plan updated.'); void qc.invalidateQueries({ queryKey: ['mock-plans'] }); onClose(); },
    onError: () => toast.error('Failed to update plan.'),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-8" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Edit Plan</h3>
            <p className="text-xs text-gray-500">{plan.subscriptions_name}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100"><FaTimes /></button>
        </div>
        <PlanForm
          defaultValues={{
            subscriptions_name:     plan.subscriptions_name,
            subscriptions_type:     plan.subscriptions_type,
            subscriptions_category: plan.subscriptions_category,
            company_name:           plan.company_name,
            country:                plan.country,
            price:                  plan.price != null ? Number(plan.price) : undefined,
            discount:               plan.discount != null ? Number(plan.discount) : undefined,
            duration:               plan.duration,
            duration_type:          plan.duration_type,
          }}
          onSubmit={(v) => mutation.mutate(v)}
          isPending={mutation.isPending}
          onCancel={onClose}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}

function DeletePlanConfirm({ plan, onClose }: { plan: MockTestSubscription; onClose: () => void }) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => deleteMockTestSubscription(plan.id),
    onSuccess: () => { toast.success('Plan deleted.'); void qc.invalidateQueries({ queryKey: ['mock-plans'] }); onClose(); },
    onError: () => toast.error('Failed to delete plan.'),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-bold text-gray-900">Delete Plan?</h3>
        <p className="mt-2 text-sm text-gray-500">
          Permanently delete <strong>{plan.subscriptions_name}</strong>? Existing enrollments linked to this plan will also be removed.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate()}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
            {mutation.isPending && <FaSpinner className="animate-spin" />}Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function PlansTab() {
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing]   = useState<MockTestSubscription | null>(null);
  const [deleting, setDeleting] = useState<MockTestSubscription | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['mock-plans', search, page],
    queryFn: () => getAdminMockTestSubscriptions({ search: search || undefined, page, limit: 20 }),
  });

  const plans    = data?.data      ?? [];
  const lastPage = data?.last_page ?? 1;
  const total    = data?.total     ?? 0;

  const BAR = 'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-opsh-primary focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 transition-all';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
          <input type="text" placeholder="Search plans…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className={`${BAR} w-full pl-9`} />
        </div>
        <button type="button" onClick={() => void refetch()} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
          {isFetching ? <FaSpinner className="animate-spin" /> : <FaRedoAlt />}Refresh
        </button>
        <button type="button" onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-xl bg-opsh-primary px-4 py-2 text-sm font-medium text-white hover:bg-opsh-primary-hover">
          <FaPlus className="text-xs" />New Plan
        </button>
      </div>

      {!isLoading && <p className="text-sm text-gray-500">Showing <strong>{plans.length}</strong> of <strong>{total}</strong> plan{total !== 1 ? 's' : ''}</p>}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-opsh-primary text-white">
              <tr>
                {['Plan Name', 'Type', 'Category', 'Company', 'Country', 'Price', 'Discount', 'Duration', 'Created', 'Actions'].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={10} className="py-16 text-center"><FaSpinner className="mx-auto animate-spin text-2xl text-opsh-primary" /></td></tr>
              ) : plans.length === 0 ? (
                <tr><td colSpan={10} className="py-12 text-center text-sm text-gray-400">No plans found. Create one to get started.</td></tr>
              ) : plans.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800">{p.subscriptions_name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{p.subscriptions_type}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{p.subscriptions_category}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{p.company_name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{p.country}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">{npr(p.price)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">{p.discount != null && Number(p.discount) > 0 ? npr(p.discount) : '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">{p.duration} {p.duration_type}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{fmt(p.created_at)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setEditing(p)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-opsh-primary/10 px-3 py-1.5 text-xs font-medium text-opsh-primary hover:bg-opsh-primary/20">
                        <FaEdit className="text-xs" />Edit
                      </button>
                      <button type="button" onClick={() => setDeleting(p)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100">
                        <FaTrash className="text-xs" />Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {lastPage > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-sm text-gray-500">Page {page} of {lastPage}</p>
            <div className="flex items-center gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
                <FaChevronLeft className="text-xs" />Prev
              </button>
              <button type="button" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
                Next<FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>

      {creating && <CreatePlanModal onClose={() => setCreating(false)} />}
      {editing  && <EditPlanModal   plan={editing}  onClose={() => setEditing(null)} />}
      {deleting && <DeletePlanConfirm plan={deleting} onClose={() => setDeleting(null)} />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ENROLLMENTS TAB
// ══════════════════════════════════════════════════════════════════════════════

function EnrollModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();

  const { data: plansData } = useQuery({
    queryKey: ['mock-plans-all'],
    queryFn: () => getAdminMockTestSubscriptions({ limit: 100 }),
  });
  const plans = plansData?.data ?? [];

  const { register, handleSubmit } = useForm<MockTestEnrollmentCreatePayload>({
    defaultValues: { enrollment_date: new Date().toISOString().slice(0, 10) },
  });

  const mutation = useMutation({
    mutationFn: createMockTestEnrollment,
    onSuccess: () => {
      toast.success('Enrolled. Invoice generated.');
      void qc.invalidateQueries({ queryKey: ['mock-enrollments'] });
      void qc.invalidateQueries({ queryKey: ['mock-enrollment-stats'] });
      onClose();
    },
    onError: () => toast.error('Failed to enroll student.'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-8" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Enroll Student</h3>
            <p className="text-xs text-gray-500">An invoice is auto-generated on submission.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100"><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4 px-6 pb-6 pt-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Plan <span className="text-red-500">*</span></label>
            <select {...register('subscription_id', { required: true, valueAsNumber: true })} className={INPUT}>
              <option value="">Select a plan…</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.subscriptions_name} — {p.subscriptions_type} · {p.duration} {p.duration_type} · {npr(p.price)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">User ID <span className="text-red-500">*</span></label>
            <input type="number" min={1} {...register('user_id', { required: true, valueAsNumber: true })} className={INPUT} placeholder="Enter user ID" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Enrollment Date <span className="text-red-500">*</span></label>
              <input type="date" {...register('enrollment_date', { required: true })} className={INPUT} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Start Date <span className="text-red-500">*</span></label>
              <input type="date" {...register('subscription_start', { required: true })} className={INPUT} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">End Date <span className="text-red-500">*</span></label>
              <input type="date" {...register('subscription_end', { required: true })} className={INPUT} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-opsh-primary px-5 py-2 text-sm font-medium text-white hover:bg-opsh-primary-hover disabled:opacity-50">
              {mutation.isPending && <FaSpinner className="animate-spin" />}Enroll & Generate Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteEnrollConfirm({ enrollment, onClose }: { enrollment: MockTestEnrollment; onClose: () => void }) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => deleteMockTestEnrollment(enrollment.id),
    onSuccess: () => {
      toast.success('Enrollment deleted.');
      void qc.invalidateQueries({ queryKey: ['mock-enrollments'] });
      void qc.invalidateQueries({ queryKey: ['mock-enrollment-stats'] });
      onClose();
    },
    onError: () => toast.error('Failed to delete enrollment.'),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-bold text-gray-900">Delete Enrollment?</h3>
        <p className="mt-2 text-sm text-gray-500">
          Remove enrollment for <strong>{enrollment.user?.first_name} {enrollment.user?.last_name}</strong>? The linked invoice will remain.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate()}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
            {mutation.isPending && <FaSpinner className="animate-spin" />}Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function EnrollmentsTab() {
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [enrolling, setEnrolling] = useState(false);
  const [deleting, setDeleting]   = useState<MockTestEnrollment | null>(null);

  const { data: stats } = useQuery({
    queryKey: ['mock-enrollment-stats'],
    queryFn:  getMockTestEnrollmentStats,
  });

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['mock-enrollments', search, page],
    queryFn: () => getAdminMockTestEnrollments({ search: search || undefined, page, limit: 20 }),
  });

  const enrollments = data?.data       ?? [];
  const lastPage    = data?.pagination?.last_page ?? 1;
  const total       = data?.pagination?.total     ?? 0;

  const BAR = 'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-opsh-primary focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 transition-all';

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',   value: stats?.total   ?? 0, cls: 'border-opsh-primary/20 bg-opsh-primary/5 text-opsh-primary' },
          { label: 'Active',  value: stats?.active  ?? 0, cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
          { label: 'Expired', value: stats?.expired ?? 0, cls: 'border-red-200 bg-red-50 text-red-700' },
        ].map((c) => (
          <div key={c.label} className={`rounded-2xl border px-4 py-3 ${c.cls}`}>
            <p className="text-xs font-medium opacity-75">{c.label}</p>
            <p className="mt-1 text-2xl font-black">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
          <input type="text" placeholder="Search by student or plan…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className={`${BAR} w-full pl-9`} />
        </div>
        <button type="button" onClick={() => void refetch()} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
          {isFetching ? <FaSpinner className="animate-spin" /> : <FaRedoAlt />}Refresh
        </button>
        <button type="button" onClick={() => setEnrolling(true)} className="inline-flex items-center gap-2 rounded-xl bg-opsh-primary px-4 py-2 text-sm font-medium text-white hover:bg-opsh-primary-hover">
          <FaPlus className="text-xs" />Enroll Student
        </button>
      </div>

      {!isLoading && <p className="text-sm text-gray-500">Showing <strong>{enrollments.length}</strong> of <strong>{total}</strong> enrollment{total !== 1 ? 's' : ''}</p>}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-opsh-primary text-white">
              <tr>
                {['Student', 'Plan', 'Duration', 'Invoice', 'Amount', 'Status', 'Enrolled', 'Start', 'End', 'Actions'].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={10} className="py-16 text-center"><FaSpinner className="mx-auto animate-spin text-2xl text-opsh-primary" /></td></tr>
              ) : enrollments.length === 0 ? (
                <tr><td colSpan={10} className="py-12 text-center text-sm text-gray-400">No enrollments yet.</td></tr>
              ) : enrollments.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="whitespace-nowrap font-semibold text-gray-800">
                      {e.user ? `${e.user.first_name ?? ''} ${e.user.last_name ?? ''}`.trim() : `User #${e.user_id}`}
                    </p>
                    {e.user?.email && <p className="text-xs text-gray-400">{e.user.email}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="whitespace-nowrap text-gray-700">{e.subscription?.subscriptions_name ?? '—'}</p>
                    {e.subscription?.subscriptions_type && <p className="text-xs text-gray-400">{e.subscription.subscriptions_type}</p>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {e.subscription ? `${e.subscription.duration} ${e.subscription.duration_type}` : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-opsh-primary">{e.invoice?.invoice_number ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">{e.invoice ? npr(e.invoice.total_npr) : '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {e.invoice ? <InvoiceBadge status={e.invoice.status} /> : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{fmt(e.enrollment_date)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">{fmt(e.subscription_start)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">{fmt(e.subscription_end)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button type="button" onClick={() => setDeleting(e)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100">
                      <FaTrash className="text-xs" />Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {lastPage > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-sm text-gray-500">Page {page} of {lastPage}</p>
            <div className="flex items-center gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
                <FaChevronLeft className="text-xs" />Prev
              </button>
              <button type="button" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
                Next<FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>

      {enrolling && <EnrollModal onClose={() => setEnrolling(false)} />}
      {deleting  && <DeleteEnrollConfirm enrollment={deleting} onClose={() => setDeleting(null)} />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ROOT VIEW
// ══════════════════════════════════════════════════════════════════════════════

export default function AdminMockTestsView() {
  const [tab, setTab] = useState<'plans' | 'enrollments'>('plans');

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit">
        {(['plans', 'enrollments'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`rounded-lg px-5 py-2 text-sm font-semibold capitalize transition-all ${
              tab === t ? 'bg-white text-opsh-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'plans' ? 'Subscription Plans' : 'Enrollments'}
          </button>
        ))}
      </div>

      {tab === 'plans'       && <PlansTab />}
      {tab === 'enrollments' && <EnrollmentsTab />}
    </div>
  );
}
