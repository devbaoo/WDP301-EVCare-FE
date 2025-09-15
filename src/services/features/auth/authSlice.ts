import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { message } from "antd";
import axiosInstance from "../../constant/axiosInstance";
import {
  LOGIN_ENDPOINT,
  REGISTER_ENDPOINT,
  VERIFY_EMAIL_TOKEN_ENDPOINT,
  RESEND_VERIFICATION_ENDPOINT,
  RESET_PASSWORD_ENDPOINT,
  RESET_PASSWORD_WITH_TOKEN_ENDPOINT,
  UPDATE_PASSWORD_ENDPOINT,
  VERIFY_RESET_CODE_ENDPOINT,
  LOGOUT_ENDPOINT,
  REFRESH_TOKEN_ENDPOINT,
} from "../../constant/apiConfig";
import {
  AuthState,
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
  ResetPasswordData,
  ResetPasswordWithTokenData,
  UpdatePasswordData,
} from "../../../interfaces/auth";

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"),
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
  error: null,
  loginAttempts: 0,
  lastFailedAttempt: null,
  needVerification: false,
};

// Async thunks
export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: { message: string } }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(LOGIN_ENDPOINT, credentials);
    return response.data;
  } catch (err: unknown) {
    const error = err as any;
    const message =
      error.response?.data?.message || error.message || "Đăng nhập thất bại";
    return rejectWithValue({ message });
  }
});

export const registerUser = createAsyncThunk<
  RegisterResponse,
  RegisterCredentials,
  { rejectValue: { message: string } }
>("auth/registerUser", async (credentials, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(REGISTER_ENDPOINT, credentials);
    return response.data;
  } catch (err: unknown) {
    const error = err as any;
    const message =
      error.response?.data?.message || error.message || "Đăng ký thất bại";
    return rejectWithValue({ message });
  }
});

export const verifyEmailWithToken = createAsyncThunk<
  { success: boolean; message: string; user?: any },
  string,
  { rejectValue: { message: string } }
>("auth/verifyEmailWithToken", async (token, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(
      VERIFY_EMAIL_TOKEN_ENDPOINT(token)
    );
    return response.data;
  } catch (err: unknown) {
    const error = err as any;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Xác thực email thất bại";
    return rejectWithValue({ message });
  }
});

export const resendVerification = createAsyncThunk<
  { success: boolean; message: string },
  { email: string },
  { rejectValue: { message: string } }
>("auth/resendVerification", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      RESEND_VERIFICATION_ENDPOINT,
      data
    );
    return response.data;
  } catch (err: unknown) {
    const error = err as any;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Gửi lại email xác thực thất bại";
    return rejectWithValue({ message });
  }
});

export const resetPassword = createAsyncThunk<
  { success: boolean; message: string },
  ResetPasswordData,
  { rejectValue: { message: string } }
>("auth/resetPassword", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(RESET_PASSWORD_ENDPOINT, data);
    return response.data;
  } catch (err: unknown) {
    const error = err as any;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Gửi email reset mật khẩu thất bại";
    return rejectWithValue({ message });
  }
});

export const resetPasswordWithToken = createAsyncThunk<
  { success: boolean; message: string },
  { token: string; data: ResetPasswordWithTokenData },
  { rejectValue: { message: string } }
>("auth/resetPasswordWithToken", async ({ token, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      RESET_PASSWORD_WITH_TOKEN_ENDPOINT(token),
      data
    );
    return response.data;
  } catch (err: unknown) {
    const error = err as any;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Reset mật khẩu thất bại";
    return rejectWithValue({ message });
  }
});

export const verifyResetCode = createAsyncThunk<
  { success: boolean; message: string },
  { email: string; resetCode: string },
  { rejectValue: { message: string } }
>("auth/verifyResetCode", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(VERIFY_RESET_CODE_ENDPOINT, data);
    return response.data;
  } catch (err: unknown) {
    const error = err as any;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Xác thực mã reset thất bại";
    return rejectWithValue({ message });
  }
});

