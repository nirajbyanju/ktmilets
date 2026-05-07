import type { AppNotification } from "@/types/notification";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readRecord = (value: unknown): UnknownRecord | null => (isRecord(value) ? value : null);

const readString = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }

  return fallback;
};

const readNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = Number(value.trim());
    return Number.isFinite(normalized) ? normalized : null;
  }

  return null;
};

const readBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "no"].includes(normalized)) {
      return false;
    }
  }

  return fallback;
};

const extractPayload = (payload: unknown): unknown => {
  if (!isRecord(payload)) {
    return payload;
  }

  const firstLevel = payload.data ?? payload.result ?? payload.payload;
  return firstLevel !== undefined ? firstLevel : payload;
};

const extractCollection = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  const record = readRecord(value);
  if (!record) {
    return [];
  }

  const keys = ["notifications", "items", "rows", "data", "result"];
  for (const key of keys) {
    if (Array.isArray(record[key])) {
      return record[key] as unknown[];
    }
  }

  if (isRecord(record.data)) {
    return extractCollection(record.data);
  }

  return [];
};

const toId = (value: unknown, fallback: string): string => {
  const normalized = readString(value);
  return normalized || fallback;
};

const humanize = (value: string): string =>
  value
    .replace(/[_./:-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const readNotificationUrl = (source: UnknownRecord, data: UnknownRecord | null): string | undefined => {
  const url = readString(
    source.url ??
      source.path ??
      source.link ??
      source.action_url ??
      source.actionUrl ??
      data?.url ??
      data?.path ??
      data?.link ??
      data?.action_url ??
      data?.actionUrl
  );

  return url || undefined;
};

export const normalizeNotification = (value: unknown, index: number): AppNotification => {
  const source = readRecord(value) ?? {};
  const data = readRecord(source.data) ?? readRecord(source.payload) ?? null;
  const typeName = readString(source.type ?? data?.type ?? data?.category ?? data?.event);
  const title =
    readString(
      data?.title ??
        data?.heading ??
        data?.subject ??
        source.title ??
        source.name
    ) ||
    (typeName ? humanize(typeName.split("\\").pop() ?? typeName) : `Notification ${index + 1}`);

  const message =
    readString(
      data?.message ??
        data?.body ??
        data?.description ??
        source.message ??
        source.description
    ) || "You have a new notification.";

  const readAt = readString(source.read_at ?? source.readAt ?? data?.read_at ?? data?.readAt) || undefined;
  const createdAt =
    readString(
      source.created_at ??
        source.createdAt ??
        source.updated_at ??
        source.updatedAt ??
        data?.created_at ??
        data?.createdAt
    ) || undefined;

  return {
    id: toId(source.id ?? data?.id, `notification-${index + 1}`),
    title,
    message,
    url: readNotificationUrl(source, data),
    category:
      readString(source.category ?? source.notification_type ?? data?.category ?? data?.type ?? data?.event) ||
      undefined,
    actor:
      readString(
        data?.actor_name ??
          data?.actorName ??
          data?.user_name ??
          data?.userName ??
          data?.by ??
          source.actor
      ) || undefined,
    createdAt,
    readAt,
    isRead:
      Boolean(readAt) ||
      readBoolean(source.is_read ?? source.isRead ?? data?.is_read ?? data?.isRead, false),
    raw: value,
  };
};

export const normalizeNotifications = (payload: unknown): AppNotification[] => {
  const items = extractCollection(extractPayload(payload));
  return items.map((item, index) => normalizeNotification(item, index));
};

export const normalizeUnreadCount = (payload: unknown): number => {
  const source = extractPayload(payload);

  if (typeof source === "number") {
    return source;
  }

  const record = readRecord(source);
  if (!record) {
    return 0;
  }

  return (
    readNumber(
      record.unread_count ??
        record.unreadCount ??
        record.count ??
        record.total ??
        record.badge
    ) ?? 0
  );
};
