import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../constant/axiosInstance";
import {
  AI_APPLY_RECOMMENDATIONS_ENDPOINT,
  AI_DEMAND_FORECAST_ENDPOINT,
  AI_PREDICTION_DETAIL_ENDPOINT,
  AI_PREDICTIONS_ENDPOINT,
  AI_STOCK_OPTIMIZATION_ENDPOINT,
} from "../../constant/apiConfig";
import {
  AiPrediction,
  AiPredictionResponse,
  AiPredictionsResponse,
  AiState,
  ApplyRecommendationsPayload,
  ApplyRecommendationsResponse,
  DemandForecastPayload,
  StockOptimizationPayload,
} from "../../../interfaces/parts";

const initialState: AiState = {
  predictions: [],
  selectedPrediction: null,
  latestDemandForecast: [],
  latestStockOptimization: [],
  applyResults: [],
  loading: false,
  fetchPredictionLoading: false,
  demandForecastLoading: false,
  stockOptimizationLoading: false,
  applyRecommendationsLoading: false,
  error: null,
};

const mergePredictions = (
  existing: AiPrediction[],
  incoming: AiPrediction[]
) => {
  const map = new Map<string, AiPrediction>();
  existing.forEach((prediction) => {
    map.set(prediction._id, prediction);
  });
  incoming.forEach((prediction) => {
    map.set(prediction._id, prediction);
  });
  return Array.from(map.values());
};

export const fetchAiPredictions = createAsyncThunk(
  "ai/fetchAiPredictions",
  async (
    params:
      | {
          centerId?: string;
          partId?: string;
          predictionType?: string;
          predictionPeriod?: string;
          startDate?: string;
          endDate?: string;
        }
      | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(AI_PREDICTIONS_ENDPOINT, {
        params,
      });
      return response.data as AiPredictionsResponse;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch AI predictions"
      );
    }
  }
);

export const fetchAiPredictionById = createAsyncThunk(
  "ai/fetchAiPredictionById",
  async (predictionId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        AI_PREDICTION_DETAIL_ENDPOINT(predictionId)
      );
      return response.data as AiPredictionResponse;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch AI prediction detail"
      );
    }
  }
);

export const createDemandForecast = createAsyncThunk(
  "ai/createDemandForecast",
  async (payload: DemandForecastPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        AI_DEMAND_FORECAST_ENDPOINT,
        payload
      );
      return response.data as AiPredictionsResponse;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to create demand forecast"
      );
    }
  }
);

export const createStockOptimization = createAsyncThunk(
  "ai/createStockOptimization",
  async (payload: StockOptimizationPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        AI_STOCK_OPTIMIZATION_ENDPOINT,
        payload
      );
      return response.data as AiPredictionsResponse;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to create stock optimization"
      );
    }
  }
);

export const applyAiRecommendations = createAsyncThunk(
  "ai/applyAiRecommendations",
  async (payload: ApplyRecommendationsPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        AI_APPLY_RECOMMENDATIONS_ENDPOINT,
        payload
      );
      return response.data as ApplyRecommendationsResponse;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to apply AI recommendations"
      );
    }
  }
);

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    resetAiError: (state) => {
      state.error = null;
    },
    clearSelectedPrediction: (state) => {
      state.selectedPrediction = null;
    },
    clearAiApplyResults: (state) => {
      state.applyResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAiPredictions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAiPredictions.fulfilled, (state, action) => {
        state.loading = false;
        state.predictions = action.payload.data;
      })
      .addCase(fetchAiPredictions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAiPredictionById.pending, (state) => {
        state.fetchPredictionLoading = true;
        state.error = null;
      })
      .addCase(fetchAiPredictionById.fulfilled, (state, action) => {
        state.fetchPredictionLoading = false;
        state.selectedPrediction = action.payload.data;
        state.predictions = mergePredictions(state.predictions, [
          action.payload.data,
        ]);
      })
      .addCase(fetchAiPredictionById.rejected, (state, action) => {
        state.fetchPredictionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createDemandForecast.pending, (state) => {
        state.demandForecastLoading = true;
        state.error = null;
      })
      .addCase(createDemandForecast.fulfilled, (state, action) => {
        state.demandForecastLoading = false;
        state.latestDemandForecast = action.payload.data;
        state.predictions = mergePredictions(
          state.predictions,
          action.payload.data
        );
      })
      .addCase(createDemandForecast.rejected, (state, action) => {
        state.demandForecastLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createStockOptimization.pending, (state) => {
        state.stockOptimizationLoading = true;
        state.error = null;
      })
      .addCase(createStockOptimization.fulfilled, (state, action) => {
        state.stockOptimizationLoading = false;
        state.latestStockOptimization = action.payload.data;
        state.predictions = mergePredictions(
          state.predictions,
          action.payload.data
        );
      })
      .addCase(createStockOptimization.rejected, (state, action) => {
        state.stockOptimizationLoading = false;
        state.error = action.payload as string;
      })
      .addCase(applyAiRecommendations.pending, (state) => {
        state.applyRecommendationsLoading = true;
        state.error = null;
      })
      .addCase(applyAiRecommendations.fulfilled, (state, action) => {
        state.applyRecommendationsLoading = false;
        state.applyResults = action.payload.data;
      })
      .addCase(applyAiRecommendations.rejected, (state, action) => {
        state.applyRecommendationsLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetAiError, clearSelectedPrediction, clearAiApplyResults } =
  aiSlice.actions;

export default aiSlice.reducer;
