import { api, Response } from "@/apis/https.api";
import { normalizeNotifications, normalizeUnreadCount } from "@/helper/notification/normalize";
import type { AppNotification } from "@/types/notification";

const NOTIFICATIONS_ENDPOINT = "/notifications";

export const getNotifications = async (signal?: AbortSignal): Promise<AppNotification[]> => {
  const response = await api.get<Response<unknown>>(NOTIFICATIONS_ENDPOINT, { signal });
  return normalizeNotifications(response.data);
};

export const getUnreadNotificationCount = async (signal?: AbortSignal): Promise<number> => {
  const response = await api.get<Response<unknown>>(`${NOTIFICATIONS_ENDPOINT}/unread-count`, { signal });
  return normalizeUnreadCount(response.data);
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await api.patch(`${NOTIFICATIONS_ENDPOINT}/${notificationId}/read`);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.patch(`${NOTIFICATIONS_ENDPOINT}/read-all`);
};
