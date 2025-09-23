import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../constant/axiosInstance";
import {
  TECHNICIAN_SCHEDULE_CREATE_ENDPOINT,
  TECHNICIAN_SCHEDULE_CREATE_DEFAULT_ENDPOINT,
  TECHNICIAN_SCHEDULE_LIST_ENDPOINT,
  TECHNICIAN_SCHEDULE_BY_CENTER_ENDPOINT,
  TECHNICIAN_SCHEDULE_UPDATE_ENDPOINT,
  TECHNICIAN_SCHEDULE_DELETE_ENDPOINT,
  TECHNICIAN_STAFF_BY_CENTER_ENDPOINT,
  AVAILABLE_TECHNICIANS_ENDPOINT,
  TECHNICIAN_SCHEDULE_ADD_APPOINTMENT_ENDPOINT,
} from "../../constant/apiConfig";
import {
  TechnicianState,
  CreateSingleSchedulePayload,
  CreateDefaultSchedulesPayload,
  CreateSingleScheduleResponse,
  CreateDefaultSchedulesResponse,
  TechnicianScheduleListResponse,
  TechnicianScheduleByCenterResponse,
  TechnicianScheduleQueryParams,
  TechnicianStaffResponse,
  AvailableTechniciansResponse,
  UpdateSchedulePayload,
  UpdateScheduleResponse,
  DeleteScheduleResponse,
} from "../../../interfaces/technician";

const initialState: TechnicianState = {
  schedules: [],
  technicianStaff: [],
  availableTechnicians: [],
  pagination: null,
  loading: false,
  createScheduleLoading: false,
  createDefaultSchedulesLoading: false,
  fetchSchedulesLoading: false,
  fetchSchedulesByCenterLoading: false,
  fetchStaffLoading: false,
  fetchAvailableTechniciansLoading: false,
  updateScheduleLoading: false,
  deleteScheduleLoading: false,
  error: null,
};

// Async thunks
export const createSingleSchedule = createAsyncThunk(
  "technician/createSingleSchedule",
  async (payload: CreateSingleSchedulePayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        TECHNICIAN_SCHEDULE_CREATE_ENDPOINT,
        payload
      );
      return response.data as CreateSingleScheduleResponse;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to create schedule"
      );
    }
  }
);

export const createDefaultSchedules = createAsyncThunk(
  "technician/createDefaultSchedules",
  async (payload: CreateDefaultSchedulesPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        TECHNICIAN_SCHEDULE_CREATE_DEFAULT_ENDPOINT,
        payload
      );
      return response.data as CreateDefaultSchedulesResponse;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to create default schedules"
      );
    }
  }
);

export const fetchTechnicianSchedules = createAsyncThunk(
  "technician/fetchTechnicianSchedules",
  async (params: TechnicianScheduleQueryParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        TECHNICIAN_SCHEDULE_LIST_ENDPOINT,
        { params }
      );
      return response.data as TechnicianScheduleListResponse;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch technician schedules"
      );
    }
  }
);

export const fetchTechnicianSchedulesByCenter = createAsyncThunk(
  "technician/fetchTechnicianSchedulesByCenter",
  async (
    params: {
      centerId: string;
      workDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(
        TECHNICIAN_SCHEDULE_BY_CENTER_ENDPOINT,
        { params }
      );
      return response.data as TechnicianScheduleByCenterResponse;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch technician schedules by center"
      );
    }
  }
);

export const fetchTechnicianStaff = createAsyncThunk(
  "technician/fetchTechnicianStaff",
  async (centerId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        TECHNICIAN_STAFF_BY_CENTER_ENDPOINT(centerId)
      );
      return response.data as TechnicianStaffResponse;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch technician staff"
      );
    }
  }
);

export const fetchAvailableTechnicians = createAsyncThunk(
  "technician/fetchAvailableTechnicians",
  async (
    {
      centerId,
      date,
      timeSlot,
    }: { centerId: string; date: string; timeSlot: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(
        AVAILABLE_TECHNICIANS_ENDPOINT(centerId),
        {
          params: { date, timeSlot },
        }
      );
      return response.data as AvailableTechniciansResponse;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch available technicians"
      );
    }
  }
);

export const updateSchedule = createAsyncThunk(
  "technician/updateSchedule",
  async (payload: UpdateSchedulePayload, { rejectWithValue }) => {
    try {
      const { _id, ...updateData } = payload;
      const response = await axiosInstance.put(
        TECHNICIAN_SCHEDULE_UPDATE_ENDPOINT(_id),
        updateData
      );
      return response.data as UpdateScheduleResponse;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to update schedule"
      );
    }
  }
);

export const deleteSchedule = createAsyncThunk(
  "technician/deleteSchedule",
  async (scheduleId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        TECHNICIAN_SCHEDULE_DELETE_ENDPOINT(scheduleId)
      );
      return response.data as DeleteScheduleResponse;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete schedule"
      );
    }
  }
);

// Assign an appointment to a technician schedule
export const addAppointmentToSchedule = createAsyncThunk(
  "technician/addAppointmentToSchedule",
  async (
    payload: { scheduleId: string; appointmentId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(
        TECHNICIAN_SCHEDULE_ADD_APPOINTMENT_ENDPOINT(payload.scheduleId),
        { appointmentId: payload.appointmentId }
      );
      // Response shape is compatible with UpdateScheduleResponse (data: TechnicianSchedule)
      return response.data as UpdateScheduleResponse;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to assign appointment to schedule"
      );
    }
  }
);

