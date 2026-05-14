import { Response, api } from "@/apis/https.api";
import type {
  CourseCatalogInput,
  CourseCatalogListResponse,
  CourseCatalogResourceKey,
  CourseCatalogResourceMap,
  PaginationMeta,
} from "@/types/courseCatalog";

const endpoints: Record<CourseCatalogResourceKey, string> = {
  courses: "/courses",
  batches: "/batches",
  "support-channels": "/support-channels",
  "skills-modules": "/skills-modules",
  "additional-services": "/additional-services",
  enrollments: "/enrollments",
};

export type Invoice = {
  id: number;
  invoice_number: string;
  status: string;
  subtotal_npr: string | number;
  discount_npr: string | number;
  tax_npr: string | number;
  total_npr: string | number;
  invoice_date: string;
  due_date: string;
  payment_method: string;
  batch?: { batch_type?: string; course?: { name?: string } };
  user?: { email?: string; name?: string; first_name?: string; last_name?: string; phone?: string };
};

export type InvoiceListResponse = {
  data: Invoice[];
  pagination: PaginationMeta;
};

const fallbackPagination: PaginationMeta = {
  total: 0,
  per_page: 100,
  current_page: 1,
  last_page: 1,
};

const normalizeListResponse = <K extends CourseCatalogResourceKey>(
  payload: unknown
): CourseCatalogListResponse<K> => {
  if (payload && typeof payload === "object") {
    const candidate = payload as {
      data?: unknown;
      pagination?: PaginationMeta;
    };

    if (Array.isArray(candidate.data)) {
      return {
        data: candidate.data as CourseCatalogResourceMap[K][],
        pagination: candidate.pagination ?? {
          ...fallbackPagination,
          total: candidate.data.length,
          per_page: candidate.data.length,
        },
      };
    }
  }

  return {
    data: [],
    pagination: fallbackPagination,
  };
};

export const getCourseCatalogResource = <K extends CourseCatalogResourceKey>(
  key: K,
  params: Record<string, string | number | boolean | null | undefined> = {}
): Promise<CourseCatalogListResponse<K>> => {
  const searchParams = new URLSearchParams();

  Object.entries({ limit: 100, ...params }).forEach(([paramKey, value]) => {
    if (value !== undefined && value !== null) {
      const stringValue = String(value);

      if (stringValue !== "") {
        searchParams.set(paramKey, stringValue);
      }
    }
  });

  const queryString = searchParams.toString();
  const endpoint = queryString ? `${endpoints[key]}?${queryString}` : endpoints[key];

  return api.get<Response<CourseCatalogResourceMap[K][]>>(endpoint).then(({ data }) => {
    return normalizeListResponse<K>(data);
  });
};

export const createCourseCatalogResource = <K extends CourseCatalogResourceKey>(
  key: K,
  payload: CourseCatalogInput
): Promise<CourseCatalogResourceMap[K]> =>
  api.post<Response<CourseCatalogResourceMap[K]>>(endpoints[key], payload).then(({ data }) => data.data);

export const updateCourseCatalogResource = <K extends CourseCatalogResourceKey>(
  key: K,
  id: number,
  payload: CourseCatalogInput
): Promise<CourseCatalogResourceMap[K]> =>
  api.put<Response<CourseCatalogResourceMap[K]>>(`${endpoints[key]}/${id}`, payload).then(({ data }) => data.data);

export const deleteCourseCatalogResource = (
  key: CourseCatalogResourceKey,
  id: number
): Promise<unknown> => api.delete(`${endpoints[key]}/${id}`).then(({ data }) => data);

export const getBatch = (id: number): Promise<CourseCatalogResourceMap["batches"]> =>
  api.get<Response<CourseCatalogResourceMap["batches"]>>(`/batches/${id}`).then(({ data }) => data.data);

export const getInvoices = (
  params: Record<string, string | number | boolean | null | undefined> = {}
): Promise<InvoiceListResponse> => {
  const searchParams = new URLSearchParams();

  Object.entries({ limit: 100, ...params }).forEach(([paramKey, value]) => {
    if (value !== undefined && value !== null && String(value) !== "") {
      searchParams.set(paramKey, String(value));
    }
  });

  const queryString = searchParams.toString();
  const endpoint = queryString ? `/invoices?${queryString}` : "/invoices";

  return api.get<Response<Invoice[]>>(endpoint).then(({ data }) => {
    if (data && typeof data === "object" && Array.isArray(data.data)) {
      return {
        data: data.data,
        pagination: (data as { pagination?: PaginationMeta }).pagination ?? {
          ...fallbackPagination,
          total: data.data.length,
          per_page: data.data.length,
        },
      };
    }

    return { data: [], pagination: fallbackPagination };
  });
};

export const createInvoice = (batchId: number): Promise<Invoice> =>
  api.post<Response<Invoice>>("/invoices", { batch_id: batchId, payment_method: "bank_qr" }).then(({ data }) => data.data);

export const markInvoicePaid = (invoiceId: number, notes?: string): Promise<Invoice> =>
  api.patch<Response<Invoice>>(`/invoices/${invoiceId}/mark-paid`, { notes }).then(({ data }) => data.data);
