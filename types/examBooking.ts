export type ExamBookingStatus =
  | 'new_request'
  | 'document_pending'
  | 'payment_pending'
  | 'booking_in_process'
  | 'booked'
  | 'cancelled';

export type TestType = 'IELTS' | 'PTE';

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
  user_id: number;
  user?: ExamBookingUser;
  test_type: TestType;
  preferred_date: string;
  test_location: string;
  passport_name: string;
  passport_number: string;
  date_of_birth: string;
  contact_number: string;
  email: string;
  passport_copy_path: string | null;
  passport_copy_original_name: string | null;
  special_message: string | null;
  status: ExamBookingStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExamBookingSubmitPayload {
  test_type: TestType;
  preferred_date: string;
  test_location: string;
  passport_name: string;
  passport_number: string;
  date_of_birth: string;
  contact_number: string;
  email: string;
  passport_copy: File;
  special_message?: string;
}

export interface ExamBookingStatusUpdatePayload {
  status: ExamBookingStatus;
  admin_notes?: string;
}

export interface PaginatedExamBookings {
  data: ExamBooking[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}
