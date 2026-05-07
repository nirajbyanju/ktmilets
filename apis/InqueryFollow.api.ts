import { Response, api } from './https.api';
import { InquiryFollowup, InquiryFollowupListResponse } from "@/types/inqueryFollow";
import { dedupeRequest } from './requestDedupe';

const getInquiryFollowupsBasePath = (inquiryId: number | string) => `/inquiries/${inquiryId}/followups`;

export const getAllInquestFollow = (
  inquiryId: number | string,
  page: number, 
  payload: Record<string, string | number | boolean | null | undefined> = {}
): Promise<InquiryFollowupListResponse> => {
  const params = new URLSearchParams();
  
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });

  const queryString = params.toString();
  const endpoint = queryString
    ? `${getInquiryFollowupsBasePath(inquiryId)}?page=${page}&${queryString}`
    : `${getInquiryFollowupsBasePath(inquiryId)}?page=${page}`;

  return dedupeRequest(endpoint, () =>
    api.get<Response<InquiryFollowupListResponse>>(endpoint).then(({ data }) => data.data)
  );
};

// Create a new company profile using FormData
export const createInquestFollow = (
  inquiryId: number | string,
  payload: FormData
): Promise<InquiryFollowup> =>
  api.post<Response<InquiryFollowup>>(getInquiryFollowupsBasePath(inquiryId), payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(({ data }) => {
      return data.data;        
    });

// Fetch a single company profile by ID
export const getInquestFollow = (
  inquiryId: number | string,
  id: number
): Promise<InquiryFollowup> =>
  api.get<Response<InquiryFollowup>>(`${getInquiryFollowupsBasePath(inquiryId)}/${id}`)
    .then(({ data }) => {
      return data.data;
    });

// Update an existing company profile using FormData
export const updateInquestFollow = (
  inquiryId: number | string,
  id: number,
  payload: FormData
): Promise<InquiryFollowup> => {
  return api.put<Response<InquiryFollowup>>(`${getInquiryFollowupsBasePath(inquiryId)}/${id}`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(({ data }) => data.data);
};

// Delete a company profile by ID
export const deleteInquestFollow = (
  inquiryId: number | string,
  id: number
): Promise<void> => 
  api.delete(`${getInquiryFollowupsBasePath(inquiryId)}/${id}`)    
    .then(({ data }) => data);
