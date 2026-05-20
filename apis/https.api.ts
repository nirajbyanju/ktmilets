import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import useAuthStore from '@/stores/auth/AuthStore';
import { isCanceledRequest, notifyApiError, toAppApiError } from '@/apis/error';
import { AuthSessionPayload } from '@/types/auth/LoginTypes';
import {
  getStoredAccessToken,
  getStoredAccessTokenExpiresAt,
  getStoredRefreshToken,
  isAccessTokenExpired,
  persistAuthSession,
} from '@/helper/auth/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error('NEXT_PUBLIC_API_URL is not defined in environment variables');
  if (process.env.NODE_ENV === 'development') {
    console.log('Using default development API URL');
  }
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Use for public endpoints that must never trigger auth redirects.
export const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let unauthorizedLogoutPromise: Promise<void> | null = null;
let refreshPromise: Promise<AuthSessionPayload> | null = null;
let refreshFailedPermanently = false;
let lastFailedRefreshToken: string | null = null;

const AUTH_ROUTE_MARKERS = [
  '/public/auth/login',
  '/public/auth/refresh',
  '/public/auth/register',
  '/public/auth/admin/register',
  '/public/auth/forgot-password',
  '/public/auth/reset-password/validate',
  '/public/auth/reset-password',
  '/logout',
];

const isAuthRoute = (url?: string): boolean =>
  AUTH_ROUTE_MARKERS.some((route) => url?.includes(route));

const redirectToLogin = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
};

const forceUnauthorizedLogout = async () => {
  if (unauthorizedLogoutPromise) {
    return unauthorizedLogoutPromise;
  }

  unauthorizedLogoutPromise = (async () => {
    try {
      const authStore = useAuthStore.getState();
      authStore.clearSession();
    } catch (logoutError) {
      console.error('Unauthorized logout failed:', logoutError);
    } finally {
      redirectToLogin();
      unauthorizedLogoutPromise = null;
    }
  })();

  return unauthorizedLogoutPromise;
};

const extractRefreshSession = (responseData: unknown): AuthSessionPayload => {
  if (
    responseData &&
    typeof responseData === 'object' &&
    'success' in responseData &&
    (responseData as { success?: boolean }).success === true &&
    'data' in responseData &&
    typeof (responseData as { data?: unknown }).data === 'object' &&
    (responseData as { data?: unknown }).data !== null
  ) {
    const payload = (responseData as { data: AuthSessionPayload }).data;
    const token = payload.token || payload.access_token;
    if (token) {
      return {
        ...payload,
        token,
      };
    }
  }

  throw new Error('Refresh token response did not include a new access token');
};

const requestAccessTokenRefresh = async (): Promise<AuthSessionPayload> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = getStoredRefreshToken();

    if (!refreshToken) {
      refreshFailedPermanently = true;
      lastFailedRefreshToken = null;
      throw new Error('No refresh token available');
    }

    if (refreshFailedPermanently) {
      if (lastFailedRefreshToken === refreshToken) {
        throw new Error('Refresh token is invalid or has already failed');
      }

      refreshFailedPermanently = false;
      lastFailedRefreshToken = null;
    }

    try {
      const refreshResponse = await api.post('/public/auth/refresh', {
        refresh_token: refreshToken,
      });

      const sessionData = extractRefreshSession(refreshResponse.data);
      refreshFailedPermanently = false;
      lastFailedRefreshToken = null;
      persistAuthSession(sessionData);
      useAuthStore.getState().setToken(sessionData.token, sessionData);

      return sessionData;
    } catch (error) {
      refreshFailedPermanently = true;
      lastFailedRefreshToken = refreshToken;
      throw error;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined' && !isAuthRoute(config.url)) {
      const accessToken = getStoredAccessToken();
      const refreshToken = getStoredRefreshToken();
      const accessTokenExpiresAt = getStoredAccessTokenExpiresAt();

      if (refreshToken && (!accessToken || isAccessTokenExpired(accessTokenExpiresAt))) {
        try {
          await requestAccessTokenRefresh();
        } catch (refreshError) {
          await forceUnauthorizedLogout();
          return Promise.reject(toAppApiError(refreshError));
        }
      }
    }

    if (typeof window !== 'undefined') {
      const accessToken = getStoredAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      const state = useAuthStore.getState();
      const user = state.user;
      const userId = user?.id;

      if (userId) {
        config.headers['X-User-Id'] = userId;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = (error.config ?? {}) as RetriableRequestConfig;

    if (isAuthRoute(originalRequest.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const sessionData = await requestAccessTokenRefresh();
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${sessionData.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        const normalizedRefreshError = toAppApiError(refreshError);
        await forceUnauthorizedLogout();
        return Promise.reject(normalizedRefreshError);
      }
    }

    if (error.response?.status === 401) {
      const normalizedUnauthorizedError = toAppApiError(error);
      await forceUnauthorizedLogout();
      return Promise.reject(normalizedUnauthorizedError);
    }

    const normalizedError = toAppApiError(error);

    if (!isCanceledRequest(normalizedError)) {
      notifyApiError(normalizedError);
    }

    return Promise.reject(normalizedError);
  }
);

export interface Response<T = unknown> {
  data: T;
  success: boolean;
  result?: T;
  error?: ApiErrorData;
}

export interface ApiErrorData {
  code: string | number;
  details: string;
  message: string;
  validationErrors: null | Record<string, string[]>;
}

export interface ErrorResponse {
  success: boolean;
  error: ApiErrorData;
}
