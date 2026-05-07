import { normalizePaginatedResponse } from '@/helper/api/pagination';
import type { PaginatedListResult } from '@/types/api/list';
import type { AccessIdentifier } from '@/types/rbac';
import type { PropertyLikeListEntry } from '@/types/propertyLike';

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toStringValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return '';
};

const toNumberValue = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const toIdentifier = (value: unknown): AccessIdentifier | null => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  return null;
};

const toBooleanValue = (value: unknown, fallback = true) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'active', 'yes'].includes(normalized)) {
      return true;
    }

    if (['0', 'false', 'inactive', 'no'].includes(normalized)) {
      return false;
    }
  }

  return fallback;
};

const firstRecord = (value: UnknownRecord, keys: string[]): UnknownRecord | null => {
  for (const key of keys) {
    const candidate = value[key];
    if (isRecord(candidate)) {
      return candidate;
    }
  }

  return null;
};

const firstString = (value: UnknownRecord, keys: string[]): string => {
  for (const key of keys) {
    const candidate = toStringValue(value[key]);
    if (candidate) {
      return candidate;
    }
  }

  return '';
};

const firstNumber = (value: UnknownRecord, keys: string[]): number | null => {
  for (const key of keys) {
    const candidate = toNumberValue(value[key]);
    if (candidate !== null) {
      return candidate;
    }
  }

  return null;
};

const buildUserName = (value: UnknownRecord | null) => {
  if (!value) {
    return '';
  }

  const firstName = firstString(value, ['first_name', 'firstName']);
  const lastName = firstString(value, ['last_name', 'lastName']);
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  return (
    fullName ||
    firstString(value, ['name', 'full_name', 'fullName', 'username', 'userName', 'email']) ||
    'Unknown User'
  );
};

const buildPropertyLocation = (propertyRecord: UnknownRecord | null, source: UnknownRecord) => {
  const addressRecord =
    (propertyRecord && firstRecord(propertyRecord, ['address', 'property_address'])) ||
    firstRecord(source, ['address', 'property_address']);

  if (addressRecord) {
    const fullAddress = firstString(addressRecord, ['full_address', 'fullAddress']);
    if (fullAddress) {
      return fullAddress;
    }

    const area = firstString(addressRecord, ['area', 'city', 'municipality']);
    if (area) {
      return area;
    }
  }

  return firstString(source, ['property_location', 'location', 'full_address', 'fullAddress']);
};

export const normalizePropertyLikeEntry = (
  value: unknown,
  fallbackUser?: { id?: AccessIdentifier | null; name?: string; email?: string }
): PropertyLikeListEntry => {
  const source = isRecord(value) ? value : {};
  const propertyRecord = firstRecord(source, ['property']) ?? source;
  const userRecord = firstRecord(source, ['user', 'liked_by', 'owner', 'creator']);
  const likeRecord = firstRecord(source, ['like', 'property_like', 'pivot']);

  const propertyId =
    toIdentifier(source.property_id) ??
    toIdentifier(propertyRecord.id) ??
    toIdentifier(likeRecord?.property_id) ??
    null;

  const userId =
    toIdentifier(source.user_id) ??
    toIdentifier(userRecord?.id) ??
    fallbackUser?.id ??
    null;

  const propertyTitle =
    firstString(source, ['property_title', 'title']) ||
    firstString(propertyRecord, ['title', 'name']) ||
    'Untitled Property';

  const propertySlug =
    firstString(source, ['property_slug', 'slug']) ||
    firstString(propertyRecord, ['slug']) ||
    '';

  const propertyCode =
    firstString(source, ['property_code']) ||
    firstString(propertyRecord, ['property_code', 'code']) ||
    '';

  const propertyPrice =
    firstNumber(source, ['advertise_price', 'price']) ??
    firstNumber(propertyRecord, ['advertise_price', 'price', 'base_price']);

  const propertyCurrency =
    firstString(source, ['currency']) ||
    firstString(propertyRecord, ['currency']) ||
    'NPR';

  const propertyLikesCount =
    firstNumber(source, ['likes_count', 'likesCount']) ??
    firstNumber(propertyRecord, ['likes_count', 'likesCount']) ??
    0;

  const likedAt =
    firstString(source, ['liked_at', 'created_at', 'createdAt']) ||
    firstString(likeRecord ?? {}, ['created_at', 'createdAt']) ||
    firstString(propertyRecord, ['liked_at', 'created_at']) ||
    '';

  const updatedAt =
    firstString(source, ['updated_at', 'updatedAt']) ||
    firstString(likeRecord ?? {}, ['updated_at', 'updatedAt']) ||
    '';

  const userName =
    buildUserName(userRecord) ||
    fallbackUser?.name ||
    'Current User';

  const userEmail =
    firstString(userRecord ?? {}, ['email']) ||
    fallbackUser?.email ||
    '';

  const id =
    toIdentifier(source.id) ??
    toIdentifier(likeRecord?.id) ??
    `${propertyId ?? 'property'}-${userId ?? 'user'}-${likedAt || 'like'}`;

  return {
    id,
    propertyId,
    propertyTitle,
    propertySlug,
    propertyCode,
    propertyPrice,
    propertyCurrency,
    propertyLocation: buildPropertyLocation(propertyRecord, source),
    propertyLikesCount,
    userId,
    userName,
    userEmail,
    isActive: toBooleanValue(source.is_active ?? likeRecord?.is_active, true),
    likedAt,
    updatedAt,
    raw: value,
  };
};

export const normalizePropertyLikePage = (
  payload: unknown,
  fallbackPage = 1,
  fallbackUser?: { id?: AccessIdentifier | null; name?: string; email?: string }
): PaginatedListResult<PropertyLikeListEntry> => {
  const paginated = normalizePaginatedResponse<unknown>(payload, fallbackPage);

  return {
    items: paginated.items.map((item) => normalizePropertyLikeEntry(item, fallbackUser)),
    pagination: paginated.pagination,
  };
};
