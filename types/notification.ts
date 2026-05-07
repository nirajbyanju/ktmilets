export interface AppNotification {
  id: string;
  title: string;
  message: string;
  url?: string;
  category?: string;
  actor?: string;
  createdAt?: string;
  readAt?: string;
  isRead: boolean;
  raw?: unknown;
}
