import type { StringFilters } from "@/types/api/list";

export interface PropertyListFilters extends StringFilters {
  title: string;
  isStatus: string;
  limit: string;
  categoryId: string;
  location: string;
  phoneNumber: string;
  publishedDate: string;
}

export interface PropertyInquiryListFilters extends StringFilters {
  search: string;
  status: string;
  request_type: string;
  limit: string;
}

export interface FieldVisitListFilters extends StringFilters {
  search: string;
  status: string;
  date_from: string;
  date_to: string;
  limit: string;
}

export interface PropertyLikeAdminListFilters extends StringFilters {
  search: string;
  is_active: string;
  user_id: string;
  property_id: string;
  limit: string;
}

export interface BlogListFilters extends StringFilters {
  searchTerm: string;
  isStatus: string;
  limit: string;
  categoryId: string;
  createdAt: string;
}

export interface InquiryFollowupListFilters extends StringFilters {
  search: string;
  followup_status: string;
  contact_method: string;
  limit: string;
}
