import { api } from '@/apis/https.api';
import type {
  ExamBookingAdminUpdatePayload,
  ExamBookingEnrollment,
  ExamBookingPlan,
  ExamBookingPlanCreatePayload,
  ExamBookingPlanUpdatePayload,
  ExamBookingStats,
  ExamBookingSubmitPayload,
  PaginatedExamBookings,
} from '@/types/examBooking';

const handleApiError = (error: unknown) => {
  const apiError = error as { response?: { data?: unknown } };
  if (apiError.response?.data) {
    return Promise.reject(apiError.response.data);
  }
  return Promise.reject(error);
};

// ── Plans ─────────────────────────────────────────────────────────────────────

export const getExamBookingPlans = async (): Promise<ExamBookingPlan[]> => {
  try {
    const res = await api.get<{ success: boolean; data: ExamBookingPlan[] }>('/public/exam-booking-plans');
    return res.data.data;
  } catch (e) { return handleApiError(e); }
};

export const getAdminExamBookingPlans = async (): Promise<ExamBookingPlan[]> => {
  try {
    const res = await api.get<{ success: boolean; data: ExamBookingPlan[] }>('/admin/exam-booking-plans');
    return res.data.data;
  } catch (e) { return handleApiError(e); }
};

export const createExamBookingPlan = async (
  payload: ExamBookingPlanCreatePayload
): Promise<ExamBookingPlan> => {
  try {
    const res = await api.post<{ success: boolean; data: ExamBookingPlan }>(
      '/admin/exam-booking-plans',
      payload
    );
    return res.data.data;
  } catch (e) { return handleApiError(e); }
};

export const updateExamBookingPlan = async (
  id: number,
  payload: ExamBookingPlanUpdatePayload
): Promise<ExamBookingPlan> => {
  try {
    const res = await api.patch<{ success: boolean; data: ExamBookingPlan }>(
      `/admin/exam-booking-plans/${id}`,
      payload
    );
    return res.data.data;
  } catch (e) { return handleApiError(e); }
};

export const deleteExamBookingPlan = async (id: number): Promise<void> => {
  try {
    await api.delete(`/admin/exam-booking-plans/${id}`);
  } catch (e) { return handleApiError(e); }
};

// ── Enrollments ───────────────────────────────────────────────────────────────

export const submitExamBooking = async (
  payload: ExamBookingSubmitPayload
): Promise<ExamBookingEnrollment> => {
  const formData = new FormData();
  formData.append('exam_booking_id',      String(payload.exam_booking_id));
  formData.append('preferred_date',       payload.preferred_date);
  formData.append('passport_name',        payload.passport_name);
  formData.append('passport_number',      payload.passport_number);
  formData.append('date_of_birth',        payload.date_of_birth);
  formData.append('email',                payload.email);
  formData.append('passport_copy',        payload.passport_copy);
  if (payload.contact_number)      formData.append('contact_number',      payload.contact_number);
  if (payload.phone)               formData.append('phone',               payload.phone);
  if (payload.preferred_time)      formData.append('preferred_time',      payload.preferred_time);
  if (payload.preferred_test_centre) formData.append('preferred_test_centre', payload.preferred_test_centre);
  if (payload.test_location)       formData.append('test_location',       payload.test_location);
  if (payload.special_message)     formData.append('special_message',     payload.special_message);

  try {
    const res = await api.post<{ success: boolean; data: ExamBookingEnrollment }>(
      '/exam-bookings',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data.data;
  } catch (e) { return handleApiError(e); }
};

export const getMyExamBookings = async (): Promise<ExamBookingEnrollment[]> => {
  try {
    const res = await api.get<{ success: boolean; data: ExamBookingEnrollment[] }>('/exam-bookings');
    return res.data.data;
  } catch (e) { return handleApiError(e); }
};

export const getAllExamBookings = async (params?: {
  status?: string;
  exam_type?: string;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedExamBookings> => {
  try {
    const res = await api.get<{ success: boolean; data: PaginatedExamBookings }>(
      '/admin/exam-bookings',
      { params }
    );
    return res.data.data;
  } catch (e) { return handleApiError(e); }
};

export const getExamBookingStats = async (): Promise<ExamBookingStats> => {
  try {
    const res = await api.get<{ success: boolean; data: ExamBookingStats }>(
      '/admin/exam-bookings/stats'
    );
    return res.data.data;
  } catch (e) { return handleApiError(e); }
};

export const updateExamBooking = async (
  id: number,
  payload: ExamBookingAdminUpdatePayload
): Promise<ExamBookingEnrollment> => {
  try {
    const res = await api.patch<{ success: boolean; data: ExamBookingEnrollment }>(
      `/admin/exam-bookings/${id}`,
      payload
    );
    return res.data.data;
  } catch (e) { return handleApiError(e); }
};

export const deleteExamBookingEnrollment = async (id: number): Promise<void> => {
  try {
    await api.delete(`/admin/exam-bookings/${id}`);
  } catch (e) { return handleApiError(e); }
};

export const downloadPassportCopy = async (
  enrollmentId: number,
  filename: string
): Promise<void> => {
  try {
    const res = await api.get(`/exam-bookings/${enrollmentId}/passport`, {
      responseType: 'blob',
    });
    const url  = window.URL.createObjectURL(new Blob([res.data as BlobPart]));
    const link = document.createElement('a');
    link.href  = url;
    link.setAttribute('download', filename || 'passport_copy');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (e) { return handleApiError(e); }
};
