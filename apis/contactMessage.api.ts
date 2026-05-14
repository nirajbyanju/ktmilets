import { api } from '@/apis/https.api';
import type {
  ContactMessage,
  ContactMessageStats,
  ContactMessageStatusUpdatePayload,
  ContactMessageSubmitPayload,
  ContactMessageSubmitResult,
  PaginatedContactMessages,
} from '@/types/contactMessage';

const handleApiError = (error: unknown) => {
  const apiError = error as { response?: { data?: unknown } };
  if (apiError.response?.data) return Promise.reject(apiError.response.data);
  return Promise.reject(error);
};

export const submitContactMessage = async (
  payload: ContactMessageSubmitPayload
): Promise<ContactMessageSubmitResult> => {
  try {
    const response = await api.post<{ success: boolean; data: ContactMessageSubmitResult }>(
      '/public/contact',
      payload
    );
    return response.data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const getContactMessages = async (params?: {
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedContactMessages> => {
  try {
    const response = await api.get<{ success: boolean; data: PaginatedContactMessages }>(
      '/admin/contact-messages',
      { params }
    );
    return response.data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const getContactMessageStats = async (): Promise<ContactMessageStats> => {
  try {
    const response = await api.get<{ success: boolean; data: ContactMessageStats }>(
      '/admin/contact-messages/stats'
    );
    return response.data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const getContactMessage = async (id: number): Promise<ContactMessage> => {
  try {
    const response = await api.get<{ success: boolean; data: ContactMessage }>(
      `/admin/contact-messages/${id}`
    );
    return response.data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const updateContactMessageStatus = async (
  id: number,
  payload: ContactMessageStatusUpdatePayload
): Promise<ContactMessage> => {
  try {
    const response = await api.patch<{ success: boolean; data: ContactMessage }>(
      `/admin/contact-messages/${id}/status`,
      payload
    );
    return response.data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};
