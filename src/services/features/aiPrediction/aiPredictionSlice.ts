import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { message } from "antd";
import axiosInstance from "../../constant/axiosInstance";
import {
  AI_PREDICTION_GENERATE_ENDPOINT,
  AI_PREDICTION_REGENERATE_ENDPOINT,
  AI_PREDICTION_LATEST_ENDPOINT,
  AI_PREDICTION_HISTORY_ENDPOINT,
  AI_PREDICTION_STATS_ENDPOINT,
} from "../../constant/apiConfig";
import {
  AIPredictionState,
  AIPredictionResponse,
  AIPredictionHistoryResponse,
  AIPredictionStatsResponse,
} from "../../../interfaces/aiPrediction";

// Initial state
const initialState: AIPredictionState = {
  latestPrediction: null,
  predictionHistory: [],
  stats: null,
  loading: false,
  generateLoading: false,
  regenerateLoading: false,
  historyLoading: false,
  statsLoading: false,
  error: null,
  pagination: null,
};

// Async thunks
export const generateAIPrediction = createAsyncThunk<
  AIPredictionResponse,
  string,
  { rejectValue: { message: string } }
>("aiPrediction/generatePrediction", async (centerId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      AI_PREDICTION_GENERATE_ENDPOINT(centerId)
    );
    message.success("Tạo dự đoán AI thành công!");
    return response.data;
  } catch (err: unknown) {
    const error = err as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Tạo dự đoán AI thất bại";
    message.error(errorMessage);
    return rejectWithValue({ message: errorMessage });
  }
});

export const regenerateAIPrediction = createAsyncThunk<
  AIPredictionResponse,
  string,
  { rejectValue: { message: string } }
>(
  "aiPrediction/regeneratePrediction",
  async (centerId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        AI_PREDICTION_REGENERATE_ENDPOINT(centerId)
      );
      message.success("Tạo lại dự đoán AI thành công!");
      return response.data;
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Tạo lại dự đoán AI thất bại";
      message.error(errorMessage);
      return rejectWithValue({ message: errorMessage });
    }
  }
);

export const fetchLatestPrediction = createAsyncThunk<
  AIPredictionResponse,
  string,
  { rejectValue: { message: string } }
>(
  "aiPrediction/fetchLatestPrediction",
  async (centerId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        AI_PREDICTION_LATEST_ENDPOINT(centerId)
      );
      return response.data;
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Lấy dự đoán mới nhất thất bại";
      return rejectWithValue({ message: errorMessage });
    }
  }
);

export const fetchPredictionHistory = createAsyncThunk<
  AIPredictionHistoryResponse,
  { centerId: string; page?: number; limit?: number },
  { rejectValue: { message: string } }
>(
  "aiPrediction/fetchPredictionHistory",
  async ({ centerId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      const url = `${AI_PREDICTION_HISTORY_ENDPOINT(
        centerId
      )}?${queryParams.toString()}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Lấy lịch sử dự đoán thất bại";
      return rejectWithValue({ message: errorMessage });
    }
  }
);

export const fetchPredictionStats = createAsyncThunk<
  AIPredictionStatsResponse,
  string,
  { rejectValue: { message: string } }
>(
  "aiPrediction/fetchPredictionStats",
  async (centerId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        AI_PREDICTION_STATS_ENDPOINT(centerId)
      );
      return response.data;
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Lấy thống kê dự đoán thất bại";
      return rejectWithValue({ message: errorMessage });
    }
  }
);

// Slice
const aiPredictionSlice = createSlice({
  name: "aiPrediction",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate prediction
      .addCase(generateAIPrediction.pending, (state) => {
        state.generateLoading = true;
        state.error = null;
      })
      .addCase(generateAIPrediction.fulfilled, (state, action) => {
        state.generateLoading = false;
        state.latestPrediction = action.payload.data;
      })
      .addCase(generateAIPrediction.rejected, (state, action) => {
        state.generateLoading = false;
        state.error = action.payload?.message || "Tạo dự đoán AI thất bại";
      })

      // Regenerate prediction
      .addCase(regenerateAIPrediction.pending, (state) => {
        state.regenerateLoading = true;
        state.error = null;
      })
      .addCase(regenerateAIPrediction.fulfilled, (state, action) => {
        state.regenerateLoading = false;
        state.latestPrediction = action.payload.data;
      })
      .addCase(regenerateAIPrediction.rejected, (state, action) => {
        state.regenerateLoading = false;
        state.error = action.payload?.message || "Tạo lại dự đoán AI thất bại";
      })

      // Fetch latest prediction
      .addCase(fetchLatestPrediction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLatestPrediction.fulfilled, (state, action) => {
        state.loading = false;
        state.latestPrediction = action.payload.data;
      })
      .addCase(fetchLatestPrediction.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Lấy dự đoán mới nhất thất bại";
      })

      // Fetch prediction history
      .addCase(fetchPredictionHistory.pending, (state) => {
        state.historyLoading = true;
        state.error = null;
      })
      .addCase(fetchPredictionHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.predictionHistory = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPredictionHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload?.message || "Lấy lịch sử dự đoán thất bại";
      })

      // Fetch prediction stats
      .addCase(fetchPredictionStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchPredictionStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchPredictionStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error =
          action.payload?.message || "Lấy thống kê dự đoán thất bại";
      });
  },
});

export const { clearError, resetState } = aiPredictionSlice.actions;
export default aiPredictionSlice.reducer;
