export type InvoiceStatus = 'unpaid' | 'paid';
export type InvoiceType = 'course' | 'mock_test' | 'exam' | 'unknown';

export interface InvoiceUser {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export interface InvoiceBatch {
  id: number;
  batch_type?: string;
  course?: { id: number; course_name: string };
}

export interface InvoiceMockTestSubscription {
  id: number;
  subscription_id: string;
  course?: string | null;
  package?: string | null;
  platform?: string | null;
}

export interface InvoiceExamBooking {
  id: number;
  test_type: string;
  preferred_date?: string;
  test_location?: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  status: InvoiceStatus;
  type: InvoiceType;
  subtotal_npr: string | number;
  discount_npr: string | number;
  tax_npr: string | number;
  total_npr: string | number;
  invoice_date: string;
  due_date: string;
  payment_method: string;
  verified_at: string | null;
  notes: string | null;
  user_id: number | null;
  batch_id: number | null;
  mock_test_subscription_id: number | null;
  exam_booking_enrollment_id: number | null;
  user?: InvoiceUser | null;
  batch?: InvoiceBatch | null;
  mock_test_subscription?: InvoiceMockTestSubscription | null;
  exam_booking_enrollment?: InvoiceExamBooking | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceListResponse {
  data: Invoice[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export const invoiceTypeLabel = (invoice: Invoice): string => {
  switch (invoice.type) {
    case 'course':    return invoice.batch?.course?.course_name ?? 'Course';
    case 'mock_test': return invoice.mock_test_subscription?.course ?? 'Mock Test';
    case 'exam':      return invoice.exam_booking_enrollment?.test_type ?? 'Exam Booking';
    default:          return 'Invoice';
  }
};

export const invoiceTypeBadge = (type: InvoiceType): string => {
  switch (type) {
    case 'course':    return 'bg-blue-100 text-blue-700';
    case 'mock_test': return 'bg-purple-100 text-purple-700';
    case 'exam':      return 'bg-amber-100 text-amber-700';
    default:          return 'bg-slate-100 text-slate-600';
  }
};
