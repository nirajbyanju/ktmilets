import { api } from '@/apis/https.api';
import type {
  AdminEnrollment,
  AdminEnrollmentStats,
  AdminEnrollmentUpdatePayload,
  PaginatedAdminEnrollments,
} from '@/types/enrollment';

const handleError = (error: unknown) => {
  const e = error as { response?: { data?: unknown } };
  return Promise.reject(e.response?.data ?? error);
};

export const getMyEnrollments = async (params?: {
  search?: string;
  batch_id?: number;
  page?: number;
  limit?: number;
}): Promise<PaginatedAdminEnrollments> => {
  try {
    const res = await api.get<{ success: boolean; data: PaginatedAdminEnrollments }>(
      '/enrollments',
      { params }
    );
    return res.data.data;
  } catch (e) { return handleError(e); }
};

export const getAdminEnrollmentStats = async (): Promise<AdminEnrollmentStats> => {
  try {
    const res = await api.get<{ success: boolean; data: AdminEnrollmentStats }>('/admin/enrollments/stats');
    return res.data.data;
  } catch (e) { return handleError(e); }
};

export const getAdminEnrollments = async (params?: {
  search?: string;
  crm_status?: string;
  payment_status?: string;
  batch_id?: number;
  page?: number;
  limit?: number;
}): Promise<PaginatedAdminEnrollments> => {
  try {
    const res = await api.get<{ success: boolean; data: PaginatedAdminEnrollments }>(
      '/admin/enrollments',
      { params }
    );
    return res.data.data;
  } catch (e) { return handleError(e); }
};

export const updateAdminEnrollment = async (
  id: number,
  payload: AdminEnrollmentUpdatePayload
): Promise<AdminEnrollment> => {
  try {
    const res = await api.patch<{ success: boolean; data: AdminEnrollment }>(
      `/admin/enrollments/${id}`,
      payload
    );
    return res.data.data;
  } catch (e) { return handleError(e); }
};
