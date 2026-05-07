import { AuthSessionPayload } from "@/types/auth/LoginTypes";

const ACCESS_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const ACCESS_TOKEN_EXPIRES_AT_KEY = "authTokenExpiresAt";
const ACCESS_TOKEN_EXPIRY_BUFFER_MS = 30_000;

type UnknownRecord = Record<string, unknown>;

const isClient = typeof window !== "undefined";

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const getStoredAccessToken = (): string | null =>
  isClient ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;

export const getStoredRefreshToken = (): string | null =>
  isClient ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;

export const getStoredAccessTokenExpiresAt = (): number | null => {
  if (!isClient) {
    return null;
  }

  const rawValue = localStorage.getItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
  return rawValue ? readNumber(rawValue) : null;
};

export const resolveAccessTokenExpiresAt = (payload: unknown): number | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const explicitExpiresAt =
    readNumber(payload.accessTokenExpiresAt) ??
    readNumber(payload.access_token_expires_at) ??
    readNumber(payload.expires_at);

  if (explicitExpiresAt) {
    return explicitExpiresAt > 10_000_000_000 ? explicitExpiresAt : explicitExpiresAt * 1000;
  }

  const expiresInSeconds = readNumber(payload.expires_in);
  if (expiresInSeconds && expiresInSeconds > 0) {
    return Date.now() + expiresInSeconds * 1000;
  }

  return null;
};

export const isAccessTokenExpired = (
  expiresAt: number | null,
  bufferMs = ACCESS_TOKEN_EXPIRY_BUFFER_MS
): boolean => {
  if (!expiresAt) {
    return false;
  }

  return Date.now() >= expiresAt - bufferMs;
};

export const persistAuthSession = (payload: AuthSessionPayload | UnknownRecord): void => {
  if (!isClient || !isRecord(payload)) {
    return;
  }

  const token =
    typeof payload.token === "string"
      ? payload.token
      : typeof payload.access_token === "string"
        ? payload.access_token
        : null;
  const refreshToken = typeof payload.refresh_token === "string" ? payload.refresh_token : null;
  const expiresAt = resolveAccessTokenExpiresAt(payload);

  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  if (expiresAt) {
    localStorage.setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, String(expiresAt));
  } else {
    localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
  }
};

export const clearStoredAuthSession = (): void => {
  if (!isClient) {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
};
