'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaEnvelope,
  FaRedoAlt,
  FaSearch,
  FaSpinner,
  FaTimes,
  FaWhatsapp,
} from 'react-icons/fa';

import {
  getContactMessage,
  getContactMessageStats,
  getContactMessages,
  updateContactMessageStatus,
} from '@/apis/contactMessage.api';
import {
  CONTACT_STATUSES,
  getContactStatusMeta,
  type ContactMessage,
  type ContactMessageStatus,
  type ContactMessageStatusUpdatePayload,
} from '@/types/contactMessage';

function StatusBadge({ status }: { status: ContactMessageStatus }) {
  const meta = getContactStatusMeta(status);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.bg} ${meta.text} ${meta.border}`}
    >
      {meta.label}
    </span>
  );
}

function StatsBar() {
  const { data } = useQuery({
    queryKey: ['contact-message-stats'],
    queryFn: getContactMessageStats,
  });

  const cards = [
    { label: 'Total',       value: data?.total ?? 0,       cls: 'border-opsh-primary/20 bg-opsh-primary/5 text-opsh-primary' },
    { label: 'New',         value: data?.new ?? 0,          cls: 'border-blue-200 bg-blue-50 text-blue-700' },
    { label: 'In Progress', value: data?.in_progress ?? 0,  cls: 'border-amber-200 bg-amber-50 text-amber-700' },
    { label: 'Resolved',    value: data?.resolved ?? 0,     cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
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

function MessageDetailModal({
  messageId,
  onClose,
}: {
  messageId: number;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const { data: message, isLoading } = useQuery({
    queryKey: ['contact-message', messageId],
    queryFn: () => getContactMessage(messageId),
  });

  const { register, handleSubmit, setValue } = useForm<ContactMessageStatusUpdatePayload>({
    values: message
      ? { status: message.status, admin_notes: message.admin_notes ?? '' }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (payload: ContactMessageStatusUpdatePayload) =>
      updateContactMessageStatus(messageId, payload),
    onSuccess: () => {
      toast.success('Updated successfully.');
      void queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      void queryClient.invalidateQueries({ queryKey: ['contact-message-stats'] });
      void queryClient.invalidateQueries({ queryKey: ['contact-message', messageId] });
      onClose();
    },
    onError: () => toast.error('Failed to update.'),
  });

  const markFollowedUp = () => {
    if (!message) return;
    mutation.mutate({
      status: 'in_progress',
      admin_notes: message.admin_notes ?? '',
    });
  };

  const markResolved = () => {
    if (!message) return;
    mutation.mutate({
      status: 'replied',
      admin_notes: message.admin_notes ?? '',
    });
  };

  const whatsappUrl = (number: string, name: string) => {
    const cleaned = number.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Hi ${name}, thank you for reaching out to KTM Test Preparation Centre. We received your message and our team will get back to you shortly. How can we help you today?`
    );
    return `https://wa.me/${cleaned}?text=${text}`;
  };

  const emailUrl = (email: string, subject: string) => {
    const body = encodeURIComponent(
      `Hi,\n\nThank you for contacting KTM Test Preparation Centre.\n\nRegarding your message: "${subject}"\n\nWe have received your enquiry and would like to discuss further.\n\nBest regards,\nKTM Test Prep Team`
    );
    return `mailto:${email}?subject=Re: ${encodeURIComponent(subject)}&body=${body}`;
  };

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-opsh-primary focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 transition-all';

  const fmt = (d: string) =>
    new Date(d).toLocaleString('en-NP', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Message #{messageId}</h3>
            {message && (
              <p className="text-xs text-gray-500">
                {message.full_name} — {fmt(message.created_at)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-2xl text-opsh-primary" />
            </div>
          ) : message ? (
            <>
              {/* Sender info */}
              <div className="space-y-3 px-6 py-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Full Name</p>
                    <p className="font-semibold text-gray-800">{message.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Current Status</p>
                    <StatusBadge status={message.status} />
                  </div>
                </div>

                {/* Message */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Subject</p>
                  <p className="mt-1 font-semibold text-gray-800">{message.subject}</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {message.message}
                  </p>
                </div>

                {/* ── Follow-up actions ── */}
                <div className="rounded-xl border border-opsh-primary/20 bg-opsh-primary/5 p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-wide text-opsh-primary">
                    Follow Up
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={whatsappUrl(message.whatsapp_number, message.full_name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setValue('status', 'in_progress')}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
                    >
                      <FaWhatsapp />
                      WhatsApp {message.whatsapp_number}
                    </a>
                    <a
                      href={emailUrl(message.email, message.subject)}
                      onClick={() => setValue('status', 'in_progress')}
                      className="inline-flex items-center gap-2 rounded-xl bg-opsh-primary px-4 py-2 text-sm font-medium text-white hover:bg-opsh-primary-hover transition-colors"
                    >
                      <FaEnvelope />
                      Email Reply
                    </a>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={markFollowedUp}
                      disabled={mutation.isPending || message.status === 'in_progress'}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-40"
                    >
                      Mark In Progress
                    </button>
                    <button
                      type="button"
                      onClick={markResolved}
                      disabled={mutation.isPending || message.status === 'replied'}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-40"
                    >
                      <FaCheckCircle className="text-xs" />
                      Mark Replied
                    </button>
                  </div>
                </div>
              </div>

              {/* Status update form */}
              <form
                onSubmit={handleSubmit((values) => mutation.mutate(values))}
                className="space-y-4 border-t border-gray-100 px-6 pb-6 pt-4"
              >
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Update Status
                  </label>
                  <select {...register('status')} className={inputClass}>
                    {CONTACT_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Follow-up Notes{' '}
                    <span className="font-normal text-gray-400">(internal)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Log what action was taken, what was discussed, next steps..."
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
                    Save
                  </button>
                </div>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AdminContactMessagesView() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['contact-messages', statusFilter, search, page],
    queryFn: () =>
      getContactMessages({
        status: statusFilter || undefined,
        search: search || undefined,
        page,
        per_page: 20,
      }),
  });

  const messages = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-NP', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

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
            placeholder="Search by name, email, subject..."
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
          {CONTACT_STATUSES.map((s) => (
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
          Showing <strong>{messages.length}</strong> of <strong>{total}</strong>{' '}
          message{total !== 1 ? 's' : ''}
        </p>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-opsh-primary text-white">
              <tr>
                {['#', 'Sender', 'Subject', 'WhatsApp', 'Status', 'Received', 'Action'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <FaSpinner className="mx-auto animate-spin text-2xl text-opsh-primary" />
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                    No messages found.
                  </td>
                </tr>
              ) : (
                messages.map((msg: ContactMessage) => (
                  <tr
                    key={msg.id}
                    className={`transition-colors hover:bg-gray-50 ${msg.status === 'new' ? 'bg-blue-50/40' : ''}`}
                  >
                    <td className="px-4 py-3 text-sm font-bold text-opsh-primary">
                      #{msg.id}
                      {msg.status === 'new' && (
                        <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-800">{msg.full_name}</p>
                      <p className="text-xs text-gray-400">{msg.email}</p>
                    </td>
                    <td className="max-w-48 px-4 py-3">
                      <p className="truncate text-sm text-gray-700">{msg.subject}</p>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://wa.me/${msg.whatsapp_number.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        <FaWhatsapp />
                        {msg.whatsapp_number}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={msg.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{fmt(msg.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelectedId(msg.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-opsh-primary/10 px-3 py-1.5 text-xs font-medium text-opsh-primary transition-colors hover:bg-opsh-primary/20"
                      >
                        <FaEnvelope className="text-xs" />
                        Follow Up
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

      {selectedId !== null && (
        <MessageDetailModal
          messageId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
