export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

export interface ApiErrorData {
  code: number;
  message: string;
  details?: string;
  validationErrors?: Record<string, string[]>;
}

export interface ErrorResponse {
  success: boolean;
  error: ApiErrorData;
}
