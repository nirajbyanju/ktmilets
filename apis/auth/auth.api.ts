import { Response, api } from '../https.api';
import { AuthSessionPayload, Login } from '@/types/auth/LoginTypes';

const PUBLIC_AUTH_PREFIX = "/public/auth";
type ApiFailure = {
  response?: {
    data?: unknown;
    status?: number;
  };
  message?: string;
};

export const login = async (payload: Login): Promise<Response<AuthSessionPayload>> => {
  try {
    const response = await api.post<Response<AuthSessionPayload>>(`${PUBLIC_AUTH_PREFIX}/login`, payload);
    return response.data;
  } catch (error: unknown) {
    const apiError = error as ApiFailure;

    if (apiError.response?.data) {
      return Promise.reject(apiError.response.data);
    }
    return Promise.reject(error);
  }
};

export const refreshToken = async (
  payload: { refresh_token: string }
): Promise<Response<AuthSessionPayload>> => {
  try {
    const response = await api.post<Response<AuthSessionPayload>>(`${PUBLIC_AUTH_PREFIX}/refresh`, payload);
    return response.data;
  } catch (error: unknown) {
    const apiError = error as ApiFailure;
    if (apiError.response?.data) {
      return Promise.reject(apiError.response.data);
    }
    return Promise.reject(error);
  }
};

export const logout = async (): Promise<Response> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    const response = await api.post<Response>("/logout", {}, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: unknown) {
    const apiError = error as ApiFailure;

    if (apiError.response?.status === 401) {
      return { success: true, data: {} };
    }
    
    if (apiError.response?.data) {
      return Promise.reject(apiError.response.data);
    }
    return Promise.reject(error);
  }
};

export const registration = async (
  payload: Record<string, unknown>
): Promise<Response<AuthSessionPayload>> => {
  try {
    const response = await api.post<Response<AuthSessionPayload>>(`${PUBLIC_AUTH_PREFIX}/register`, payload);
    return response.data;
  } catch (error: unknown) {
    const apiError = error as ApiFailure;

    if (apiError.response?.data) {
      return Promise.reject(apiError.response.data);
    }
    return Promise.reject(error);
  }
};

export const forgotPassword = async (
  payload: { email: string }
): Promise<Response<Record<string, unknown>>> => {
  try {
    const response = await api.post<Response<Record<string, unknown>>>(
      `${PUBLIC_AUTH_PREFIX}/forgot-password`,
      payload
    );
    return response.data;
  } catch (error: unknown) {
    const apiError = error as ApiFailure;

    if (apiError.response?.data) {
      return Promise.reject(apiError.response.data);
    }
    return Promise.reject(error);
  }
};

export const validateResetPassword = async (
  payload: { email: string; token: string }
): Promise<Response<Record<string, unknown>>> => {
  try {
    const response = await api.get<Response<Record<string, unknown>>>(
      `${PUBLIC_AUTH_PREFIX}/reset-password/validate`,
      {
        params: payload,
      }
    );
    return response.data;
  } catch (error: unknown) {
    const apiError = error as ApiFailure;

    if (apiError.response?.data) {
      return Promise.reject(apiError.response.data);
    }
    return Promise.reject(error);
  }
};

export const resetPassword = async (
  payload: { email: string; token: string; password: string; password_confirmation: string }
): Promise<Response<Record<string, unknown>>> => {
  try {
    const response = await api.post<Response<Record<string, unknown>>>(
      `${PUBLIC_AUTH_PREFIX}/reset-password`,
      payload
    );
    return response.data;
  } catch (error: unknown) {
    const apiError = error as ApiFailure;

    if (apiError.response?.data) {
      return Promise.reject(apiError.response.data);
    }
    return Promise.reject(error);
  }
};
