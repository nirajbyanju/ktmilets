import { api } from '@/apis/https.api';
import type {
  ExamBooking,
  ExamBookingStatusUpdatePayload,
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

export const submitExamBooking = async (payload: ExamBookingSubmitPayload): Promise<ExamBooking> => {
  const formData = new FormData();
  formData.append('test_type', payload.test_type);
  formData.append('preferred_date', payload.preferred_date);
  formData.append('test_location', payload.test_location);
  formData.append('passport_name', payload.passport_name);
  formData.append('passport_number', payload.passport_number);
  formData.append('date_of_birth', payload.date_of_birth);
  formData.append('contact_number', payload.contact_number);
  formData.append('email', payload.email);
  formData.append('passport_copy', payload.passport_copy);
  if (payload.special_message) {
    formData.append('special_message', payload.special_message);
  }

  try {
    const response = await api.post<{ success: boolean; data: ExamBooking }>('/exam-bookings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const getMyExamBookings = async (): Promise<ExamBooking[]> => {
  try {
    const response = await api.get<{ success: boolean; data: ExamBooking[] }>('/exam-bookings');
    return response.data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const getAllExamBookings = async (params?: {
  status?: string;
  test_type?: string;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedExamBookings> => {
  try {
    const response = await api.get<{ success: boolean; data: PaginatedExamBookings }>('/admin/exam-bookings', { params });
    return response.data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const updateExamBookingStatus = async (
  id: number,
  payload: ExamBookingStatusUpdatePayload
): Promise<ExamBooking> => {
  try {
    const response = await api.patch<{ success: boolean; data: ExamBooking }>(
      `/admin/exam-bookings/${id}/status`,
      payload
    );
    return response.data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const downloadPassportCopy = async (bookingId: number, filename: string): Promise<void> => {
  try {
    const response = await api.get(`/exam-bookings/${bookingId}/passport`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || 'passport_copy');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: unknown) {
    return handleApiError(error);
  }
};
