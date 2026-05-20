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

// ── Exam types ────────────────────────────────────────────────────────────────
export const EXAM_TYPES = ['IELTS', 'PTE', 'TOEFL', 'Duolingo'] as const;
export type ExamType = (typeof EXAM_TYPES)[number];

// ── Plan catalog (exam_bookings) ──────────────────────────────────────────────
export interface ExamBookingPlan {
  id: number;
  exam_name: string | null;
  exam_type: string;
  price: string | number | null;
  discount: string | number | null;
  enrollments_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ExamBookingPlanCreatePayload {
  exam_name?: string;
  exam_type: string;
  price?: number | null;
  discount?: number | null;
}

export type ExamBookingPlanUpdatePayload = Partial<ExamBookingPlanCreatePayload>;

// ── Enrollment (exam_bookings_enrollments) ────────────────────────────────────
export interface ExamBookingUser {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export interface ExamBookingInvoice {
  id: number;
  invoice_number: string;
  status: string;
  total_npr: string | number;
}

export interface ExamBookingEnrollment {
  id: number;
  user_id: number;
  exam_booking_id: number;
  user?: ExamBookingUser;
  examBooking?: ExamBookingPlan;
  exam_booking?: ExamBookingPlan;
  invoice?: ExamBookingInvoice;

  preferred_date: string;
  preferred_time: string | null;
  test_location: string | null;
  preferred_test_centre: string | null;
  passport_name: string;
  passport_number: string;
  date_of_birth: string;
  contact_number: string;
  phone: string | null;
  email: string;
  passport_copy_path: string | null;
  passport_copy_original_name: string | null;
  special_message: string | null;

  status: ExamBookingStatus;
  available_slot_checked: boolean;
  admin_notes: string | null;

  created_at: string;
  updated_at: string;
}

// ── Payloads ──────────────────────────────────────────────────────────────────
export interface ExamBookingSubmitPayload {
  exam_booking_id: number;
  preferred_date: string;
  preferred_time?: string;
  preferred_test_centre?: string;
  test_location?: string;
  passport_name: string;
  passport_number: string;
  date_of_birth: string;
  contact_number?: string;
  phone?: string;
  email: string;
  passport_copy: File;
  special_message?: string;
}

export interface ExamBookingAdminUpdatePayload {
  status?: ExamBookingStatus;
  available_slot_checked?: boolean;
  admin_notes?: string;
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface PaginatedExamBookings {
  data: ExamBookingEnrollment[];
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
