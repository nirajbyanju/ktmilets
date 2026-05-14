export type ContactMessageStatus =
  | 'new'
  | 'read'
  | 'in_progress'
  | 'replied'
  | 'resolved'
  | 'spam';

export const CONTACT_STATUSES: {
  value: ContactMessageStatus;
  label: string;
  color: string;
  bg: string;
  text: string;
  border: string;
}[] = [
  { value: 'new',         label: 'New',         color: 'blue',   bg: 'bg-blue-100',    text: 'text-blue-700',    border: 'border-blue-200' },
  { value: 'read',        label: 'Read',         color: 'slate',  bg: 'bg-slate-100',   text: 'text-slate-600',   border: 'border-slate-200' },
  { value: 'in_progress', label: 'In Progress',  color: 'amber',  bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-200' },
  { value: 'replied',     label: 'Replied',      color: 'purple', bg: 'bg-purple-100',  text: 'text-purple-700',  border: 'border-purple-200' },
  { value: 'resolved',    label: 'Resolved',     color: 'emerald',bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  { value: 'spam',        label: 'Spam',         color: 'red',    bg: 'bg-red-100',     text: 'text-red-600',     border: 'border-red-200' },
];

export const getContactStatusMeta = (status: ContactMessageStatus) =>
  CONTACT_STATUSES.find((s) => s.value === status) ?? CONTACT_STATUSES[0];

export interface ContactMessage {
  id: number;
  full_name: string;
  email: string;
  whatsapp_number: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  admin_notes: string | null;
  ip_address: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactMessageSubmitPayload {
  full_name: string;
  email: string;
  whatsapp_number: string;
  subject: string;
  message: string;
}

export interface ContactMessageSubmitResult {
  id: number;
  reference: string;
  created_at: string;
}

export interface ContactMessageStatusUpdatePayload {
  status: ContactMessageStatus;
  admin_notes?: string;
}

export interface ContactMessageStats {
  total: number;
  new: number;
  read: number;
  in_progress: number;
  replied: number;
  resolved: number;
  spam: number;
}

export interface PaginatedContactMessages {
  data: ContactMessage[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}
