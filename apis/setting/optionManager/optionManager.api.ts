import { Response, api } from '@/apis/https.api';
import {  OptionsManagers, OptionsManagerResponse } from "@/types/setting/optionsManager/OptionsManager";
import { dedupeRequest } from "../../requestDedupe";
import { buildSearchParams, QueryParamsRecord } from "@/apis/queryParams";

const normalizeOptionsManagerResponse = (payload: unknown): OptionsManagerResponse => {
  if (payload && typeof payload === "object") {
    const candidate = payload as {
      data?: unknown;
      pagination?: OptionsManagerResponse["pagination"];
    };

    if (Array.isArray(candidate.data)) {
      return {
        data: candidate.data as OptionsManagers[],
        pagination: candidate.pagination ?? {
          total: candidate.data.length,
          per_page: candidate.data.length,
          current_page: 1,
          last_page: candidate.data.length > 0 ? 1 : 0,
        },
      };
    }

    if (candidate.data && typeof candidate.data === "object") {
      return normalizeOptionsManagerResponse(candidate.data);
    }
  }

  return {
    data: [],
    pagination: {
      total: 0,
      per_page: 0,
      current_page: 1,
      last_page: 0,
    },
  };
};

const normalizeOptionsManagerItem = (payload: unknown): OptionsManagers => {
  if (payload && typeof payload === "object") {
    const candidate = payload as { data?: unknown };
    if (candidate.data && typeof candidate.data === "object" && !Array.isArray(candidate.data)) {
      return candidate.data as OptionsManagers;
    }

    return payload as OptionsManagers;
  }

  throw new Error("Invalid option manager response");
};

// Fetch all options managers
export const getAllOptionsManagers = (
  page: number,
  payload: FormData | QueryParamsRecord
): Promise<OptionsManagerResponse> => {
  const params = buildSearchParams(payload);
  const queryString = params.toString();
  const endpoint = queryString
    ? `/options?page=${page}&${queryString}`
    : `/options?page=${page}`;

  return api.get<Response<OptionsManagerResponse>>(endpoint)
    .then(({ data }) => {
      return normalizeOptionsManagerResponse(data);
    });
};

  export const createOptionsManagers = (
    payload: FormData
  ): Promise<OptionsManagers> =>
    api.post<Response<OptionsManagers>>('/options', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(({ data }) => {
        return normalizeOptionsManagerItem(data);
      });
  

// Fetch a single options manager by ID
  export const getOptionsManagersByID = (
    id: number,
    payload: FormData | QueryParamsRecord
  ): Promise<OptionsManagers> => {
    const params = buildSearchParams(payload);
    const queryString = params.toString();
    const endpoint = queryString
      ? `/options/${id}?${queryString}`
      : `/options/${id}`;
  
    return api.get<Response<OptionsManagers>>(endpoint)
      .then(({ data }) => {
        return normalizeOptionsManagerItem(data);
      });
  };

// Update an existing options manager using FormData
export const updateOptionsManagers = (id: number, payload: FormData): Promise<OptionsManagers> => {
  return api.put<Response<OptionsManagers>>(`/options/${id}`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(({ data }) => data.data);
}


export const updateStatusOptionsManagers = (id: number, payload: FormData): Promise<OptionsManagers> => {
  const params = new URLSearchParams();
  payload.forEach((value, key) => {
    params.append(key, value.toString());
  });

  return api.patch<Response<OptionsManagers>>(`/options/status/${id}?${params.toString()}`, null, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(({ data }) => normalizeOptionsManagerItem(data));
};

// Delete an options manager by ID
export const deleteOptionsManagers = (id: number, params: string): Promise<unknown> =>
  api.delete(`/options/${id}/${params}`).then(({ data }) => data);

const normalizeOptionsMenu = (payload: unknown): OptionsManagers[] => {
  if (Array.isArray(payload)) {
    return payload as OptionsManagers[];
  }

  if (payload && typeof payload === "object") {
    const response = payload as { data?: unknown; result?: unknown };

    if (Array.isArray(response.data)) {
      return response.data as OptionsManagers[];
    }

    if (Array.isArray(response.result)) {
      return response.result as OptionsManagers[];
    }
  }

  return [];
};

export const getOptionsMenu = (): Promise<OptionsManagers[]> =>
  dedupeRequest("GET:/options/menu", () =>
    api.get<Response<OptionsManagers[]>>(`/options/menu`)
      .then(({ data }) => normalizeOptionsMenu(data))
  );

export const getOptionTypes = (): Promise<OptionsManagers[]> =>
  dedupeRequest("GET:/options/types", () =>
    api.get<Response<OptionsManagers[]>>(`/options/types`)
      .then(({ data }) => normalizeOptionsMenu(data))
  );

export const getOptionCatalog = (
  type: string,
  page: number,
  payload: QueryParamsRecord = {}
): Promise<OptionsManagerResponse> => {
  const params = buildSearchParams(payload);
  const queryString = params.toString();
  const endpoint = queryString
    ? `/options/catalog/${type}?page=${page}&${queryString}`
    : `/options/catalog/${type}?page=${page}`;

  return api.get<Response<OptionsManagerResponse>>(endpoint)
    .then(({ data }) => normalizeOptionsManagerResponse(data));
};
