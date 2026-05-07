import { Response, api } from './https.api';
import { Inquery, Inqueries, PaginatedResponse } from "@/types/inquery";
import { dedupeRequest } from './requestDedupe';
import { buildSearchParams, QueryParamsRecord } from './queryParams';
import { normalizePaginatedResponse } from '@/helper/api/pagination';
import type { PaginatedListResult } from '@/types/api/list';
import type { PropertyInquiryListFilters } from '@/types/admin/listFilters';

// Get all properties with pagination and filters
// apis/requestPosts.api.ts
export const getAllInqueryProperty = (
  page: number, 
  payload: QueryParamsRecord = {}
): Promise<PaginatedResponse<Inqueries>> => {
  const params = buildSearchParams(payload);
  const queryString = params.toString();
  const endpoint = queryString
    ? `/inquiries?page=${page}&${queryString}`
    : `/inquiries?page=${page}`;

  return dedupeRequest(endpoint, () =>
    api.get<PaginatedResponse<Inqueries>>(endpoint).then(({ data }) => data)
  );
};

export const getPropertyInquiryListPage = async (
  page: number,
  filters: PropertyInquiryListFilters,
  signal?: AbortSignal
): Promise<PaginatedListResult<Inqueries>> => {
  const params = buildSearchParams(filters);
  const queryString = params.toString();
  const endpoint = queryString
    ? `/inquiries?page=${page}&${queryString}`
    : `/inquiries?page=${page}`;

  const response = await api.get<Response<Inqueries>>(endpoint, { signal });
  return normalizePaginatedResponse<Inqueries>(response.data, page);
};

// Create a new company profile using FormData
export const createInqueryProperty = (
  payload: FormData
): Promise<Inqueries> =>
  api.post<Response<Inqueries>>('/inquiries', payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(({ data }) => {
      console.log(data);
      return data.data;        
    });

// Fetch a single company profile by ID
export const getInqueryPropertyByID = (
  id: number
): Promise<Inqueries> =>
  api.get<Response<Inqueries>>(`/inquiries/${id}`)
    .then(({ data }) => {
      return data.data;
    });

// Update an existing company profile using FormData
export const updateInqueryProperty = (id: number, payload: FormData): Promise<Inquery> => {
  return api.put<Response<Inquery>>(`/inquiries/${id}`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(({ data }) => data.data);
};

// Delete a company profile by ID
export const deleteInqueryProperty = (
  id: number
): Promise<void> => 
  api.delete(`/inquiries/${id}`)    
    .then(({ data }) => data);
