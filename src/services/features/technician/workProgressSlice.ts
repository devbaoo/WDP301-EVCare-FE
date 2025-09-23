import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../constant/axiosInstance";
import {
  TECHNICIAN_PROGRESS_CREATE_ENDPOINT,
  APPOINTMENT_PROGRESS_ENDPOINT,
  TECHNICIAN_PROGRESS_INSPECTION_QUOTE_ENDPOINT,
  TECHNICIAN_PROGRESS_START_MAINTENANCE_ENDPOINT,
  TECHNICIAN_PROGRESS_COMPLETE_MAINTENANCE_ENDPOINT,
} from "../../constant/apiConfig";
import {
  WorkProgress,
  CreateWorkProgressPayload,
  CreateWorkProgressResponse,
  WorkProgressResponse,
  InspectionQuotePayload,
  CompleteMaintenancePayload,
} from "@/interfaces/workProgress";

interface WorkProgressState {
  byAppointment: Record<string, WorkProgress | undefined>;
  loading: boolean;
  error: string | null;
}

const initialState: WorkProgressState = {
  byAppointment: {},
  loading: false,
  error: null,
};

export const createWorkProgress = createAsyncThunk(
  "workProgress/create",
  async (payload: CreateWorkProgressPayload, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        TECHNICIAN_PROGRESS_CREATE_ENDPOINT,
        payload
      );
      return res.data as CreateWorkProgressResponse;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to create progress"
      );
    }
  }
);

export const getProgressByAppointment = createAsyncThunk(
  "workProgress/getByAppointment",
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        APPOINTMENT_PROGRESS_ENDPOINT(appointmentId)
      );
      return res.data as WorkProgressResponse;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch progress"
      );
    }
  }
);

export const submitInspectionQuote = createAsyncThunk(
  "workProgress/inspectionQuote",
  async (
    params: { progressId: string; payload: InspectionQuotePayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.post(
        TECHNICIAN_PROGRESS_INSPECTION_QUOTE_ENDPOINT(params.progressId),
        params.payload
      );
      return res.data as WorkProgressResponse;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit quote"
      );
    }
  }
);

export const startMaintenance = createAsyncThunk(
  "workProgress/startMaintenance",
  async (progressId: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        TECHNICIAN_PROGRESS_START_MAINTENANCE_ENDPOINT(progressId)
      );
      return res.data as WorkProgressResponse;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to start maintenance"
      );
    }
  }
);

export const completeMaintenance = createAsyncThunk(
  "workProgress/completeMaintenance",
  async (
    params: { progressId: string; payload: CompleteMaintenancePayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.post(
        TECHNICIAN_PROGRESS_COMPLETE_MAINTENANCE_ENDPOINT(params.progressId),
        params.payload
      );
      return res.data as WorkProgressResponse;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to complete maintenance"
      );
    }
  }
);

const workProgressSlice = createSlice({
  name: "workProgress",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createWorkProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWorkProgress.fulfilled, (state, action) => {
        state.loading = false;
        const wp = action.payload.data;
        const apptId =
          typeof wp.appointmentId === "string"
            ? wp.appointmentId
            : wp.appointmentId?._id;
        if (apptId) state.byAppointment[apptId] = wp;
      })
      .addCase(createWorkProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getProgressByAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProgressByAppointment.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          const wp = action.payload.data as WorkProgress;
          const apptId =
            typeof wp.appointmentId === "string"
              ? wp.appointmentId
              : wp.appointmentId?._id;
          if (apptId) state.byAppointment[apptId] = wp;
        }
      })
      .addCase(getProgressByAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(submitInspectionQuote.fulfilled, (state, action) => {
        if (action.payload.success) {
          const wp = action.payload.data as WorkProgress;
          const apptId =
            typeof wp.appointmentId === "string"
              ? wp.appointmentId
              : wp.appointmentId?._id;
          if (apptId) state.byAppointment[apptId] = wp;
        }
      })
      .addCase(startMaintenance.fulfilled, (state, action) => {
        if (action.payload.success) {
          const wp = action.payload.data as WorkProgress;
          const apptId =
            typeof wp.appointmentId === "string"
              ? wp.appointmentId
              : wp.appointmentId?._id;
          if (apptId) state.byAppointment[apptId] = wp;
        }
      })
      .addCase(completeMaintenance.fulfilled, (state, action) => {
        if (action.payload.success) {
          const wp = action.payload.data as WorkProgress;
          const apptId =
            typeof wp.appointmentId === "string"
              ? wp.appointmentId
              : wp.appointmentId?._id;
          if (apptId) state.byAppointment[apptId] = wp;
        }
      });
  },
});

export default workProgressSlice.reducer;
