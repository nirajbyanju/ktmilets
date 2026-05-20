import { api } from '@/apis/https.api';
import type {
  MockTestEnrollment,
  MockTestEnrollmentCreatePayload,
  MockTestEnrollmentListResponse,
  MockTestEnrollmentStats,
} from '@/types/mock-test-enrollment';

const handleError = (error: unknown) => {
  const e = error as { response?: { data?: unknown } };
  return Promise.reject(e.response?.data ?? error);
};

export const getMyMockTestEnrollments = async (params?: {
  page?: number;
  limit?: number;
}): Promise<MockTestEnrollmentListResponse> => {
  try {
    const res = await api.get<{ success: boolean; data: MockTestEnrollment[]; pagination: MockTestEnrollmentListResponse['pagination'] }>(
      '/mock-test-enrollments',
      { params }
    );
    return { data: res.data.data, pagination: res.data.pagination };
  } catch (e) { return handleError(e); }
};

export const getMockTestEnrollment = async (id: number): Promise<MockTestEnrollment> => {
  try {
    const res = await api.get<{ success: boolean; data: MockTestEnrollment }>(`/mock-test-enrollments/${id}`);
    return res.data.data;
  } catch (e) { return handleError(e); }
};

export const getMockTestEnrollmentStats = async (): Promise<MockTestEnrollmentStats> => {
  try {
    const res = await api.get<{ success: boolean; data: MockTestEnrollmentStats }>(
      '/admin/mock-test-enrollments/stats'
    );
    return res.data.data;
  } catch (e) { return handleError(e); }
};

export const getAdminMockTestEnrollments = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<MockTestEnrollmentListResponse> => {
  try {
    const res = await api.get<{ success: boolean; data: MockTestEnrollment[]; pagination: MockTestEnrollmentListResponse['pagination'] }>(
      '/admin/mock-test-enrollments',
      { params }
    );
    return { data: res.data.data, pagination: res.data.pagination };
  } catch (e) { return handleError(e); }
};

export const createMockTestEnrollment = async (
  payload: MockTestEnrollmentCreatePayload
): Promise<MockTestEnrollment> => {
  try {
    const res = await api.post<{ success: boolean; data: MockTestEnrollment }>(
      '/admin/mock-test-enrollments',
      payload
    );
    return res.data.data;
  } catch (e) { return handleError(e); }
};

export const updateMockTestEnrollment = async (
  id: number,
  payload: { subscription_start?: string; subscription_end?: string }
): Promise<MockTestEnrollment> => {
  try {
    const res = await api.patch<{ success: boolean; data: MockTestEnrollment }>(
      `/admin/mock-test-enrollments/${id}`,
      payload
    );
    return res.data.data;
  } catch (e) { return handleError(e); }
};

export const deleteMockTestEnrollment = async (id: number): Promise<void> => {
  try {
    await api.delete(`/admin/mock-test-enrollments/${id}`);
  } catch (e) { return handleError(e); }
};
