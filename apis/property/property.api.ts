import { Response, api } from '../https.api';
import { Properties, Property } from "@/types/property/property";
import { dedupeRequest } from '../requestDedupe';
import { buildSearchParams, QueryParamsRecord } from '../queryParams';
import { normalizePaginatedResponse } from '@/helper/api/pagination';
import type { PaginatedListResult } from '@/types/api/list';
import type { PropertyListFilters } from '@/types/admin/listFilters';

// Get all properties with pagination and filters
export const getAllProperties = (
  page: number,
  payload: FormData | QueryParamsRecord
): Promise<Response<Property>> => {
  const params = buildSearchParams(payload);
  const queryString = params.toString();
  const endpoint = queryString
    ? `/properties?page=${page}&${queryString}`
    : `/properties?page=${page}`;

  return dedupeRequest(endpoint, () =>
    api.get<Response<Property>>(endpoint).then(({ data }) => data)
  );
};

export const getPropertyListPage = async (
  page: number,
  filters: PropertyListFilters,
  signal?: AbortSignal
): Promise<PaginatedListResult<Properties>> => {
  const params = buildSearchParams(filters);
  const queryString = params.toString();
  const endpoint = queryString
    ? `/properties?page=${page}&${queryString}`
    : `/properties?page=${page}`;

  const response = await api.get<Response<Property>>(endpoint, { signal });
  return normalizePaginatedResponse<Properties>(response.data, page);
};

// Create a new company profile using FormData
export const createProperty = (
  payload: FormData
): Promise<Properties> =>
  api.post<Response<Properties>>('/properties', payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(({ data }) => {
      console.log(data);
      return data.data;        
    });

// Fetch a single company profile by ID
export const getPropertyByID = (
  id: number
): Promise<Properties> =>
  api.get<Response<Properties>>(`/properties/${id}`)
    .then(({ data }) => {
      return data.data;
    });

// Update an existing company profile using FormData
export const updateProperty = (id: number, payload: FormData): Promise<Properties> => {
  return api.post<Response<Properties>>(`/properties/${id}`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(({ data }) => data.data);
};

// Update an existing company profile status using FormData
export const updateStatusProperty = (id: number, payload: FormData): Promise<Properties> => {
  const params = new URLSearchParams();
  payload.forEach((value, key) => {
    params.append(key, value.toString());
  });
  const queryString = params.toString();
  const endpoint = queryString
    ? `/properties/${id}/status?${queryString}`
    : `/properties/${id}/status`;

  return api.patch<Response<Properties>>(endpoint, null, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(({ data }) => data.data);
};

// Delete a company profile by ID
export const deleteProperty = (
  id: number
): Promise<void> => 
  api.delete(`/properties/${id}`)
    .then(({ data }) => data);

