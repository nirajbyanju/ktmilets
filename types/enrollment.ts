export type EnrollmentCrmStatus =
  | 'lead' | 'prospect' | 'active' | 'inactive' | 'completed' | 'dropped';

export type EnrollmentPaymentStatus =
  | 'pending' | 'partial' | 'paid' | 'waived' | 'refunded';

export const CRM_STATUSES: { value: EnrollmentCrmStatus; label: string; color: string }[] = [
  { value: 'lead',      label: 'Lead',      color: 'sky' },
  { value: 'prospect',  label: 'Prospect',  color: 'blue' },
  { value: 'active',    label: 'Active',    color: 'emerald' },
  { value: 'inactive',  label: 'Inactive',  color: 'gray' },
  { value: 'completed', label: 'Completed', color: 'purple' },
  { value: 'dropped',   label: 'Dropped',   color: 'red' },
];

export const ENROLLMENT_PAYMENT_STATUSES: { value: EnrollmentPaymentStatus; label: string; color: string }[] = [
  { value: 'pending',  label: 'Pending',  color: 'amber' },
  { value: 'partial',  label: 'Partial',  color: 'orange' },
  { value: 'paid',     label: 'Paid',     color: 'emerald' },
  { value: 'waived',   label: 'Waived',   color: 'blue' },
  { value: 'refunded', label: 'Refunded', color: 'red' },
];

export const getCrmStatusMeta = (s: string) =>
  CRM_STATUSES.find((x) => x.value === s) ?? { label: s, color: 'gray' };

export const getEnrollmentPaymentMeta = (s: string) =>
  ENROLLMENT_PAYMENT_STATUSES.find((x) => x.value === s) ?? { label: s, color: 'gray' };

export interface AdminEnrollmentBatch {
  id: number;
  batch_type: string;
  class_time: string | null;
  is_active: boolean;
  course?: { id: number; name: string };
}

export interface AdminEnrollmentUser {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export interface AdminEnrollment {
  id: number;
  lead_id: number | null;
  user_id: number | null;
  user?: AdminEnrollmentUser | null;
  student_name: string;
  phone: string | null;
  email: string | null;
  batch_id: number;
  batch?: AdminEnrollmentBatch | null;
  invoice_id: number | null;
  invoice?: { id: number; invoice_number: string; status: string; total_npr: string | number } | null;
  enrollment_date: string | null;
  amount_paid: string | number | null;
  status: string | null;
  payment_status: EnrollmentPaymentStatus;
  crm_status: EnrollmentCrmStatus;
  teacher: string | null;
  attendance_percentage: string | number | null;
  certificate_eligible: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminEnrollmentUpdatePayload {
  lead_id?: number | null;
  student_name?: string;
  phone?: string | null;
  email?: string | null;
  teacher?: string | null;
  attendance_percentage?: number | null;
  certificate_eligible?: boolean;
  payment_status?: EnrollmentPaymentStatus;
  crm_status?: EnrollmentCrmStatus;
  notes?: string | null;
  enrollment_date?: string | null;
  batch_id?: number;
  status?: string | null;
}

export interface AdminEnrollmentStats {
  total: number;
  paid: number;
  payment_due: number;
  completed: number;
  cert_eligible: number;
}

export interface PaginatedAdminEnrollments {
  data: AdminEnrollment[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}
