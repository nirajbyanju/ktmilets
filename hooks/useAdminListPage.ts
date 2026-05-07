"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { PaginatedListResult, PaginationMeta, StringFilters } from "@/types/api/list";

interface UseAdminListPageOptions<TItem, TFilters extends StringFilters> {
  defaultFilters: TFilters;
  queryKeyBase: readonly unknown[];
  searchKeys?: Array<keyof TFilters>;
  debounceMs?: number;
  enabled?: boolean;
  fetchPage: (params: {
    page: number;
    filters: TFilters;
    signal?: AbortSignal;
  }) => Promise<PaginatedListResult<TItem>>;
}

interface SetFiltersOptions {
  resetPage?: boolean;
  submitSearch?: boolean;
}

const defaultPagination: PaginationMeta = {
  total: 0,
  per_page: 0,
  current_page: 1,
  last_page: 0,
};

const readPageFromUrl = (): number => {
  if (typeof window === "undefined") {
    return 1;
  }

  const page = Number(window.location.search ? new URLSearchParams(window.location.search).get("page") : "1");
  return Number.isFinite(page) && page > 0 ? page : 1;
};

const mergeFiltersFromUrl = <TFilters extends StringFilters>(defaults: TFilters): TFilters => {
  if (typeof window === "undefined") {
    return defaults;
  }

  const params = new URLSearchParams(window.location.search);
  const nextFilters = { ...defaults };

  Object.keys(defaults).forEach((key) => {
    const value = params.get(key);
    if (value !== null) {
      nextFilters[key as keyof TFilters] = value as TFilters[keyof TFilters];
    }
  });

  return nextFilters;
};

const pickSearchFilters = <TFilters extends StringFilters>(
  filters: TFilters,
  searchKeys: Array<keyof TFilters>
): Partial<TFilters> => {
  if (searchKeys.length === 0) {
    return {};
  }

  return searchKeys.reduce<Partial<TFilters>>((accumulator, key) => {
    accumulator[key] = filters[key];
    return accumulator;
  }, {});
};

const buildEffectiveFilters = <TFilters extends StringFilters>(
  filters: TFilters,
  searchKeys: Array<keyof TFilters>,
  appliedSearchFilters: Partial<TFilters>
): TFilters => {
  if (searchKeys.length === 0) {
    return filters;
  }

  const nextFilters = { ...filters };

  searchKeys.forEach((key) => {
    nextFilters[key] = (appliedSearchFilters[key] ?? filters[key]) as TFilters[keyof TFilters];
  });

  return nextFilters;
};

export const useAdminListPage = <TItem, TFilters extends StringFilters>({
  defaultFilters,
  queryKeyBase,
  searchKeys = [],
  debounceMs = 500,
  enabled = true,
  fetchPage,
}: UseAdminListPageOptions<TItem, TFilters>) => {
  const initialFilters = useMemo(() => mergeFiltersFromUrl(defaultFilters), [defaultFilters]);
  const [page, setPage] = useState(() => readPageFromUrl());
  const [filters, setFiltersState] = useState<TFilters>(initialFilters);
  const [appliedSearchFilters, setAppliedSearchFilters] = useState<Partial<TFilters>>(() =>
    pickSearchFilters(initialFilters, searchKeys)
  );

  const liveSearchFilters = useMemo(
    () => pickSearchFilters(filters, searchKeys),
    [filters, searchKeys]
  );
  const debouncedSearchFilters = useDebouncedValue(liveSearchFilters, debounceMs);

  useEffect(() => {
    setAppliedSearchFilters(debouncedSearchFilters);
  }, [debouncedSearchFilters]);

  const effectiveFilters = useMemo(
    () => buildEffectiveFilters(filters, searchKeys, appliedSearchFilters),
    [appliedSearchFilters, filters, searchKeys]
  );

  const query = useQuery({
    queryKey: [...queryKeyBase, page, effectiveFilters],
    queryFn: ({ signal }) => fetchPage({ page, filters: effectiveFilters, signal }),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams();

    if (page > 1) {
      params.set("page", String(page));
    }

    Object.entries(effectiveFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    const nextUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (currentUrl !== nextUrl) {
      window.history.replaceState(window.history.state, "", nextUrl);
    }
  }, [effectiveFilters, enabled, page]);

  const updateFilter = useCallback(
    <TKey extends keyof TFilters>(key: TKey, value: TFilters[TKey]) => {
      setFiltersState((current) => {
        if (current[key] === value) {
          return current;
        }

        return {
          ...current,
          [key]: value,
        };
      });
      setPage(1);
    },
    []
  );

  const patchFilters = useCallback(
    (nextFilters: Partial<TFilters>, options?: SetFiltersOptions) => {
      const shouldResetPage = options?.resetPage ?? true;
      const shouldSubmitSearch = options?.submitSearch ?? false;

      setFiltersState((current) => ({
        ...current,
        ...nextFilters,
      }));

      if (shouldResetPage) {
        setPage(1);
      }

      if (shouldSubmitSearch && searchKeys.length > 0) {
        setAppliedSearchFilters((current) => ({
          ...current,
          ...pickSearchFilters({ ...filters, ...nextFilters }, searchKeys),
        }));
      }
    },
    [filters, searchKeys]
  );

  const submitSearch = useCallback(() => {
    if (searchKeys.length === 0) {
      return;
    }

    setAppliedSearchFilters(pickSearchFilters(filters, searchKeys));
    setPage(1);
  }, [filters, searchKeys]);

  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);

  return {
    filters,
    items: query.data?.items ?? [],
    pagination: query.data?.pagination ?? defaultPagination,
    page,
    setPage,
    updateFilter,
    patchFilters,
    submitSearch,
    refresh,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    error: query.error,
  };
};
