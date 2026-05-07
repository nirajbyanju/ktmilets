export type QueryParamValue = string | number | boolean | null | undefined;
export type QueryParamsRecord = Record<string, QueryParamValue>;

export const buildSearchParams = (
  payload: FormData | QueryParamsRecord = {}
): URLSearchParams => {
  const params = new URLSearchParams();

  if (payload instanceof FormData) {
    payload.forEach((value, key) => {
      const normalized = String(value).trim();
      if (normalized) {
        params.append(key, normalized);
      }
    });

    return params;
  }

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    const normalized = String(value).trim();
    if (normalized) {
      params.append(key, normalized);
    }
  });

  return params;
};
