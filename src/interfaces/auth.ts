export type UserRole = "customer" | "staff" | "technician" | "admin";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  avatar?: string;
  username?: string;
  // Optional fields for compatibility
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  isVerify?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
  needVerification: boolean;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface VerifyEmailData {
  email: string;
  verificationCode: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface ResetPasswordWithTokenData {
  password: string;
}

export interface UpdatePasswordData {
  email: string;
  resetCode: string;
  newPassword: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
}

export interface UpdateProfileData {
  username?: string;
  fullName?: string;
  phone?: string;
  address?: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  loginAttempts: number;
  lastFailedAttempt: string | null;
  needVerification: boolean;
}
