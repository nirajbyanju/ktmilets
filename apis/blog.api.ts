import {Response, api} from '@/apis/https.api';
import {Blogs, Blog} from '@/types/blog';
import { dedupeRequest } from './requestDedupe';
import { buildSearchParams, QueryParamsRecord } from './queryParams';
import { normalizePaginatedResponse } from '@/helper/api/pagination';
import type { PaginatedListResult } from '@/types/api/list';
import type { BlogListFilters } from '@/types/admin/listFilters';

// Fetch all company profiles
export const getAllBlogs = (page: number, payload: FormData | QueryParamsRecord): Promise<Blog> => {
    const params = buildSearchParams(payload);
    const queryString = params.toString();
    const endpoint = queryString
        ? `/blog?page=${page}&${queryString}`
        : `/blog?page=${page}`;

    return dedupeRequest(endpoint, () =>
        api.get<Blog>(endpoint).then(({ data }) => data)
    );
};

export const getBlogListPage = async (
    page: number,
    filters: BlogListFilters,
    signal?: AbortSignal
): Promise<PaginatedListResult<Blogs>> => {
    const params = buildSearchParams(filters);
    const queryString = params.toString();
    const endpoint = queryString
        ? `/blog?page=${page}&${queryString}`
        : `/blog?page=${page}`;

    const response = await api.get<Blog>(endpoint, { signal });
    return normalizePaginatedResponse<Blogs>(response.data, page);
};

// Create a new company profile using FormData
export const createBlog = (
    payload: FormData
): Promise<Blogs> =>
    api.post<Response<Blogs>>('/blog', payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
        .then(({ data }) => {
            return data.data;
        });

// Fetch a single company profile by ID
export const getBlogByID = (
    id: number
): Promise<Blog> =>
    api.get<Response<Blog>>(`/blog/${id}`,
    )
        .then(({ data }) => {
            return data.data;
        });

// Update an existing company profile using FormData
export const updateBlog = (id: number, payload: FormData): Promise<Blogs> => {
    return api.put<Response<Blogs>>(`/blog/${id}`, payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }).then(({ data }) => data.data);
};

export const updateStatusBlog = (id: number, payload: FormData): Promise<Blogs> => {
    const params = new URLSearchParams();
    payload.forEach((value, key) => {
        params.append(key, value.toString());
    });

    return api.patch<Response<Blogs>>(`/blog/status/${id}?${params.toString()}`, null, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }).then(({ data }) => data.data);
};

// Delete a company profile by ID
export const deleteBlog = (
    id: number
): Promise<void> =>
    api.delete(`/blog/${id}`)    
        .then(({ data }) => data);
