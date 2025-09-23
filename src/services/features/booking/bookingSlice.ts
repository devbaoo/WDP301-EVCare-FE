import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../constant/axiosInstance";
import {
  VEHICLES_ENDPOINT,
  CREATE_VEHICLE_ENDPOINT,
  POPULAR_SERVICE_TYPES_ENDPOINT,
  COMPATIBLE_SERVICES_ENDPOINT,
  COMPATIBLE_PACKAGES_ENDPOINT,
  CREATE_BOOKING_ENDPOINT,
  BOOKING_TIME_SLOTS_ENDPOINT,
  BOOKING_SERVICE_CENTERS_ENDPOINT,
  SERVICE_CENTER_NEARBY_ENDPOINT,
  MY_BOOKINGS_ENDPOINT,
  BOOKING_DETAILS_ENDPOINT,
  BOOKING_RESCHEDULE_ENDPOINT,
  BOOKING_CANCEL_ENDPOINT,
  BOOKING_AWAITING_CONFIRMATION_ENDPOINT,
  BOOKING_CONFIRM_ENDPOINT,
  BOOKINGS_CONFIRMED_ENDPOINT,
} from "../../constant/apiConfig";
import { Vehicle, CreateVehicleData } from "../../../interfaces/vehicle";
import {
  ServiceType,
  ServicePackage,
  BookingData,
  BookingServiceCenter,
  BookingState,
  AwaitingConfirmationQueryParams,
} from "../../../interfaces/booking";

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
  myBookings: [],
  bookingDetails: null,
  // Admin booking confirmation
  awaitingConfirmationBookings: [],
  awaitingConfirmationPagination: null,
  awaitingConfirmationLoading: false,
  confirmBookingLoading: false,
  // Staff confirmed bookings
  confirmedBookings: [],
  confirmedBookingsPagination: null,
  confirmedBookingsLoading: false,
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

// Async thunk for fetching my bookings
export const fetchMyBookings = createAsyncThunk(
  "booking/fetchMyBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(MY_BOOKINGS_ENDPOINT);
      return response.data.data; // Assuming the API returns bookings in `data`
    } catch (err: unknown) {
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch bookings"
      );
    }
  }
);

// Async thunk for fetching booking details
export const fetchBookingDetails = createAsyncThunk(
  "booking/fetchBookingDetails",
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        BOOKING_DETAILS_ENDPOINT(bookingId)
      );
      return response.data.data; // Assuming the API returns booking details in `data`
    } catch (err: unknown) {
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch booking details"
      );
    }
  }
);

// Dời lịch hẹn
export const rescheduleBooking = createAsyncThunk(
  "booking/reschedule",
  async (
    {
      bookingId,
      appointmentDate,
      appointmentTime,
    }: { bookingId: string; appointmentDate: string; appointmentTime: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(
        BOOKING_RESCHEDULE_ENDPOINT(bookingId),
        { newDate: appointmentDate, newTime: appointmentTime }
      );
      return response.data;
    } catch (err: unknown) {
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to reschedule booking"
      );
    }
  }
);

// Hủy lịch hẹn
export const cancelBooking = createAsyncThunk(
  "booking/cancel",
  async (
    { bookingId, reason }: { bookingId: string; reason?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(
        BOOKING_CANCEL_ENDPOINT(bookingId),
        { reason }
      );
      return response.data;
    } catch (err: unknown) {
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel booking"
      );
    }
  }
);

// Admin booking confirmation async thunks
export const fetchAwaitingConfirmationBookings = createAsyncThunk(
  "booking/fetchAwaitingConfirmation",
  async (params: AwaitingConfirmationQueryParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        BOOKING_AWAITING_CONFIRMATION_ENDPOINT,
        { params }
      );
      return response.data;
    } catch (err: unknown) {
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch awaiting confirmation bookings"
      );
    }
  }
);

export const confirmBooking = createAsyncThunk(
  "booking/confirm",
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        BOOKING_CONFIRM_ENDPOINT(bookingId)
      );
      return response.data;
    } catch (err: unknown) {
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to confirm booking"
      );
    }
  }
);

// Fetch confirmed bookings (for staff/technicians)
export const fetchConfirmedBookings = createAsyncThunk(
  "booking/fetchConfirmed",
  async (params: AwaitingConfirmationQueryParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BOOKINGS_CONFIRMED_ENDPOINT, {
        params,
      });
      return response.data;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch confirmed bookings"
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
        state.vehicles = action.payload;
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
      .addCase(createBooking.fulfilled, (state, action) => {
        state.createBookingLoading = false;

        // Store booking and payment data for payment flow
        state.bookingDetails = action.payload.data.appointment;

        // Only reset state if no payment is required
        if (!action.payload.data.requiresPayment) {
          // Reset booking state after successful creation
          state.currentStep = 1;
          state.bookingData = {};
          state.selectedVehicle = null;
          state.selectedServiceCenter = null;
          state.selectedService = null;
          state.selectedServicePackage = null;
          state.availableTimeSlots = [];
          // Fetch updated bookings
          state.myBookings = action.payload.data.myBookings || state.myBookings;
        }
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.createBookingLoading = false;
        state.error = action.payload as string;
      })
      // Fetch my bookings
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.myBookings = action.payload; // Assuming `myBookings` is part of the state
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch booking details
      .addCase(fetchBookingDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingDetails = action.payload; // Assuming `bookingDetails` is part of the state
      })
      .addCase(fetchBookingDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reschedule booking
      .addCase(rescheduleBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rescheduleBooking.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(rescheduleBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Cancel booking
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch awaiting confirmation bookings
      .addCase(fetchAwaitingConfirmationBookings.pending, (state) => {
        state.awaitingConfirmationLoading = true;
        state.error = null;
      })
      .addCase(fetchAwaitingConfirmationBookings.fulfilled, (state, action) => {
        state.awaitingConfirmationLoading = false;
        state.awaitingConfirmationBookings = action.payload.data.appointments;
        state.awaitingConfirmationPagination = action.payload.data.pagination;
      })
      .addCase(fetchAwaitingConfirmationBookings.rejected, (state, action) => {
        state.awaitingConfirmationLoading = false;
        state.error = action.payload as string;
      })
      // Confirm booking
      .addCase(confirmBooking.pending, (state) => {
        state.confirmBookingLoading = true;
        state.error = null;
      })
      .addCase(confirmBooking.fulfilled, (state, action) => {
        state.confirmBookingLoading = false;
        // Remove confirmed booking from awaiting list
        state.awaitingConfirmationBookings =
          state.awaitingConfirmationBookings.filter(
            (booking) => booking._id !== action.payload.data._id
          );
      })
      .addCase(confirmBooking.rejected, (state, action) => {
        state.confirmBookingLoading = false;
        state.error = action.payload as string;
      })
      // Fetch confirmed bookings
      .addCase(fetchConfirmedBookings.pending, (state) => {
        state.confirmedBookingsLoading = true;
        state.error = null;
      })
      .addCase(fetchConfirmedBookings.fulfilled, (state, action) => {
        state.confirmedBookingsLoading = false;
        state.confirmedBookings = action.payload.data.appointments;
        state.confirmedBookingsPagination = action.payload.data.pagination;
      })
      .addCase(fetchConfirmedBookings.rejected, (state, action) => {
        state.confirmedBookingsLoading = false;
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
