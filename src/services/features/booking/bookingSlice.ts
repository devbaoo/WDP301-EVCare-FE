import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../constant/axiosInstance";
import {
  VEHICLES_ENDPOINT,
  CREATE_VEHICLE_ENDPOINT,
  UPDATE_VEHICLE_ENDPOINT,
  DELETE_VEHICLE_ENDPOINT,
  POPULAR_SERVICE_TYPES_ENDPOINT,
  COMPATIBLE_SERVICES_ENDPOINT,
  COMPATIBLE_PACKAGES_ENDPOINT,
  CREATE_BOOKING_ENDPOINT,
  BOOKING_TIME_SLOTS_ENDPOINT,
  BOOKING_SERVICE_CENTERS_ENDPOINT,
  SERVICE_CENTER_NEARBY_ENDPOINT,
} from "../../constant/apiConfig";
import { Vehicle, CreateVehicleData } from "../../../interfaces/vehicle";
import {
  ServiceType,
  ServicePackage,
  BookingData,
  BookingServiceCenter,
  BookingState,
} from "../../../interfaces/booking";

// Local overrides for display-only fields that BE doesn't persist
const VEHICLE_OVERRIDES_KEY = "vehicle_overrides_v1";
type VehicleOverrideFields = Partial<{
  brand: string;
  modelName: string;
  batteryType: string;
  batteryCapacity: number | string;
}>;
function loadVehicleOverrides(): Record<string, VehicleOverrideFields> {
  try {
    const raw = localStorage.getItem(VEHICLE_OVERRIDES_KEY);
    const result = raw
      ? (JSON.parse(raw) as Record<string, VehicleOverrideFields>)
      : {};
    console.log("loadVehicleOverrides result:", result);
    return result;
  } catch (e) {
    console.error("Error loading vehicle overrides:", e);
    return {};
  }
}

// Using BookingState from interfaces/booking.ts

// Using any for error handling like other slices in the project

const initialState: BookingState = {
  currentStep: 1,
  bookingData: {},
  vehicles: [],
  selectedVehicle: null,
  serviceCenters: [],
  selectedServiceCenter: null,
  compatibleServices: [],
  selectedService: null,
  compatiblePackages: [],
  selectedServicePackage: null,
  availableTimeSlots: [],
  popularServices: [],
  loading: false,
  error: null,
  createVehicleLoading: false,
  createBookingLoading: false,
};

// Async thunks
export const fetchVehicles = createAsyncThunk(
  "booking/fetchVehicles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(VEHICLES_ENDPOINT);
      return response.data.data;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch vehicles"
      );
    }
  }
);

export const updateVehicle = createAsyncThunk(
  "booking/updateVehicle",
  async (
    {
      vehicleId,
      updateData,
    }: { vehicleId: string; updateData: Record<string, unknown> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(
        UPDATE_VEHICLE_ENDPOINT(vehicleId),
        updateData
      );
      if (response.data && response.data.success === false) {
        return rejectWithValue(
          response.data.message || "Failed to update vehicle"
        );
      }
      return response.data;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to update vehicle"
      );
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  "booking/deleteVehicle",
  async (vehicleId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        DELETE_VEHICLE_ENDPOINT(vehicleId)
      );
      if (response.data && response.data.success === false) {
        return rejectWithValue(
          response.data.message || "Failed to delete vehicle"
        );
      }
      return { vehicleId };
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete vehicle"
      );
    }
  }
);

export const createVehicle = createAsyncThunk(
  "booking/createVehicle",
  async (vehicleData: CreateVehicleData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        CREATE_VEHICLE_ENDPOINT,
        vehicleData
      );
      if (response.data && response.data.success === false) {
        return rejectWithValue(
          response.data.message || "Failed to create vehicle"
        );
      }
      return response.data;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to create vehicle"
      );
    }
  }
);

export const fetchBookingServiceCenters = createAsyncThunk(
  "booking/fetchBookingServiceCenters",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        BOOKING_SERVICE_CENTERS_ENDPOINT
      );
      return response.data.data;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch service centers"
      );
    }
  }
);

// Nearby service centers (by coordinates)
export const fetchNearbyServiceCenters = createAsyncThunk(
  "booking/fetchNearbyServiceCenters",
  async (
    {
      lat,
      lng,
      radiusKm = 50,
    }: { lat: number; lng: number; radiusKm?: number },
    { rejectWithValue }
  ) => {
    try {
      const url = `${SERVICE_CENTER_NEARBY_ENDPOINT}?lat=${lat}&lng=${lng}&radius=${radiusKm}`;
      const response = await axiosInstance.get(url);
      const data =
        response.data?.data?.serviceCenters ||
        response.data?.data ||
        response.data?.serviceCenters ||
        response.data;
      return data;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch nearby service centers"
      );
    }
  }
);

