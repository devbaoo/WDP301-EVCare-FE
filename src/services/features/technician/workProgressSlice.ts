import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../constant/axiosInstance";
import {
  TECHNICIAN_PROGRESS_CREATE_ENDPOINT,
  WORK_PROGRESS_LIST_ENDPOINT,
  WORK_PROGRESS_DETAIL_ENDPOINT,
  WORK_PROGRESS_PROCESS_PAYMENT_ENDPOINT,
  WORK_PROGRESS_PROCESS_ONLINE_PAYMENT_ENDPOINT,
  APPOINTMENT_PROGRESS_ENDPOINT,
  TECHNICIAN_PROGRESS_START_MAINTENANCE_ENDPOINT,
  TECHNICIAN_PROGRESS_COMPLETE_MAINTENANCE_ENDPOINT,
} from "../../constant/apiConfig";
import {
  WorkProgress,
  CreateWorkProgressPayload,
  CreateWorkProgressResponse,
  WorkProgressResponse,
  CompleteMaintenancePayload,
  WorkProgressQueryParams,
  WorkProgressListResponse,
  ProcessPaymentPayload,
  ProcessPaymentResponse,
  ProcessOnlinePaymentPayload,
  ProcessOnlinePaymentResponse,
  WorkProgressDetailResponse,
} from "@/interfaces/workProgress";

interface WorkProgressState {
  byAppointment: Record<string, WorkProgress | undefined>;
  workProgressList: WorkProgress[];
  selectedWorkProgress: WorkProgress | null;
  listLoading: boolean;
  detailLoading: boolean;
  processPaymentLoading: boolean;
  processOnlinePaymentLoading: boolean;
  onlinePaymentLink: ProcessOnlinePaymentResponse["data"] | null;
  loading: boolean;
  error: string | null;
}

const initialState: WorkProgressState = {
  byAppointment: {},
  workProgressList: [],
  selectedWorkProgress: null,
  listLoading: false,
  detailLoading: false,
  processPaymentLoading: false,
  processOnlinePaymentLoading: false,
  onlinePaymentLink: null,
  loading: false,
  error: null,
};

// Fetch work progress list with filters
export const fetchWorkProgressList = createAsyncThunk(
  "workProgress/fetchList",
  async (params: WorkProgressQueryParams = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.currentStatus) {
        queryParams.append("currentStatus", params.currentStatus);
      }

      if (params.serviceDate) {
        queryParams.append("serviceDate", params.serviceDate);
      }

      const url = queryParams.toString()
        ? `${WORK_PROGRESS_LIST_ENDPOINT}?${queryParams.toString()}`
        : WORK_PROGRESS_LIST_ENDPOINT;

      const res = await axiosInstance.get(url);
      return res.data as WorkProgressListResponse;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch work progress list"
      );
    }
  }
);

// Fetch work progress detail by ID
export const fetchWorkProgressDetail = createAsyncThunk(
  "workProgress/fetchDetail",
  async (workProgressId: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        WORK_PROGRESS_DETAIL_ENDPOINT(workProgressId)
      );
      return res.data as WorkProgressDetailResponse;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch work progress detail"
      );
    }
  }
);

// Process payment for work progress
export const processPayment = createAsyncThunk(
  "workProgress/processPayment",
  async (
    params: { workProgressId: string; payload: ProcessPaymentPayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.post(
        WORK_PROGRESS_PROCESS_PAYMENT_ENDPOINT(params.workProgressId),
        params.payload
      );
      return res.data as ProcessPaymentResponse;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to process payment"
      );
    }
  }
);

// Process online payment for work progress (PayOS)
export const processOnlinePayment = createAsyncThunk(
  "workProgress/processOnlinePayment",
  async (
    params: { workProgressId: string; payload: ProcessOnlinePaymentPayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.post(
        WORK_PROGRESS_PROCESS_ONLINE_PAYMENT_ENDPOINT(params.workProgressId),
        params.payload
      );
      return res.data as ProcessOnlinePaymentResponse;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      return rejectWithValue(
        error.response?.data?.message || "Failed to process online payment"
      );
    }
  }
);

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

