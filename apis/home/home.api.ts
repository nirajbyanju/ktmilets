// apis/home/home.api.ts
import { Response, api } from '../https.api';
import { Properties, Property } from "@/types/property/property";
import { FieldTour } from "@/types/tour";
import { Inquery } from "@/types/inquery";

const buildPublicListEndpoint = (
  basePath: string,
  page: number,
  filters: Record<string, string | number | boolean | null | undefined> = {}
) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString
    ? `${basePath}?page=${page}&${queryString}`
    : `${basePath}?page=${page}`;
};

export const getAllProperties = (
    page: number,
    filters: Record<string, string | number | boolean | null | undefined> = {}
): Promise<Response<Properties>> => {
    return api.get<Response<Properties>>(buildPublicListEndpoint('/public/properties/summary', page, filters))
        .then(({ data }) => {
            return data;
        });
};

export const getAllMobileProperties = (
    page: number,
    filters: Record<string, string | number | boolean | null | undefined> = {}
): Promise<Response<Properties>> => {
    return api.get<Response<Properties>>(buildPublicListEndpoint('/public/properties/summarymobile', page, filters))
        .then(({ data }) => {
            return data;
        });
};

export const getDetailedProperty = (slug: string): Promise<Response<Property>> => {
    return api.get<Response<Property>>(`/public/properties/${slug}/details`)
        .then(({ data }) => {
            return data;
        });
};

export const getPropertiesList = (
    page: number,
    filters: Record<string, string | number | boolean | null | undefined> = {}
): Promise<Response<Properties>> => {
    return api.get<Response<Properties>>(buildPublicListEndpoint('/public/properties/list', page, filters))
        .then(({ data }) => {
            return data;
        });
};

export const CreateFieldVist = (
  payload: FormData
): Promise<FieldTour> =>
  api.post<Response<FieldTour>>('/public/tour', payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(({ data }) => {
      return data.data;        
    });

export const CreateInquiry = (
  payload: FormData
): Promise<Inquery> =>
  api.post<Response<Inquery>>('/public/inquiry', payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(({ data }) => {
      return data.data;        
    });
