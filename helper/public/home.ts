import type { Properties } from "@/types/property/property";

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
const HOME_REVALIDATE_SECONDS = 60 * 5;
export const MOBILE_HOME_PAGE_SIZE = 4;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const extractPropertyList = (payload: unknown): Properties[] => {
  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.data)) {
    return payload.data as Properties[];
  }

  if (isRecord(payload.data)) {
    if (Array.isArray(payload.data.data)) {
      return payload.data.data as Properties[];
    }

    if (Array.isArray(payload.data.items)) {
      return payload.data.items as Properties[];
    }
  }

  if (Array.isArray(payload.items)) {
    return payload.items as Properties[];
  }

  return [];
};

export const isLikelyMobileUserAgent = (userAgent: string) =>
  /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent);

const fetchHomePayload = async (path: string): Promise<unknown | null> => {
  if (!PUBLIC_API_BASE_URL) {
    return null;
  }

  try {
    const response = await fetch(`${PUBLIC_API_BASE_URL}${path}`, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: HOME_REVALIDATE_SECONDS,
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as unknown;
  } catch {
    return null;
  }
};

export async function getInitialHomeProperties(limit = 10): Promise<Properties[]> {
  const payload = await fetchHomePayload(`/public/properties/summary?page=1&limit=${limit}`);
  return extractPropertyList(payload);
}

export async function getInitialMobileHomePageData(limit = MOBILE_HOME_PAGE_SIZE): Promise<unknown | null> {
  return fetchHomePayload(`/public/properties/summarymobile?page=1&limit=${limit}`);
}
