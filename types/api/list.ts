export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface PaginatedListResult<TItem> {
  items: TItem[];
  pagination: PaginationMeta;
}

export type StringFilters = Record<string, string>;
