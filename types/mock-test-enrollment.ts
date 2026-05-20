export interface MockTestEnrollmentSubscription {
  id: number;
  subscriptions_name: string;
  subscriptions_type?: string | null;
  subscriptions_category?: string | null;
  price?: string | number | null;
  duration?: number | null;
  duration_type?: string | null;
}

export interface MockTestEnrollmentInvoice {
  id: number;
  invoice_number: string;
  status: string;
  total_npr: string | number;
}

export interface MockTestEnrollmentUser {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export interface MockTestEnrollment {
  id: number;
  subscription_id: number;
  invoice_id: number;
  user_id: number;
  enrollment_date: string;
  subscription_start: string;
  subscription_end: string;
  subscription?: MockTestEnrollmentSubscription | null;
  invoice?: MockTestEnrollmentInvoice | null;
  user?: MockTestEnrollmentUser | null;
  created_at: string;
  updated_at: string;
}

export interface MockTestEnrollmentCreatePayload {
  subscription_id: number;
  user_id: number;
  enrollment_date: string;
  subscription_start: string;
  subscription_end: string;
}

export interface MockTestEnrollmentListResponse {
  data: MockTestEnrollment[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface MockTestEnrollmentStats {
  total: number;
  active: number;
  expired: number;
}
