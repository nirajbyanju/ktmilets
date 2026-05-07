export interface InquiryFollowup {
  id: number;
  inquiry_id: number;
  admin_id?: number | null;
  contact_method_id?: number | null;
  followup_status_id?: number | null;
  message: string;
  next_followup_date: string;
  status?: string;
  contact_method?: string;
  followup_status?: string;
  name?: string;
  email?: string;
  phone?: string;
  inquiry?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  admin?: {
    name?: string;
  };
}

export interface InquiryFollowupPagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface InquiryFollowupListResponse {
  data: InquiryFollowup[];
  pagination?: InquiryFollowupPagination;
  status?: boolean;
  message?: string;
  applicationMode?: string;
}

export type InquiryFollowups = InquiryFollowup;