// Removed: submitInspectionQuote (moved to appointment-level in booking slice)

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

export const workProgressSlice = createSlice({
  name: "workProgress",
  initialState,
  reducers: {
    clearOnlinePaymentLink: (state) => {
      state.onlinePaymentLink = null;
      state.processOnlinePaymentLoading = false;
      state.error = null;
    },
    updatePaymentStatus: (
      state,
      action: {
        payload: {
          workProgressId: string;
          paymentMethod: string;
          paymentStatus: string;
          paidAmount?: number;
        };
      }
    ) => {
      const { workProgressId, paymentMethod, paymentStatus, paidAmount } =
        action.payload;
      // Update in list
      const idx = state.workProgressList.findIndex(
        (wp) => wp._id === workProgressId
      );
      if (idx !== -1) {
        const existing = state.workProgressList[idx];
        state.workProgressList[idx] = {
          ...existing,
          paymentDetails: {
            paymentMethod,
            paymentStatus,
            paidAmount: paidAmount ?? existing.paymentDetails?.paidAmount ?? 0,
          },
        };
      }
      // Update in byAppointment map
      Object.keys(state.byAppointment).forEach((apptId) => {
        const wp = state.byAppointment[apptId];
        if (wp && wp._id === workProgressId) {
          state.byAppointment[apptId] = {
            ...wp,
            paymentDetails: {
              paymentMethod,
              paymentStatus,
              paidAmount: paidAmount ?? wp.paymentDetails?.paidAmount ?? 0,
            },
          };
        }
      });
      // If selectedWorkProgress matches
      if (
        state.selectedWorkProgress &&
        state.selectedWorkProgress._id === workProgressId
      ) {
        state.selectedWorkProgress = {
          ...state.selectedWorkProgress,
          paymentDetails: {
            paymentMethod,
            paymentStatus,
            paidAmount:
              paidAmount ??
              state.selectedWorkProgress.paymentDetails?.paidAmount ??
              0,
          },
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkProgressList.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkProgressList.fulfilled, (state, action) => {
        state.listLoading = false;
        if (action.payload.success) {
          state.workProgressList = action.payload.data;
        }
      })
      .addCase(fetchWorkProgressList.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchWorkProgressDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkProgressDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        if (action.payload.success) {
          state.selectedWorkProgress = action.payload.data;
        }
      })
      .addCase(fetchWorkProgressDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      })
      .addCase(processPayment.pending, (state) => {
        state.processPaymentLoading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.processPaymentLoading = false;
        if (action.payload.success) {
          const updatedWorkProgress = action.payload.data;
          // Update in workProgressList
          const index = state.workProgressList.findIndex(
            (wp) => wp._id === updatedWorkProgress._id
          );
          if (index !== -1) {
            state.workProgressList[index] = updatedWorkProgress;
          }
          // Update in byAppointment
          const apptId =
            typeof updatedWorkProgress.appointmentId === "string"
              ? updatedWorkProgress.appointmentId
              : updatedWorkProgress.appointmentId?._id;
          if (apptId) {
            state.byAppointment[apptId] = updatedWorkProgress;
          }
        }
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.processPaymentLoading = false;
        state.error = action.payload as string;
      })
      // Process online payment
      .addCase(processOnlinePayment.pending, (state) => {
        state.processOnlinePaymentLoading = true;
        state.onlinePaymentLink = null;
        state.error = null;
      })
      .addCase(processOnlinePayment.fulfilled, (state, action) => {
        state.processOnlinePaymentLoading = false;
        if (action.payload.success) {
          state.onlinePaymentLink = action.payload.data;
        }
      })
      .addCase(processOnlinePayment.rejected, (state, action) => {
        state.processOnlinePaymentLoading = false;
        state.onlinePaymentLink = null;
        state.error = action.payload as string;
      })
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
      // submitInspectionQuote removed
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

export const { clearOnlinePaymentLink, updatePaymentStatus } =
  workProgressSlice.actions;
export default workProgressSlice.reducer;
