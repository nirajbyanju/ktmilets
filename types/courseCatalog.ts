export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface Course {
  id: number;
  name: string;
  duration_weeks: number;
  total_hours: number;
  delivery_mode: string;
  instruction_lang: string;
  skills: string | null;
  batches?: Batch[];
  batches_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Batch {
  id: number;
  course_id: number;
  course?: Pick<Course, "id" | "name">;
  batch_type: string;
  min_size: number | null;
  max_size: number | null;
  price_npr: string | number | null;
  offer_label?: string | null;
  discount_type?: "percent" | "fixed" | string | null;
  discount_value?: string | number | null;
  offer_starts_at?: string | null;
  offer_ends_at?: string | null;
  is_price_variable: boolean;
  schedule_notes: string | null;
  start_date: string | null;
  end_date: string | null;
  class_time: string | null;
  class_link?: string | null;
  is_active?: boolean;
  enrollments?: Enrollment[];
  created_at?: string;
  updated_at?: string;
}

export interface SupportChannel {
  id: number;
  channel_type: string;
  contact_value: string;
  created_at?: string;
  updated_at?: string;
}

export interface SkillModule {
  id: number;
  skill_name: string;
  topics_covered: string | null;
  feedback_included: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdditionalService {
  id: number;
  service_name: string;
  description: string | null;
  is_add_on: boolean;
  price_npr: string | number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Enrollment {
  id: number;
  student_name: string;
  user_id?: number | null;
  batch_id: number;
  batch?: Batch;
  invoice_id?: number | null;
  invoice?: {
    id?: number;
    invoice_number?: string;
    status?: string;
    total_npr?: string | number;
  } | null;
  enrollment_date: string | null;
  amount_paid: string | number | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CourseCatalogResourceKey =
  | "courses"
  | "batches"
  | "support-channels"
  | "skills-modules"
  | "additional-services"
  | "enrollments";

export interface CourseCatalogResourceMap {
  courses: Course;
  batches: Batch;
  "support-channels": SupportChannel;
  "skills-modules": SkillModule;
  "additional-services": AdditionalService;
  enrollments: Enrollment;
}

export type CourseCatalogResourceItem =
  | Course
  | Batch
  | SupportChannel
  | SkillModule
  | AdditionalService
  | Enrollment;

export interface CourseCatalogListResponse<K extends CourseCatalogResourceKey> {
  data: CourseCatalogResourceMap[K][];
  pagination: PaginationMeta;
}

export interface CourseCatalogPayload {
  courses: Course[];
  batches: Batch[];
  support_channels: SupportChannel[];
  skills_modules: SkillModule[];
  additional_services: AdditionalService[];
}

export type CourseCatalogInput = Record<string, string | number | boolean | null>;
