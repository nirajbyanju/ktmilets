import { api } from '@/apis/https.api';
import type { Invoice, InvoiceListResponse } from '@/types/invoice';

const handleError = (error: unknown) => {
  const e = error as { response?: { data?: unknown } };
  return Promise.reject(e.response?.data ?? error);
};

const fallbackPagination = { total: 0, per_page: 100, current_page: 1, last_page: 1 };

// ── Fetch invoices (admin sees all, user sees own) ────────────────────────────

export const getInvoices = async (params?: {
  status?: string;
  type?: 'course' | 'mock_test' | 'exam';
  page?: number;
  limit?: number;
}): Promise<InvoiceListResponse> => {
  try {
    const res = await api.get<{ success: boolean; data: Invoice[]; pagination: InvoiceListResponse['pagination'] }>(
      '/invoices',
      { params: { limit: 100, ...params } }
    );
    return { data: res.data.data, pagination: res.data.pagination ?? fallbackPagination };
  } catch (e) { return handleError(e); }
};

export const getInvoice = async (id: number): Promise<Invoice> => {
  try {
    const res = await api.get<{ success: boolean; data: Invoice }>(`/invoices/${id}`);
    return res.data.data;
  } catch (e) { return handleError(e); }
};

// ── Create invoice for course batch ──────────────────────────────────────────

export const createCourseInvoice = async (
  batchId: number,
  options?: { payment_method?: string; notes?: string }
): Promise<Invoice> => {
  try {
    const res = await api.post<{ success: boolean; data: Invoice }>('/invoices', {
      batch_id: batchId,
      payment_method: 'bank_qr',
      ...options,
    });
    return res.data.data;
  } catch (e) { return handleError(e); }
};

// ── Create invoice for mock test subscription ─────────────────────────────────

export const createMockTestInvoice = async (
  mockTestSubscriptionId: number,
  options?: { payment_method?: string; notes?: string }
): Promise<Invoice> => {
  try {
    const res = await api.post<{ success: boolean; data: Invoice }>('/invoices/mock-test', {
      mock_test_subscription_id: mockTestSubscriptionId,
      payment_method: 'bank_qr',
      ...options,
    });
    return res.data.data;
  } catch (e) { return handleError(e); }
};

// ── Create invoice for exam booking ──────────────────────────────────────────

export const createExamInvoice = async (
  examBookingEnrollmentId: number,
  options?: { payment_method?: string; notes?: string }
): Promise<Invoice> => {
  try {
    const res = await api.post<{ success: boolean; data: Invoice }>('/invoices/exam-booking', {
      exam_booking_enrollment_id: examBookingEnrollmentId,
      payment_method: 'bank_qr',
      ...options,
    });
    return res.data.data;
  } catch (e) { return handleError(e); }
};

// ── Mark paid (admin only) ────────────────────────────────────────────────────

export const markInvoicePaid = async (invoiceId: number, notes?: string): Promise<Invoice> => {
  try {
    const res = await api.patch<{ success: boolean; data: Invoice }>(
      `/invoices/${invoiceId}/mark-paid`,
      { notes }
    );
    return res.data.data;
  } catch (e) { return handleError(e); }
};
