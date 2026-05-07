import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";

import type { ApiErrorData } from "@/apis/https.api";

type UnknownRecord = Record<string, unknown>;

export interface AppApiError extends Error {
  status?: number;
  code?: string;
  details?: string;
  validationErrors?: Record<string, string[]> | null;
  isCanceled?: boolean;
}

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readApiError = (value: unknown): ApiErrorData | null => {
  if (!isRecord(value)) {
    return null;
  }

  const candidate = value.error;
  if (!isRecord(candidate)) {
    return null;
  }

  return {
    code:
      typeof candidate.code === "number" || typeof candidate.code === "string"
        ? candidate.code
        : "",
    details: typeof candidate.details === "string" ? candidate.details : "",
    message: typeof candidate.message === "string" ? candidate.message : "",
    validationErrors:
      candidate.validationErrors && isRecord(candidate.validationErrors)
        ? (candidate.validationErrors as Record<string, string[]>)
        : null,
  };
};

export const isCanceledRequest = (error: unknown): boolean =>
  axios.isCancel(error) ||
  (error instanceof AxiosError && error.code === "ERR_CANCELED") ||
  (isRecord(error) && error.code === "ERR_CANCELED");

export const getApiErrorMessage = (error: unknown): string => {
  if (isCanceledRequest(error)) {
    return "";
  }

  const normalizedError = error instanceof AxiosError ? error : null;
  const responseData = normalizedError?.response?.data;
  const apiError = readApiError(error) ?? readApiError(responseData);

  if (apiError?.message) {
    return apiError.message;
  }

  if (isRecord(responseData) && typeof responseData.message === "string") {
    return responseData.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

export const toAppApiError = (error: unknown): AppApiError => {
  const appError = new Error(getApiErrorMessage(error)) as AppApiError;

  if (error instanceof AxiosError) {
    appError.status = error.response?.status;
    appError.code = error.code;
  } else if (isRecord(error) && typeof error.code === "string") {
    appError.code = error.code;
  }

  const apiError =
    readApiError(error) ||
    (error instanceof AxiosError ? readApiError(error.response?.data) : null);

  if (apiError) {
    appError.details = apiError.details;
    appError.validationErrors = apiError.validationErrors;
    appError.code = appError.code ?? String(apiError.code || "");
  }

  appError.isCanceled = isCanceledRequest(error);

  return appError;
};

export const notifyApiError = (error: unknown): void => {
  if (typeof window === "undefined" || isCanceledRequest(error)) {
    return;
  }

  const message = getApiErrorMessage(error);
  if (!message) {
    return;
  }

  toast.error(message, {
    toastId: `api-error:${message}`,
  });
};