export const fetchPopularServices = createAsyncThunk(
  "booking/fetchPopularServices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(POPULAR_SERVICE_TYPES_ENDPOINT);
      return response.data.data;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch popular services"
      );
    }
  }
);

export const fetchCompatibleServices = createAsyncThunk(
  "booking/fetchCompatibleServices",
  async (vehicleId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        COMPATIBLE_SERVICES_ENDPOINT(vehicleId)
      );
      return response.data.data;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch compatible services"
      );
    }
  }
);

export const fetchCompatiblePackages = createAsyncThunk(
  "booking/fetchCompatiblePackages",
  async (vehicleId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        COMPATIBLE_PACKAGES_ENDPOINT(vehicleId)
      );
      // API returns { success, message, data: ServicePackage[] }
      return response.data.data as ServicePackage[];
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch compatible packages"
      );
    }
  }
);

export const fetchAvailableTimeSlots = createAsyncThunk(
  "booking/fetchAvailableTimeSlots",
  async (
    {
      serviceCenterId,
      date,
    }: {
      serviceCenterId: string;
      date: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(
        BOOKING_TIME_SLOTS_ENDPOINT(serviceCenterId, date)
      );
      return response.data.data;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch time slots"
      );
    }
  }
);

export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (bookingData: BookingData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        CREATE_BOOKING_ENDPOINT,
        bookingData
      );
      return response.data;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to create booking"
      );
    }
  }
);

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      state.currentStep += 1;
    },
    prevStep: (state) => {
      state.currentStep -= 1;
    },
    setSelectedVehicle: (state, action: PayloadAction<Vehicle | null>) => {
      state.selectedVehicle = action.payload;
      state.bookingData.vehicleId = action.payload?._id || "";
    },
    setSelectedServiceCenter: (
      state,
      action: PayloadAction<BookingServiceCenter | null>
    ) => {
      state.selectedServiceCenter = action.payload;
      state.bookingData.serviceCenterId = action.payload?._id || "";
    },
    setSelectedService: (state, action: PayloadAction<ServiceType | null>) => {
      state.selectedService = action.payload;
      state.bookingData.serviceTypeId = action.payload?._id || "";
      // If user picks a single service, clear selected package
      if (action.payload) {
        state.selectedServicePackage = null;
        delete state.bookingData.servicePackageId;
      }
    },
    setSelectedServicePackage: (
      state,
      action: PayloadAction<ServicePackage | null>
    ) => {
      state.selectedServicePackage = action.payload;
      state.bookingData.servicePackageId = action.payload?._id || "";
      // When choosing a package, clear single service selection
      if (action.payload) {
        state.selectedService = null;
        delete state.bookingData.serviceTypeId;
      }
    },
    updateBookingData: (state, action: PayloadAction<Partial<BookingData>>) => {
      state.bookingData = { ...state.bookingData, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetBooking: (state) => {
      state.currentStep = 1;
      state.bookingData = {};
      state.selectedVehicle = null;
      state.selectedServiceCenter = null;
      state.selectedService = null;
      state.selectedServicePackage = null;
      state.availableTimeSlots = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch vehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        // Apply local overrides if present
        const overrides = loadVehicleOverrides();
        console.log("fetchVehicles.fulfilled - overrides:", overrides);
        state.vehicles = (action.payload as Vehicle[]).map((v) => {
          const o = overrides[v._id];
          if (!o) return v;
          console.log(`Applying overrides for vehicle ${v._id}:`, o);
          const currentInfo: any = v.vehicleInfo || {};
          return {
            ...v,
            vehicleInfo: {
              ...currentInfo,
              brand: o.brand ?? currentInfo.brand,
              modelName: o.modelName ?? currentInfo.modelName,
              batteryType: o.batteryType ?? currentInfo.batteryType,
              batteryCapacity:
                o.batteryCapacity !== undefined
                  ? o.batteryCapacity
                  : currentInfo.batteryCapacity,
            },
          } as unknown as Vehicle;
        });
        // Update selectedVehicle if it exists in the updated vehicles
        if (state.selectedVehicle) {
          const updatedSelectedVehicle = state.vehicles.find(
            (v) => v._id === state.selectedVehicle?._id
          );
          if (updatedSelectedVehicle) {
            console.log("Updated selectedVehicle:", updatedSelectedVehicle);
            state.selectedVehicle = updatedSelectedVehicle;
          }
        }
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create vehicle
      .addCase(createVehicle.pending, (state) => {
        state.createVehicleLoading = true;
        state.error = null;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.createVehicleLoading = false;
        state.vehicles.push(action.payload.data);
        state.selectedVehicle = action.payload.data;
        state.bookingData.vehicleId = action.payload.data._id;
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.createVehicleLoading = false;
        state.error = action.payload as string;
      })
      // Update vehicle
      .addCase(updateVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.loading = false;
        const updated: Vehicle = action.payload.data;
        const idx = state.vehicles.findIndex((v) => v._id === updated._id);
        if (idx !== -1) {
          // Apply local overrides to maintain display fields
          const overrides = loadVehicleOverrides();
          const o = overrides[updated._id];
          const currentInfo: any = updated.vehicleInfo || {};
          state.vehicles[idx] = {
            ...updated,
            vehicleInfo: o
              ? {
                  ...currentInfo,
                  brand: o.brand ?? currentInfo.brand,
                  modelName: o.modelName ?? currentInfo.modelName,
                  batteryType: o.batteryType ?? currentInfo.batteryType,
                  batteryCapacity:
                    o.batteryCapacity !== undefined
                      ? o.batteryCapacity
                      : currentInfo.batteryCapacity,
                }
              : currentInfo,
          } as unknown as Vehicle;
        }
        if (state.selectedVehicle?._id === updated._id) {
          const overrides = loadVehicleOverrides();
          const o = overrides[updated._id];
          const currentInfo: any = updated.vehicleInfo || {};
          state.selectedVehicle = (o
            ? {
                ...updated,
                vehicleInfo: {
                  ...currentInfo,
                  brand: o.brand ?? currentInfo.brand,
                  modelName: o.modelName ?? currentInfo.modelName,
                  batteryType: o.batteryType ?? currentInfo.batteryType,
                  batteryCapacity:
                    o.batteryCapacity !== undefined
                      ? o.batteryCapacity
                      : currentInfo.batteryCapacity,
                },
              }
            : updated) as unknown as Vehicle;
        }
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete vehicle
      .addCase(deleteVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload.vehicleId;
        state.vehicles = state.vehicles.filter((v) => v._id !== id);
        // Đồng bộ thêm: nếu danh sách còn 0 xe, đảm bảo selectedVehicle rỗng
        if (state.selectedVehicle?._id === id || state.vehicles.length === 0) {
          state.selectedVehicle = null;
        }
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch booking service centers
      .addCase(fetchBookingServiceCenters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingServiceCenters.fulfilled, (state, action) => {
        state.loading = false;
        state.serviceCenters = action.payload;
      })
      .addCase(fetchBookingServiceCenters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Nearby service centers
      .addCase(fetchNearbyServiceCenters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNearbyServiceCenters.fulfilled, (state, action) => {
        state.loading = false;
        state.serviceCenters = action.payload;
      })
      .addCase(fetchNearbyServiceCenters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch popular services
      .addCase(fetchPopularServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularServices.fulfilled, (state, action) => {
        state.loading = false;
        state.popularServices = action.payload;
      })
      .addCase(fetchPopularServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch compatible services
      .addCase(fetchCompatibleServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompatibleServices.fulfilled, (state, action) => {
        state.loading = false;
        state.compatibleServices = action.payload;
      })
      .addCase(fetchCompatibleServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch compatible packages
      .addCase(fetchCompatiblePackages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompatiblePackages.fulfilled, (state, action) => {
        state.loading = false;
        state.compatiblePackages = action.payload;
      })
      .addCase(fetchCompatiblePackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch available time slots
      .addCase(fetchAvailableTimeSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableTimeSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.availableTimeSlots = action.payload.availableSlots;
      })
      .addCase(fetchAvailableTimeSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.createBookingLoading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state) => {
        state.createBookingLoading = false;
        // Reset booking state after successful creation
        state.currentStep = 1;
        state.bookingData = {};
        state.selectedVehicle = null;
        state.selectedServiceCenter = null;
        state.selectedService = null;
        state.selectedServicePackage = null;
        state.availableTimeSlots = [];
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.createBookingLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentStep,
  nextStep,
  prevStep,
  setSelectedVehicle,
  setSelectedServiceCenter,
  setSelectedService,
  setSelectedServicePackage,
  updateBookingData,
  clearError,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
