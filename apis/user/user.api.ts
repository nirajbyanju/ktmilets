import { api, Response } from "@/apis/https.api";
import {
  normalizeAdminUserDirectory,
  normalizeUserProfile,
  normalizeUserProfilePictureResult,
} from "@/helper/user/normalize";
import type {
  AdminUserDirectoryEntry,
  ManagedUserRegistrationPayload,
  UserProfile,
  UserProfilePictureResult,
  UserProfileUpdatePayload,
} from "@/types/userProfile";

const handleApiError = (error: unknown) => {
  const apiError = error as { response?: { data?: unknown } };

  if (apiError.response?.data) {
    return Promise.reject(apiError.response.data);
  }

  return Promise.reject(error);
};

const buildProfilePayload = (payload: UserProfileUpdatePayload) => ({
  first_name: payload.firstName,
  middle_name: payload.middleName ?? "",
  last_name: payload.lastName,
  username: payload.username,
  email: payload.email,
  phone: payload.phone ?? "",
  date_of_birth: payload.dateOfBirth ?? "",
  bio: payload.bio ?? "",
  gender: payload.gender ?? "",
  country: payload.country ?? "",
  state: payload.state ?? "",
  district: payload.district ?? "",
  local_bodies: payload.localBodies ?? "",
  street_name: payload.streetName ?? "",
});

const buildManagedUserPayload = (payload: ManagedUserRegistrationPayload) => {
  const name = [payload.firstName, payload.middleName, payload.lastName].filter(Boolean).join(" ").trim();
  const roleLabel = payload.role === "admin" ? "Admin" : "User";

  return {
    first_name: payload.firstName,
    middle_name: payload.middleName ?? "",
    last_name: payload.lastName,
    username: payload.username,
    email: payload.email,
    phone: payload.phone ?? "",
    password: payload.password,
    password_confirmation: payload.passwordConfirmation ?? payload.password,
    name,
    role: payload.role,
    roles: [roleLabel],
    role_name: roleLabel,
  };
};

export const getCurrentUserProfile = async (signal?: AbortSignal): Promise<UserProfile> => {
  try {
    const response = await api.get<Response<unknown>>("/user", { signal });
    return normalizeUserProfile(response.data);
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const updateCurrentUserProfile = async (
  payload: UserProfileUpdatePayload
): Promise<UserProfile> => {
  try {
    const response = await api.patch<Response<unknown>>("/user", buildProfilePayload(payload));
    return normalizeUserProfile(response.data);
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const uploadCurrentUserProfilePicture = async (
  file: File
): Promise<UserProfilePictureResult> => {
  const formData = new FormData();
  formData.append("profile_picture", file);

  try {
    const response = await api.post<Response<unknown>>("/user/profile-picture", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return normalizeUserProfilePictureResult(response.data);
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const deleteCurrentUserProfilePicture = async (): Promise<void> => {
  try {
    await api.delete("/user/profile-picture");
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const getAdminUserDirectory = async (
  status?: "0" | "1",
  signal?: AbortSignal
): Promise<AdminUserDirectoryEntry[]> => {
  try {
    const params = status === undefined ? undefined : { status };
    const response = await api.get<Response<unknown>>("/rbac/users", { params, signal });
    return normalizeAdminUserDirectory(response.data);
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const createManagedUser = async (
  payload: ManagedUserRegistrationPayload
): Promise<Response<unknown>> => {
  try {
    const response = await api.post<Response<unknown>>("/rbac/users", buildManagedUserPayload(payload));
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const changeCurrentUserPassword = async (payload: {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}): Promise<void> => {
  try {
    await api.post("/user/change-password", {
      current_password: payload.currentPassword,
      new_password: payload.newPassword,
      new_password_confirmation: payload.newPasswordConfirmation,
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
};

export const updateManagedUserStatus = async (
  userId: string | number,
  status: "0" | "1"
): Promise<Response<unknown>> => {
  try {
    const response = await api.patch<Response<unknown>>(`/rbac/users/${userId}/status`, {
      status,
      is_status: status,
      isStatus: status,
    });
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
};
