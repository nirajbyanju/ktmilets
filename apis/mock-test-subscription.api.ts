import { api, publicApi } from '@/apis/https.api';
import type {
  MockTestSubscription,
  MockTestSubscriptionCreatePayload,
  MockTestSubscriptionStats,
  MockTestSubscriptionUpdatePayload,
  PaginatedMockTestSubscriptions,
} from '@/types/mock-test-subscription';

const handleError = (error: unknown) => {
  const e = error as { response?: { data?: unknown } };
  return Promise.reject(e.response?.data ?? error);
};

export const getMockTestPlans = async (params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedMockTestSubscriptions> => {
  try {
    const res = await publicApi.get<{ success: boolean; data: PaginatedMockTestSubscriptions }>(
      '/public/mock-test-subscriptions',
      { params }
    );
    return res.data.data;
  } catch (e) { return handleError(e); }
};

export const getMockTestSubscriptionStats = async (): Promise<MockTestSubscriptionStats> => {
  try {
    const res = await api.get<{ success: boolean; data: MockTestSubscriptionStats }>(
      '/admin/mock-test-subscriptions/stats'
    );
    return res.data.data;
  } catch (e) { return handleError(e); }
};

export const getAdminMockTestSubscriptions = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedMockTestSubscriptions> => {
  try {
    const res = await api.get<{ success: boolean; data: PaginatedMockTestSubscriptions }>(
      '/admin/mock-test-subscriptions',
      { params }
    );
    return res.data.data;
  } catch (e) { return handleError(e); }
};

export const createMockTestSubscription = async (
  payload: MockTestSubscriptionCreatePayload
): Promise<MockTestSubscription> => {
  try {
    const res = await api.post<{ success: boolean; data: MockTestSubscription }>(
      '/admin/mock-test-subscriptions',
      payload
    );
    return res.data.data;
  } catch (e) { return handleError(e); }
};

export const updateMockTestSubscription = async (
  id: number,
  payload: MockTestSubscriptionUpdatePayload
): Promise<MockTestSubscription> => {
  try {
    const res = await api.patch<{ success: boolean; data: MockTestSubscription }>(
      `/admin/mock-test-subscriptions/${id}`,
      payload
    );
    return res.data.data;
  } catch (e) { return handleError(e); }
};

export const deleteMockTestSubscription = async (id: number): Promise<void> => {
  try {
    await api.delete(`/admin/mock-test-subscriptions/${id}`);
  } catch (e) { return handleError(e); }
};
