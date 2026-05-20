export interface MockTestSubscription {
  id: number;
  subscriptions_name: string;
  subscriptions_type: string;
  subscriptions_category: string;
  company_name: string;
  country: string;
  price: string | number | null;
  discount: string | number | null;
  duration: number;
  duration_type: string;
  created_at: string;
  updated_at: string;
}

export interface MockTestSubscriptionCreatePayload {
  subscriptions_name: string;
  subscriptions_type: string;
  subscriptions_category: string;
  company_name: string;
  country: string;
  price?: number | null;
  discount?: number | null;
  duration: number;
  duration_type: string;
}

export type MockTestSubscriptionUpdatePayload = Partial<MockTestSubscriptionCreatePayload>;

export interface MockTestSubscriptionStats {
  total: number;
}

export interface PaginatedMockTestSubscriptions {
  data: MockTestSubscription[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}
