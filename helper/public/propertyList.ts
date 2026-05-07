import type { PublicPropertyListResponse } from "@/types/property/publicList";
import type { Properties } from "@/types/property/property";

type QueryValue = string | string[] | undefined;
type QueryRecord = Record<string, QueryValue>;

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
const PROPERTY_LIST_REVALIDATE_SECONDS = 60 * 5;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toPositiveNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return fallback;
};

const buildPropertyListUrl = (searchParams: QueryRecord = {}) => {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry) {
          params.append(key, entry);
        }
      });
      return;
    }

    if (value) {
      params.set(key, value);
    }
  });

  if (!params.has("page")) {
    params.set("page", "1");
  }

  return `/public/properties/list?${params.toString()}`;
};

const normalizePropertyListPayload = (payload: unknown): PublicPropertyListResponse | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const dataSource = isRecord(payload.data) ? payload.data : payload;
  const list = Array.isArray(dataSource.data)
    ? (dataSource.data as Properties[])
    : Array.isArray(payload.data)
      ? (payload.data as Properties[])
      : [];

  const currentPage = toPositiveNumber(
    dataSource.current_page ?? payload.current_page ?? dataSource.currentPage,
    1
  );
  const lastPage = toPositiveNumber(
    dataSource.last_page ?? payload.last_page ?? dataSource.lastPage,
    1
  );
  const perPage = toPositiveNumber(
    dataSource.per_page ?? payload.per_page ?? dataSource.perPage,
    list.length || 12
  );
  const total = toPositiveNumber(dataSource.total ?? payload.total, list.length);
  const from = toPositiveNumber(dataSource.from ?? payload.from, list.length > 0 ? 1 : 0);
  const to = toPositiveNumber(dataSource.to ?? payload.to, list.length);

  return {
    data: list,
    current_page: currentPage,
    last_page: lastPage,
    per_page: perPage,
    total,
    from,
    to,
  };
};

export async function getInitialPublicPropertyList(
  searchParams: QueryRecord = {}
): Promise<PublicPropertyListResponse | null> {
  if (!PUBLIC_API_BASE_URL) {
    return null;
  }

  try {
    const response = await fetch(`${PUBLIC_API_BASE_URL}${buildPropertyListUrl(searchParams)}`, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: PROPERTY_LIST_REVALIDATE_SECONDS,
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as unknown;
    return normalizePropertyListPayload(payload);
  } catch {
    return null;
  }
}
