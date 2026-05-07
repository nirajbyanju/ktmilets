import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  getAllMobileProperties,
  getAllProperties,
  getDetailedProperty,
  getPropertiesList,
} from '@/apis/home/home.api';
import type { PublicPropertyListResponse } from '@/types/property/publicList';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toPositiveNumber = (value: unknown, fallback: number) => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return fallback;
};

const extractPaginationMeta = (payload: unknown) => {
  const fallback = {
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 0,
  };

  if (!isRecord(payload)) {
    return fallback;
  }

  const directPagination = isRecord(payload.pagination) ? payload.pagination : null;
  const nestedData = isRecord(payload.data) ? payload.data : null;
  const nestedPagination = nestedData && isRecord(nestedData.pagination) ? nestedData.pagination : null;
  const source = nestedPagination ?? directPagination ?? nestedData ?? payload;

  return {
    currentPage: toPositiveNumber(source.current_page ?? source.currentPage, 1),
    lastPage: toPositiveNumber(source.last_page ?? source.lastPage, 1),
    total: toPositiveNumber(source.total, 0),
    perPage: toPositiveNumber(source.per_page ?? source.perPage, 0),
  };
};

export const useProperties = (
  page: number,
  filters: Record<string, unknown>,
  enabled = true
) => {
  return useQuery({
    queryKey: ['properties', page, filters],
    queryFn: () => getAllProperties(page, filters),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
    retry: 1,
  });
};

export const useMobileProperties = (
  page: number,
  filters: Record<string, unknown>,
  enabled = true
) => {
  return useQuery({
    queryKey: ['mobileProperties', page, filters],
    queryFn: () => getAllMobileProperties(page, filters),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
    retry: 1,
  });
};

export const useInfiniteMobileProperties = (
  filters: Record<string, unknown>,
  enabled = true,
  initialData?: {
    pages: unknown[];
    pageParams: number[];
  }
) => {
  return useInfiniteQuery({
    queryKey: ['mobileProperties', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => getAllMobileProperties(pageParam, filters),
    enabled,
    initialData,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = extractPaginationMeta(lastPage);
      if (pagination.currentPage >= pagination.lastPage) {
        return undefined;
      }

      return pagination.currentPage + 1;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
};

export const useDetailedProperty = (slug: string) => {
  return useQuery({
    queryKey: ['property', slug],
    queryFn: () => getDetailedProperty(slug),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
    retry: 1,
  });
};

export const usePropertiesList = (
  page: number,
  filters: Record<string, unknown>,
  options?: {
    initialData?: PublicPropertyListResponse;
  }
) => {
  return useQuery({
    queryKey: ['propertiesList', page, filters],
    queryFn: () => getPropertiesList(page, filters),
    initialData: options?.initialData,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
    retry: 1,
  });
};
