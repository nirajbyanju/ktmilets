export type TeacherStatus = 'Active' | 'Backup' | 'Inactive';

export interface TeacherUser {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface Teacher {
  id: number;
  user_id: number | null;
  teacher_id: string;
  name: string;
  course: string;
  phone: string | null;
  email: string | null;
  available_time: string;
  status: TeacherStatus;
  notes: string | null;
  profile_photo: string | null;
  user?: TeacherUser | null;
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
