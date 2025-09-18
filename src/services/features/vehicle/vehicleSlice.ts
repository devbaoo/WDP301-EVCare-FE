import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../constant/axiosInstance";
import {
  UPDATE_VEHICLE_ENDPOINT,
  DELETE_VEHICLE_ENDPOINT,
} from "../../constant/apiConfig";
import type { Vehicle, UpdateVehicleData } from "../../../interfaces/vehicle";
import { fetchVehicles } from "../booking/bookingSlice";

interface VehicleState {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  loading: boolean;
  error: string | null;
  createVehicleLoading: boolean;
}

const initialState: VehicleState = {
  vehicles: [],
  selectedVehicle: null,
  loading: false,
  error: null,
  createVehicleLoading: false,
};

export const updateVehicle = createAsyncThunk(
  "vehicle/updateVehicle",
  async (
    {
      vehicleId,
      updateData,
    }: { vehicleId: string; updateData: UpdateVehicleData },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const info =
        "vehicleInfo" in updateData && updateData.vehicleInfo
          ? updateData.vehicleInfo
          : (updateData as {
              licensePlate?: string;
              color?: string;
              year?: number;
            });

      const payload: Record<string, string | number> = {};
      if (typeof info?.licensePlate === "string") {
        payload["vehicleInfo.licensePlate"] = info.licensePlate;
      }
      if (typeof info?.color === "string") {
        payload["vehicleInfo.color"] = info.color;
      }
      if (typeof info?.year === "number") {
        payload["vehicleInfo.year"] = info.year;
      }

      const response = await axiosInstance.put(
        UPDATE_VEHICLE_ENDPOINT(vehicleId),
        payload
      );
      if (response.data && response.data.success === false) {
        return rejectWithValue(
          response.data.message || "Failed to update vehicle"
        );
      }
      dispatch(fetchVehicles());
      return response.data;
    } catch (err: unknown) {
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to update vehicle"
      );
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  "vehicle/deleteVehicle",
  async (vehicleId: string, { rejectWithValue, dispatch }) => {
    try {
      await axiosInstance.delete(DELETE_VEHICLE_ENDPOINT(vehicleId));
      dispatch(fetchVehicles());
      return { vehicleId };
    } catch (err: unknown) {
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete vehicle"
      );
    }
  }
);

const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    setSelectedVehicle: (state, action: PayloadAction<Vehicle | null>) => {
      state.selectedVehicle = action.payload;
    },
    mergeLocalVehicleFields: (
      state,
      action: PayloadAction<{
        vehicleId: string;
        fields: Partial<{
          brand: string;
          modelName: string;
          batteryType: string;
          batteryCapacity: number | string;
        }>;
      }>
    ) => {
      const { vehicleId, fields } = action.payload;
      const idx = state.vehicles.findIndex((v) => v._id === vehicleId);
      if (idx !== -1) {
        const current = state.vehicles[idx];
        const currentInfo: any = current.vehicleInfo || {};
        state.vehicles[idx] = {
          ...current,
          vehicleInfo: {
            ...currentInfo,
            brand: fields.brand ?? currentInfo.brand,
            modelName: fields.modelName ?? currentInfo.modelName,
            batteryType: fields.batteryType ?? currentInfo.batteryType,
            batteryCapacity:
              fields.batteryCapacity !== undefined
                ? fields.batteryCapacity
                : currentInfo.batteryCapacity,
          },
        } as unknown as Vehicle;
        if (state.selectedVehicle?._id === vehicleId) {
          state.selectedVehicle = state.vehicles[idx];
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.loading = false;
        const updated: Vehicle = action.payload.data;
        const idx = state.vehicles.findIndex((v) => v._id === updated._id);
        if (idx !== -1) {
          state.vehicles[idx] = updated;
        }
        if (state.selectedVehicle?._id === updated._id) {
          state.selectedVehicle = updated;
        }
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload.vehicleId;
        state.vehicles = state.vehicles.filter((v) => v._id !== id);
        if (state.selectedVehicle?._id === id || state.vehicles.length === 0) {
          state.selectedVehicle = null;
        }
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedVehicle, mergeLocalVehicleFields } =
  vehicleSlice.actions;
export default vehicleSlice.reducer;
