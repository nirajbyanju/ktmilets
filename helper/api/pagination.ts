import type { PaginatedListResult, PaginationMeta } from "@/types/api/list";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const readArray = <TItem>(value: unknown): TItem[] =>
  Array.isArray(value) ? (value as TItem[]) : [];

const normalizePagination = (
  source: unknown,
  fallbackPage: number,
  fallbackSize: number
): PaginationMeta => {
  const pagination = isRecord(source) ? source : {};

  return {
    total: readNumber(pagination.total, fallbackSize),
    per_page: readNumber(pagination.per_page, fallbackSize),
    current_page: readNumber(pagination.current_page, fallbackPage),
    last_page: readNumber(pagination.last_page, fallbackSize > 0 ? 1 : 0),
  };
};

export const normalizePaginatedResponse = <TItem>(
  payload: unknown,
  fallbackPage = 1
): PaginatedListResult<TItem> => {
  const root = isRecord(payload) ? payload : {};
  const rootData = root.data;
  const nested = isRecord(rootData) ? rootData : null;

  const items = nested ? readArray<TItem>(nested.data) : readArray<TItem>(rootData);
  const paginationSource = nested?.pagination ?? root.pagination;

  return {
    items,
    pagination: normalizePagination(paginationSource, fallbackPage, items.length),
  };
};
