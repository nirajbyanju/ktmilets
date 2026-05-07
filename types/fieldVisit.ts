export interface FieldVisit {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  date?: string;
  time?: string;
  message?: string;
  property_id?: number;
}

export type FieldVisits = FieldVisit;

export interface PaginatedResponse<T> {
  data: T[];
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}
