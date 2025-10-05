import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../constant/axiosInstance";
import {
  COMPATIBLE_PARTS_BY_MODEL_ENDPOINT,
  PARTS_BY_CATEGORY_ENDPOINT,
  PARTS_ENDPOINT,
  PART_DETAIL_ENDPOINT,
  VEHICLE_MODELS_ENDPOINT,
} from "../../constant/apiConfig";
import {
  BaseResponse,
  Part,
  PartFilterParams,
  PartPayload,
  PartResponse,
  PartsListResponse,
  PartsState,
} from "../../../interfaces/parts";
import type { VehicleModel, VehicleModelsResponse } from "../../../interfaces/vehicle";

const initialState: PartsState = {
  parts: [],
  selectedPart: null,
  compatibleParts: [],
  vehicleModels: [],
  loading: false,
  fetchPartLoading: false,
  fetchCompatibleLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  fetchVehicleModelsLoading: false,
  error: null,
};

export const fetchVehicleModels = createAsyncThunk(
  "parts/fetchVehicleModels",
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(VEHICLE_MODELS_ENDPOINT);
      return response.data as VehicleModelsResponse;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch vehicle models"
      );
    }
  }
);

export const fetchParts = createAsyncThunk(
  "parts/fetchParts",
  async (params: PartFilterParams | undefined, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(PARTS_ENDPOINT, { params });
      return response.data as PartsListResponse;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to fetch parts");
    }
  }
);

export const fetchPartById = createAsyncThunk(
  "parts/fetchPartById",
  async (partId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(PART_DETAIL_ENDPOINT(partId));
      return response.data as PartResponse;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to fetch part detail");
    }
  }
);

export const fetchPartsByCategory = createAsyncThunk(
  "parts/fetchPartsByCategory",
  async (category: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(PARTS_BY_CATEGORY_ENDPOINT(category));
      return response.data as PartsListResponse;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to fetch parts by category");
    }
  }
);

export const fetchCompatiblePartsByModel = createAsyncThunk(
  "parts/fetchCompatiblePartsByModel",
  async (vehicleModelId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        COMPATIBLE_PARTS_BY_MODEL_ENDPOINT(vehicleModelId)
      );
      return response.data as PartsListResponse;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch compatible parts"
      );
    }
  }
);

export const createPart = createAsyncThunk(
  "parts/createPart",
  async (payload: PartPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(PARTS_ENDPOINT, payload);
      return response.data as PartResponse;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to create part");
    }
  }
);

export const updatePart = createAsyncThunk(
  "parts/updatePart",
  async (
    { partId, payload }: { partId: string; payload: Partial<PartPayload> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(PART_DETAIL_ENDPOINT(partId), payload);
      return response.data as PartResponse;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to update part");
    }
  }
);

export const deletePart = createAsyncThunk(
  "parts/deletePart",
  async (partId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(PART_DETAIL_ENDPOINT(partId));
      return { ...(response.data as BaseResponse), partId };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to delete part");
    }
  }
);

const partsSlice = createSlice({
  name: "parts",
  initialState,
  reducers: {
    resetPartsError: (state) => {
      state.error = null;
    },
    clearSelectedPart: (state) => {
      state.selectedPart = null;
    },
    clearCompatibleParts: (state) => {
      state.compatibleParts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicleModels.pending, (state) => {
        state.fetchVehicleModelsLoading = true;
        state.error = null;
      })
      .addCase(fetchVehicleModels.fulfilled, (state, action) => {
        state.fetchVehicleModelsLoading = false;
        const rawData = action.payload.data as unknown;
        if (Array.isArray(rawData)) {
          state.vehicleModels = rawData as VehicleModel[];
        } else if (
          rawData &&
          typeof rawData === "object" &&
          Array.isArray((rawData as { vehicleModels?: VehicleModel[] }).vehicleModels)
        ) {
          state.vehicleModels = (rawData as { vehicleModels: VehicleModel[] }).vehicleModels;
        } else {
          state.vehicleModels = [];
        }
      })
      .addCase(fetchVehicleModels.rejected, (state, action) => {
        state.fetchVehicleModelsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchParts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParts.fulfilled, (state, action) => {
        state.loading = false;
        state.parts = action.payload.data;
      })
      .addCase(fetchParts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPartById.pending, (state) => {
        state.fetchPartLoading = true;
        state.error = null;
      })
      .addCase(fetchPartById.fulfilled, (state, action) => {
        state.fetchPartLoading = false;
        state.selectedPart = action.payload.data;
      })
      .addCase(fetchPartById.rejected, (state, action) => {
        state.fetchPartLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPartsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPartsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.parts = action.payload.data;
      })
      .addCase(fetchPartsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCompatiblePartsByModel.pending, (state) => {
        state.fetchCompatibleLoading = true;
        state.error = null;
      })
      .addCase(fetchCompatiblePartsByModel.fulfilled, (state, action) => {
        state.fetchCompatibleLoading = false;
        state.compatibleParts = action.payload.data;
      })
      .addCase(fetchCompatiblePartsByModel.rejected, (state, action) => {
        state.fetchCompatibleLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createPart.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createPart.fulfilled, (state, action) => {
        state.createLoading = false;
        const newPart = action.payload.data;
        state.parts = [newPart, ...state.parts.filter((part) => part._id !== newPart._id)];
      })
      .addCase(createPart.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePart.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updatePart.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedPart = action.payload.data;
        state.parts = state.parts.map((part) =>
          part._id === updatedPart._id ? (updatedPart as Part) : part
        );
        if (state.selectedPart && state.selectedPart._id === updatedPart._id) {
          state.selectedPart = updatedPart as Part;
        }
        state.compatibleParts = state.compatibleParts.map((part) =>
          part._id === updatedPart._id ? (updatedPart as Part) : part
        );
      })
      .addCase(updatePart.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deletePart.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deletePart.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const { partId } = action.payload;
        state.parts = state.parts.filter((part) => part._id !== partId);
        state.compatibleParts = state.compatibleParts.filter((part) => part._id !== partId);
        if (state.selectedPart && state.selectedPart._id === partId) {
          state.selectedPart = null;
        }
      })
      .addCase(deletePart.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetPartsError, clearSelectedPart, clearCompatibleParts } =
  partsSlice.actions;

export default partsSlice.reducer;