export const updatePassword = createAsyncThunk<
  { success: boolean; message: string },
  UpdatePasswordData,
  { rejectValue: { message: string } }
>("auth/updatePassword", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(UPDATE_PASSWORD_ENDPOINT, data);
    return response.data;
  } catch (err: unknown) {
    const error = err as any;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Cập nhật mật khẩu thất bại";
    return rejectWithValue({ message });
  }
});

export const refreshToken = createAsyncThunk<
  { accessToken: string; refreshToken: string },
  void,
  { rejectValue: { message: string } }
>("auth/refreshToken", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(REFRESH_TOKEN_ENDPOINT);
    return response.data;
  } catch (err: unknown) {
    const error = err as any;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Làm mới token thất bại";
    return rejectWithValue({ message });
  }
});

export const logoutUser = createAsyncThunk<
  { success: boolean; message: string },
  void,
  { rejectValue: { message: string } }
>("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(LOGOUT_ENDPOINT);
    return response.data;
  } catch (err: unknown) {
    const error = err as any;
    const message =
      error.response?.data?.message || error.message || "Đăng xuất thất bại";
    return rejectWithValue({ message });
  }
});

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loginAttempts = 0;
      state.lastFailedAttempt = null;
      state.needVerification = false;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      message.success("Đăng xuất thành công");
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = !action.payload.needVerification; // Only authenticated if no verification needed
        state.error = null;
        state.loginAttempts = 0;
        state.lastFailedAttempt = null;
        state.needVerification = action.payload.needVerification;
        localStorage.setItem("token", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
        localStorage.setItem("user", JSON.stringify(action.payload.user));

        // Only show success message if user doesn't need verification
        if (!action.payload.needVerification) {
          message.success(action.payload.message);
        } else {
          message.info("Vui lòng kiểm tra email để xác thực tài khoản");
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload?.message || "Đăng nhập thất bại";
        state.loginAttempts += 1;
        state.lastFailedAttempt = new Date().toISOString();
        message.error(state.error);
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = false; // Chưa cho đăng nhập ngay
        state.needVerification = true; // Yêu cầu xác thực qua email
        state.error = null;
        message.success(
          action.payload.message ||
            "Đăng ký thành công. Vui lòng kiểm tra email để xác thực."
        );
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Đăng ký thất bại";
        message.error(state.error);
      })
      // Verify email with token cases
      .addCase(verifyEmailWithToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmailWithToken.fulfilled, (state, action) => {
        state.loading = false;
        state.needVerification = false;
        state.error = null;
        message.success(action.payload.message);
      })
      .addCase(verifyEmailWithToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Xác thực email thất bại";
        message.error(state.error);
      })
      // Resend verification cases
      .addCase(resendVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerification.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        message.success(action.payload.message);
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Gửi lại email xác thực thất bại";
        message.error(state.error);
      })
      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        message.success(action.payload.message);
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Gửi email reset mật khẩu thất bại";
        message.error(state.error);
      })
      // Reset password with token cases
      .addCase(resetPasswordWithToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordWithToken.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        message.success(action.payload.message);
      })
      .addCase(resetPasswordWithToken.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Reset mật khẩu thất bại";
        message.error(state.error);
      })
      // Verify reset code cases
      .addCase(verifyResetCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyResetCode.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        message.success(action.payload.message);
      })
      .addCase(verifyResetCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Xác thực mã reset thất bại";
        message.error(state.error);
      })
      // Update password cases
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        message.success(action.payload.message);
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Cập nhật mật khẩu thất bại";
        message.error(state.error);
      })
      // Refresh token cases
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem("token", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      })
      .addCase(refreshToken.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      })
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.needVerification = false;
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        message.success(action.payload.message);
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        // Still logout locally even if API call fails
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.needVerification = false;
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        message.error("Đăng xuất thất bại");
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
