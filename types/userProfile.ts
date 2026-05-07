export type ManagedUserRole = "employee" | "admin";

export interface UserProfile {
  id?: string | number;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bio: string;
  gender: string;
  country: string;
  state: string;
  district: string;
  localBodies: string;
  streetName: string;
  status?: string;
  statusValue?: "0" | "1";
  roles: string[];
  profilePicturePath?: string;
  profilePictureUrl?: string;
  raw?: unknown;
}

export interface UserProfilePictureResult {
  profilePicturePath?: string;
  profilePictureUrl?: string;
  raw?: unknown;
}

export interface AdminUserDirectoryEntry {
  id: string | number;
  name: string;
  username?: string;
  email?: string;
  phone?: string;
  status?: string;
  statusValue?: "0" | "1";
  roles: string[];
  profilePictureUrl?: string;
  raw?: unknown;
}

export interface UserProfileUpdatePayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  bio?: string;
  gender?: string;
  country?: string;
  state?: string;
  district?: string;
  localBodies?: string;
  streetName?: string;
}

export interface ManagedUserRegistrationPayload {
  role: ManagedUserRole;
  firstName: string;
  middleName?: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
  passwordConfirmation?: string;
}
