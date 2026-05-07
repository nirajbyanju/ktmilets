import type { Properties } from "@/types/property/property";

export interface PublicPropertyListResponse {
  data: Properties[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}
