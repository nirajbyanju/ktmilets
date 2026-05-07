import { Response, api } from './https.api';
import { FieldVisit, FieldVisits, PaginatedResponse } from "@/types/fieldVisit";
import { dedupeRequest } from './requestDedupe';
import { buildSearchParams, QueryParamsRecord } from './queryParams';
import { normalizePaginatedResponse } from '@/helper/api/pagination';
import type { PaginatedListResult } from '@/types/api/list';
import type { FieldVisitListFilters } from '@/types/admin/listFilters';

const FIELD_VISITS_COLLECTION_PATH = '/field-visits';
const getFieldVisitsBasePath = (propertyId: number | string) => `/properties/${propertyId}/field-visits`;

export const getAllInFieldVisit = (
  propertyId: number | string,
  page: number, 
  payload: QueryParamsRecord = {}
): Promise<PaginatedResponse<FieldVisits>> => {
  const params = buildSearchParams(payload);
  const queryString = params.toString();
  const endpoint = queryString
    ? `${getFieldVisitsBasePath(propertyId)}?page=${page}&${queryString}`
    : `${getFieldVisitsBasePath(propertyId)}?page=${page}`;

  return dedupeRequest(endpoint, () =>
    api.get<PaginatedResponse<FieldVisits>>(endpoint).then(({ data }) => data)
  );
};

export const getFieldVisitListPage = async (
  propertyId: number | string,
  page: number,
  filters: FieldVisitListFilters,
  signal?: AbortSignal
): Promise<PaginatedListResult<FieldVisits>> => {
  const params = buildSearchParams(filters);
  const queryString = params.toString();
  const endpoint = queryString
    ? `${getFieldVisitsBasePath(propertyId)}?page=${page}&${queryString}`
    : `${getFieldVisitsBasePath(propertyId)}?page=${page}`;

  const response = await api.get<Response<FieldVisits>>(endpoint, { signal });
  return normalizePaginatedResponse<FieldVisits>(response.data, page);
};

export const getGlobalFieldVisitListPage = async (
  page: number,
  filters: FieldVisitListFilters,
  signal?: AbortSignal
): Promise<PaginatedListResult<FieldVisits>> => {
  const params = buildSearchParams(filters);
  const queryString = params.toString();
  const endpoint = queryString
    ? `${FIELD_VISITS_COLLECTION_PATH}?page=${page}&${queryString}`
    : `${FIELD_VISITS_COLLECTION_PATH}?page=${page}`;

  const response = await api.get<Response<FieldVisits>>(endpoint, { signal });
  return normalizePaginatedResponse<FieldVisits>(response.data, page);
};

// Create a new company profile using FormData
export const createInFieldVisit = (
  payload: FormData
): Promise<FieldVisits> => {
  const propertyId = payload.get('property_id');

  if (!propertyId) {
    return Promise.reject(new Error('property_id is required to create a field visit'));
  }

  return api.post<Response<FieldVisits>>(getFieldVisitsBasePath(String(propertyId)), payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(({ data }) => {
      console.log(data);
      return data.data;        
    });
};

// Fetch a single company profile by ID
export const getInFieldVisit = (
  propertyId: number | string,
  id: number
): Promise<FieldVisits> =>
  api.get<Response<FieldVisits>>(`${getFieldVisitsBasePath(propertyId)}/${id}`)
    .then(({ data }) => {
      return data.data;
    });

// Update an existing company profile using FormData
export const updateInFieldVisit = (
  propertyId: number | string,
  id: number,
  payload: FormData
): Promise<FieldVisit> => {
  return api.put<Response<FieldVisit>>(`${getFieldVisitsBasePath(propertyId)}/${id}`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(({ data }) => data.data);
};

// Update an existing company profile status using FormData
export const updateStatusInFieldVisit = (
  propertyId: number | string,
  id: number,
  payload: FormData
): Promise<FieldVisit> => {
  const params = new URLSearchParams();
  payload.forEach((value, key) => {
    params.append(key, value.toString());
  });
  const queryString = params.toString();
  const endpoint = queryString
    ? `${getFieldVisitsBasePath(propertyId)}/status/${id}?${queryString}`
    : `${getFieldVisitsBasePath(propertyId)}/status/${id}`;

  return api.patch<Response<FieldVisit>>(endpoint, null, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(({ data }) => data.data);
};

// Delete a company profile by ID
export const deleteInFieldVisit = (
  propertyId: number | string,
  id: number
): Promise<void> => 
  api.delete(`${getFieldVisitsBasePath(propertyId)}/${id}`)    
    .then(({ data }) => data);
