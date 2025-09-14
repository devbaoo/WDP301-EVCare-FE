import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { message } from "antd";
import axiosInstance from "../../constant/axiosInstance";
import {
  USER_PROFILE_ENDPOINT,
  USER_UPDATE_PROFILE_ENDPOINT,
  USER_UPLOAD_AVATAR_ENDPOINT,
} from "../../constant/apiConfig";
import {
  User,
  UpdateProfileData,
  ProfileResponse,
} from "../../../interfaces/auth";

// Initial state
interface UserState {
  profile: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
};

// Async thunks
export const getUserProfile = createAsyncThunk<
  ProfileResponse,
  void,
  { rejectValue: { message: string } }
>("user/getUserProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(USER_PROFILE_ENDPOINT);
    return response.data;
  } catch (err: unknown) {
    const error = err as any;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Lấy thông tin profile thất bại";
    return rejectWithValue({ message });
  }
});

export const updateUserProfile = createAsyncThunk<
  ProfileResponse,
  UpdateProfileData,
  { rejectValue: { message: string } }
>("user/updateUserProfile", async (profileData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(
      USER_UPDATE_PROFILE_ENDPOINT,
      profileData
    );
    return response.data;
  } catch (err: unknown) {
    const error = err as any;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Cập nhật profile thất bại";
    return rejectWithValue({ message });
  }
});

export const uploadAvatar = createAsyncThunk<
  ProfileResponse,
  File,
  { rejectValue: { message: string } }
>("user/uploadAvatar", async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await axiosInstance.post(
      USER_UPLOAD_AVATAR_ENDPOINT,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (err: unknown) {
    const error = err as any;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Upload avatar thất bại";
    return rejectWithValue({ message });
  }
});

// User slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProfile: (state) => {
      state.profile = null;
    },
  },
  extraReducers: (builder) => {
    // Get user profile cases
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.user;
        state.error = null;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Lấy thông tin profile thất bại";
        message.error(state.error);
      })
      // Update user profile cases
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.user;
        state.error = null;
        message.success(action.payload.message);
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Cập nhật profile thất bại";
        message.error(state.error);
      })
      // Upload avatar cases
      .addCase(uploadAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.user;
        state.error = null;
        message.success(action.payload.message);
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Upload avatar thất bại";
        message.error(state.error);
      });
  },
});

export const { clearError, clearProfile } = userSlice.actions;
export default userSlice.reducer;
