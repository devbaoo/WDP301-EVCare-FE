import axiosInstance from "../constant/axiosInstance";

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  address: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      username: string;
      email: string;
      fullName: string;
      phone: string;
      address: string;
      needVerification?: boolean;
    };
    token: string;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Auth Service
export const authService = {
  // Login API
  login: async (loginData: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/api/auth/login', loginData);
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
        errors: error.response?.data?.errors
      } as ApiError;
    }
  },

  // Register API
  register: async (registerData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/api/auth/register', registerData);
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
        errors: error.response?.data?.errors
      } as ApiError;
    }
  },

  // Verify Email API
  verifyEmail: async (token: string): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.get<AuthResponse>(`/api/auth/verify-email/${token}`);
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Email verification failed. Please try again.',
        errors: error.response?.data?.errors
      } as ApiError;
    }
  },

  // Reset Password API
  resetPassword: async (email: string): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/api/auth/reset-password', { email });
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Password reset failed. Please try again.',
        errors: error.response?.data?.errors
      } as ApiError;
    }
  },

  // Verify Reset Code API
  verifyResetCode: async (email: string, code: string): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/api/auth/verify-reset-code', { 
        email, 
        code 
      });
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Invalid verification code. Please try again.',
        errors: error.response?.data?.errors
      } as ApiError;
    }
  },

  // Update Password API
  updatePassword: async (email: string, code: string, newPassword: string): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/api/auth/update-password', { 
        email, 
        code, 
        newPassword 
      });
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Password update failed. Please try again.',
        errors: error.response?.data?.errors
      } as ApiError;
    }
  }
};