const technicianSlice = createSlice({
  name: "technician",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSchedules: (state) => {
      state.schedules = [];
    },
    clearStaff: (state) => {
      state.technicianStaff = [];
    },
    clearAvailableTechnicians: (state) => {
      state.availableTechnicians = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Create single schedule
      .addCase(createSingleSchedule.pending, (state) => {
        state.createScheduleLoading = true;
        state.error = null;
      })
      .addCase(createSingleSchedule.fulfilled, (state, action) => {
        state.createScheduleLoading = false;
        // Ensure schedules is an array before pushing
        if (Array.isArray(state.schedules)) {
          state.schedules.push(action.payload.data);
        } else {
          state.schedules = [action.payload.data];
        }
      })
      .addCase(createSingleSchedule.rejected, (state, action) => {
        state.createScheduleLoading = false;
        state.error = action.payload as string;
      })
      // Create default schedules
      .addCase(createDefaultSchedules.pending, (state) => {
        state.createDefaultSchedulesLoading = true;
        state.error = null;
      })
      .addCase(createDefaultSchedules.fulfilled, (state, action) => {
        state.createDefaultSchedulesLoading = false;
        // Ensure schedules is an array before spreading
        const existingSchedules = Array.isArray(state.schedules)
          ? state.schedules
          : [];
        const newSchedules = Array.isArray(action.payload.data)
          ? action.payload.data
          : [];
        state.schedules = [...existingSchedules, ...newSchedules];
      })
      .addCase(createDefaultSchedules.rejected, (state, action) => {
        state.createDefaultSchedulesLoading = false;
        state.error = action.payload as string;
      })
      // Fetch technician schedules
      .addCase(fetchTechnicianSchedules.pending, (state) => {
        state.fetchSchedulesLoading = true;
        state.error = null;
      })
      .addCase(fetchTechnicianSchedules.fulfilled, (state, action) => {
        state.fetchSchedulesLoading = false;
        // Ensure data.schedules is an array
        const schedules = Array.isArray(action.payload.data.schedules)
          ? action.payload.data.schedules
          : [];
        state.schedules = schedules;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchTechnicianSchedules.rejected, (state, action) => {
        state.fetchSchedulesLoading = false;
        state.error = action.payload as string;
      })
      // Fetch technician schedules by center
      .addCase(fetchTechnicianSchedulesByCenter.pending, (state) => {
        state.fetchSchedulesByCenterLoading = true;
        state.error = null;
      })
      .addCase(fetchTechnicianSchedulesByCenter.fulfilled, (state, action) => {
        state.fetchSchedulesByCenterLoading = false;
        // API returns array directly in data field
        state.schedules = Array.isArray(action.payload.data)
          ? action.payload.data
          : [];
        state.pagination = null; // No pagination for this endpoint
      })
      .addCase(fetchTechnicianSchedulesByCenter.rejected, (state, action) => {
        state.fetchSchedulesByCenterLoading = false;
        state.error = action.payload as string;
      })
      // Fetch technician staff
      .addCase(fetchTechnicianStaff.pending, (state) => {
        state.fetchStaffLoading = true;
        state.error = null;
      })
      .addCase(fetchTechnicianStaff.fulfilled, (state, action) => {
        state.fetchStaffLoading = false;
        state.technicianStaff = action.payload.data;
      })
      .addCase(fetchTechnicianStaff.rejected, (state, action) => {
        state.fetchStaffLoading = false;
        state.error = action.payload as string;
      })
      // Fetch available technicians
      .addCase(fetchAvailableTechnicians.pending, (state) => {
        state.fetchAvailableTechniciansLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailableTechnicians.fulfilled, (state, action) => {
        state.fetchAvailableTechniciansLoading = false;
        state.availableTechnicians = action.payload.data;
      })
      .addCase(fetchAvailableTechnicians.rejected, (state, action) => {
        state.fetchAvailableTechniciansLoading = false;
        state.error = action.payload as string;
      })
      // Update schedule
      .addCase(updateSchedule.pending, (state) => {
        state.updateScheduleLoading = true;
        state.error = null;
      })
      .addCase(updateSchedule.fulfilled, (state, action) => {
        state.updateScheduleLoading = false;
        const updatedSchedule = action.payload.data;
        // Ensure schedules is an array before finding index
        if (Array.isArray(state.schedules)) {
          const index = state.schedules.findIndex(
            (schedule) => schedule._id === updatedSchedule._id
          );
          if (index !== -1) {
            state.schedules[index] = updatedSchedule;
          }
        }
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.updateScheduleLoading = false;
        state.error = action.payload as string;
      })
      // Delete schedule
      .addCase(deleteSchedule.pending, (state) => {
        state.deleteScheduleLoading = true;
        state.error = null;
      })
      .addCase(deleteSchedule.fulfilled, (state) => {
        state.deleteScheduleLoading = false;
        // The schedule ID is passed in the action meta
      })
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.deleteScheduleLoading = false;
        state.error = action.payload as string;
      })
      // Add appointment to schedule
      .addCase(addAppointmentToSchedule.fulfilled, (state, action) => {
        const updated = action.payload.data;
        if (Array.isArray(state.schedules)) {
          const idx = state.schedules.findIndex((s) => s._id === updated._id);
          if (idx !== -1) state.schedules[idx] = updated;
        }
      })
      .addCase(addAppointmentToSchedule.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearSchedules,
  clearStaff,
  clearAvailableTechnicians,
} = technicianSlice.actions;
export default technicianSlice.reducer;
