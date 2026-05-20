import { Response, api } from '@/apis/https.api';
import type { Teacher, TeacherInput, TeacherListResponse } from '@/types/teacher';

const ENDPOINT = '/teachers';

const fallbackPagination = { total: 0, per_page: 100, current_page: 1, last_page: 1 };

const normalizeListResponse = (payload: unknown): TeacherListResponse => {
  if (payload && typeof payload === 'object') {
    const candidate = payload as { data?: unknown; pagination?: TeacherListResponse['pagination'] };
    if (Array.isArray(candidate.data)) {
      return {
        data: candidate.data as Teacher[],
        pagination: candidate.pagination ?? { ...fallbackPagination, total: candidate.data.length, per_page: candidate.data.length },
      };
    }
  }
  return { data: [], pagination: fallbackPagination };
};

// ── Admin CRUD ────────────────────────────────────────────────────────────────

export const getTeachers = (
  params: Record<string, string | number | boolean | null | undefined> = {}
): Promise<TeacherListResponse> => {
  const searchParams = new URLSearchParams();
  Object.entries({ limit: 100, ...params }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value) !== '') {
      searchParams.set(key, String(value));
    }
  });
  const qs = searchParams.toString();
  const endpoint = qs ? `${ENDPOINT}?${qs}` : ENDPOINT;
  return api.get<Response<Teacher[]>>(endpoint).then(({ data }) => normalizeListResponse(data));
};

export const createTeacher = (payload: TeacherInput): Promise<Teacher> =>
  api.post<Response<Teacher>>(ENDPOINT, payload).then(({ data }) => data.data);

export const updateTeacher = (id: number, payload: TeacherInput): Promise<Teacher> =>
  api.put<Response<Teacher>>(`${ENDPOINT}/${id}`, payload).then(({ data }) => data.data);

export const deleteTeacher = (id: number): Promise<unknown> =>
  api.delete(`${ENDPOINT}/${id}`).then(({ data }) => data);

// ── Teacher self-service ──────────────────────────────────────────────────────

export const getMyTeacherProfile = (): Promise<Teacher> =>
  api.get<Response<Teacher>>('/teacher/profile').then(({ data }) => data.data);

export const updateMyTeacherProfile = (payload: Partial<TeacherInput>): Promise<Teacher> =>
  api.patch<Response<Teacher>>('/teacher/profile', payload).then(({ data }) => data.data);

export const uploadTeacherProfilePhoto = (file: File): Promise<{ profile_photo: string; url: string }> => {
  const form = new FormData();
  form.append('photo', file);
  return api
    .post<Response<{ profile_photo: string; url: string }>>('/teacher/profile/photo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(({ data }) => data.data);
};

export const deleteTeacherProfilePhoto = (): Promise<void> =>
  api.delete('/teacher/profile/photo').then(() => undefined);
