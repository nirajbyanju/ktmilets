export interface Login {
  email: string;
  password: string;
  general?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUserSummary extends Record<string, unknown> {
  id: number | string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  userName?: string;
  username?: string;
  email?: string;
  roles?: string[];
}

export interface AuthSessionPayload extends Record<string, unknown> {
  token: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  access_token_expires_at?: string | number;
  refresh_token_expires_at?: string | number;
  token_type?: string;
  device_name?: string;
  user?: AuthUserSummary;
  menus?: unknown;
  menu?: unknown;
}

export interface LoginResponse {
  success?: boolean;
  error?: {
    validationErrors?: Record<string, string[]>;
    message?: string;
  };
  data: AuthSessionPayload;
}

export interface ApiResponse<T = unknown> {
  status: number;
  message?: string;
  data?: T;
}
