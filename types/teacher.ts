export type TeacherStatus = 'Active' | 'Backup' | 'Inactive';

export interface Teacher {
  id: number;
  teacher_id: string;
  name: string;
  course: string;
  phone: string | null;
  email: string | null;
  available_time: string;
  status: TeacherStatus;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export type TeacherInput = Record<string, string | number | boolean | null>;

export type TeacherListResponse = {
  data: Teacher[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
};
