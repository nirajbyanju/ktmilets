export interface Inquiry {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  from?: string;
  message?: string;
  description?: string;
  inquiry_type_id?: number | string | null;
  images?: string[];
  existing_images?: string[];
  request_type?: string;
  location?: string;
  budget?: number;
  property?: {
    property_code?: string;
    title?: string;
  };
  [key: string]: unknown;
}

export type Inquiries = Inquiry;
export type Inquery = Inquiry;
export type Inqueries = Inquiry;

export interface PaginatedResponse<T> {
  data: T[];
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}
