import { api, Response } from '@/apis/https.api';
import { buildSearchParams, QueryParamsRecord } from '@/apis/queryParams';
import { normalizePropertyLikePage } from '@/helper/propertyLike/normalize';
import type { PaginatedListResult } from '@/types/api/list';
import type { AccessIdentifier } from '@/types/rbac';
import type { PropertyLikeListEntry, PropertyLikeListFilters } from '@/types/propertyLike';

export type PropertyLikeId = number | string;

export type PropertyLikeMutationResult = {
  success: boolean;
  message?: string;
  data?: unknown;
};

const normalizeMutationResult = (payload: Response<unknown> & { message?: string }) => ({
  success: Boolean(payload.success),
  message: payload.message,
  data: payload.data ?? payload.result,
});

const toPropertyLikeIds = (value: unknown): PropertyLikeId[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === 'string' || typeof entry === 'number') {
          return entry;
        }

        if (entry && typeof entry === 'object') {
          const record = entry as Record<string, unknown>;
          const candidate = record.property_id ?? record.propertyId ?? record.id;
          if (typeof candidate === 'string' || typeof candidate === 'number') {
            return candidate;
          }
        }

        return null;
      })
      .filter((entry): entry is PropertyLikeId => entry !== null);
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const directIds = toPropertyLikeIds(record.ids);
    if (directIds.length > 0) {
      return directIds;
    }

    const nestedDataIds = toPropertyLikeIds(record.data);
    if (nestedDataIds.length > 0) {
      return nestedDataIds;
    }

    return toPropertyLikeIds(record.items);
  }

  return [];
};

const buildEndpointWithParams = (basePath: string, params?: QueryParamsRecord) => {
  if (!params) {
    return basePath;
  }

  const query = buildSearchParams(params).toString();
  return query ? `${basePath}?${query}` : basePath;
};

export const likeProperty = async (
  propertyId: PropertyLikeId
): Promise<PropertyLikeMutationResult> => {
  const { data } = await api.post<Response<unknown> & { message?: string }>(`/properties/${propertyId}/like`);
  return normalizeMutationResult(data);
};

export const unlikeProperty = async (
  propertyId: PropertyLikeId
): Promise<PropertyLikeMutationResult> => {
  const { data } = await api.delete<Response<unknown> & { message?: string }>(`/properties/${propertyId}/like`);
  return normalizeMutationResult(data);
};

export const getLikedProperties = async (params?: QueryParamsRecord) => {
  const endpoint = buildEndpointWithParams('/properties/liked', params);
  const { data } = await api.get<Response<unknown>>(endpoint);
  return data;
};

export const getLikedPropertyIds = async (): Promise<PropertyLikeId[]> => {
  const { data } = await api.get<Response<unknown>>('/properties/liked/ids');
  return toPropertyLikeIds(data.data ?? data.result ?? []);
};

export const getPropertyLikeAudit = async (params?: QueryParamsRecord) => {
  const endpoint = buildEndpointWithParams('/property-likes', params);
  const { data } = await api.get<Response<unknown>>(endpoint);
  return data;
};

export const getPropertyLikeAuditPage = async (
  page: number,
  filters: PropertyLikeListFilters,
  signal?: AbortSignal
): Promise<PaginatedListResult<PropertyLikeListEntry>> => {
  const endpoint = buildEndpointWithParams('/property-likes', {
    per_page: filters.limit,
    search: filters.search,
    is_active: filters.is_active,
    user_id: filters.user_id,
    property_id: filters.property_id,
    page,
  });

  const { data } = await api.get<Response<unknown>>(endpoint, { signal });
  return normalizePropertyLikePage(data, page);
};

export const getUserLikedProperties = async (
  userId: PropertyLikeId,
  params?: QueryParamsRecord
) => {
  const endpoint = buildEndpointWithParams(`/rbac/users/${userId}/liked-properties`, params);
  const { data } = await api.get<Response<unknown>>(endpoint);
  return data;
};

export const getUserLikedPropertiesPage = async (
  userId: AccessIdentifier,
  page: number,
  filters: Pick<PropertyLikeListFilters, 'limit'>,
  fallbackUser?: { id?: AccessIdentifier | null; name?: string; email?: string },
  signal?: AbortSignal
): Promise<PaginatedListResult<PropertyLikeListEntry>> => {
  const endpoint = buildEndpointWithParams(`/rbac/users/${userId}/liked-properties`, {
    per_page: filters.limit,
    page,
  });

  const { data } = await api.get<Response<unknown>>(endpoint, { signal });
  return normalizePropertyLikePage(data, page, fallbackUser);
};

export const getPropertyLikes = async (
  propertyId: PropertyLikeId,
  params?: QueryParamsRecord
) => {
  const endpoint = buildEndpointWithParams(`/properties/${propertyId}/likes`, params);
  const { data } = await api.get<Response<unknown>>(endpoint);
  return data;
};
