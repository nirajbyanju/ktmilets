// ── Booking status ────────────────────────────────────────────────────────────
export type ExamBookingStatus =
  | 'new_request'
  | 'document_pending'
  | 'payment_pending'
  | 'booking_in_process'
  | 'booked'
  | 'cancelled';

export const EXAM_BOOKING_STATUSES: { value: ExamBookingStatus; label: string; color: string }[] = [
  { value: 'new_request',        label: 'New Request',        color: 'blue' },
  { value: 'document_pending',   label: 'Document Pending',   color: 'amber' },
  { value: 'payment_pending',    label: 'Payment Pending',    color: 'orange' },
  { value: 'booking_in_process', label: 'Booking in Process', color: 'purple' },
  { value: 'booked',             label: 'Booked',             color: 'emerald' },
  { value: 'cancelled',          label: 'Cancelled',          color: 'red' },
];

export const STATUS_WORKFLOW: ExamBookingStatus[] = [
  'new_request',
  'document_pending',
  'payment_pending',
  'booking_in_process',
  'booked',
];

export const getStatusMeta = (status: ExamBookingStatus) =>
  EXAM_BOOKING_STATUSES.find((s) => s.value === status) ?? EXAM_BOOKING_STATUSES[0];

// ── Payment status ────────────────────────────────────────────────────────────
export type PaymentStatus = 'pending' | 'paid' | 'waived' | 'refunded';

export const PAYMENT_STATUSES: { value: PaymentStatus; label: string; color: string }[] = [
  { value: 'pending',  label: 'Pending',  color: 'amber' },
  { value: 'paid',     label: 'Paid',     color: 'emerald' },
  { value: 'waived',   label: 'Waived',   color: 'blue' },
  { value: 'refunded', label: 'Refunded', color: 'red' },
];

export const getPaymentStatusMeta = (status: PaymentStatus) =>
  PAYMENT_STATUSES.find((s) => s.value === status) ?? PAYMENT_STATUSES[0];

// ── Test type ─────────────────────────────────────────────────────────────────
export type TestType = 'IELTS' | 'PTE';

// ── Entities ──────────────────────────────────────────────────────────────────
export interface ExamBookingUser {
  id: number;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface ExamBooking {
  id: number;
  lead_id: number | null;
  user_id: number;
  user?: ExamBookingUser;

  // Student info
  student_name: string;
  phone: string;
  email: string;

  // Test preferences
  test_type: TestType;
  preferred_date: string;
  preferred_time: string | null;
  preferred_test_centre: string;

  // Passport / identity
  passport_name: string;
  passport_number: string;
  date_of_birth: string;
  passport_copy_path: string | null;
  passport_copy_original_name: string | null;

  // PTE-specific admin fields
  pte_login_details_received: boolean;
  pte_username_email: string | null;
  pte_password_notes: string | null;

  // Admin workflow
  available_slot_checked: boolean;
  status: ExamBookingStatus;
  payment_status: PaymentStatus;
  admin_notes: string | null;
  special_message: string | null;

  created_at: string;
  updated_at: string;
}

// ── Payloads ──────────────────────────────────────────────────────────────────
export interface ExamBookingSubmitPayload {
  test_type: TestType;
  student_name: string;
  phone: string;
  email: string;
  preferred_date: string;
  preferred_time?: string;
  preferred_test_centre: string;
  passport_name: string;
  passport_number: string;
  date_of_birth: string;
  passport_copy: File;
  special_message?: string;
}

export interface ExamBookingAdminUpdatePayload {
  status: ExamBookingStatus;
  payment_status: PaymentStatus;
  available_slot_checked: boolean;
  pte_login_details_received: boolean;
  pte_username_email?: string;
  pte_password_notes?: string;
  admin_notes?: string;
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface PaginatedExamBookings {
  data: ExamBooking[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export interface ExamBookingStats {
  total: number;
  new_request: number;
  booked: number;
  payment_pending: number;
  cancelled: number;
}
