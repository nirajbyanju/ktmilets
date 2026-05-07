import { Response, api } from '@/apis/https.api';
import { Blogs, Blog } from '@/types//blog';

export const getAllBlogs = (
    page: number,
    payload: FormData | Record<string, string | number | boolean | null | undefined>
): Promise<Blog> => {
    const params = new URLSearchParams();
    let resolvedLimit: string | null = null;

    // Check if payload is an instance of FormData
    if (payload instanceof FormData) {
        payload.forEach((value, key) => {
            if (key === 'limit') {
                resolvedLimit = value.toString();
                return;
            }
            params.append(key, value.toString());
        });
    } else {
        // If payload is a regular object, iterate over its entries
        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (key === 'limit') {
                    resolvedLimit = value.toString();
                    return;
                }
                params.append(key, value.toString());
            }
        });
    }

    const queryString = params.toString();
    const limit = resolvedLimit || '10';
    const endpoint = queryString
        ? `/public/blog?limit=${limit}&page=${page}&${queryString}`
        : `/public/blog?limit=${limit}&page=${page}`;

    return api.get<Response<Blog>>(endpoint)
        .then(({ data }) => {
            return data.data;
        });
};


// Fetch a single company profile by Slug
export const getBlogsDetails = (
    slug: string
): Promise<Blogs> =>
    api.get<Response<Blogs>>(`/public/blog/${slug}`,
    )
        .then(({ data }) => {
            return data.data;
        });

export const getBlogsViewing = (
    id: number
): Promise<Blogs> =>
    api.get<Response<Blogs>>(`/public/blog/list/${id}`,
    )
        .then(({ data }) => {
            return data.data;
        });
