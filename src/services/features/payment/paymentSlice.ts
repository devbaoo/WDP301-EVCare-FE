import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../constant/axiosInstance';
import {
  PAYMENT_CREATE_ENDPOINT,
  PAYMENT_STATUS_ENDPOINT,
  PAYMENT_SYNC_ENDPOINT,
  PAYMENT_CANCEL_ENDPOINT,
  MY_PAYMENTS_ENDPOINT,
  PAYOS_PAYMENT_INFO_ENDPOINT,
  PAYOS_CANCEL_ENDPOINT
} from '../../constant/apiConfig';
import {
  Payment,
  CreatePaymentResponse,
  PaymentStatusResponse,
  PaymentSyncResponse,
  MyPaymentsResponse,
  PaymentCancelResponse,
  PayOSPaymentInfoResponse,
  PaymentQueryParams,
  PaymentState
} from '../../../interfaces/payment';

const initialState: PaymentState = {
  currentPayment: null,
  myPayments: [],
  pagination: null,
  loading: false,
  createPaymentLoading: false,
  error: null,
};

// Create payment for booking
export const createPayment = createAsyncThunk(
  'payment/createPayment',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<CreatePaymentResponse>(
        PAYMENT_CREATE_ENDPOINT(appointmentId)
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tạo thanh toán'
      );
    }
  }
);

// Get payment status (legacy - kept for backward compatibility)
export const getPaymentStatus = createAsyncThunk(
  'payment/getPaymentStatus',
  async (paymentId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<PaymentStatusResponse>(
        PAYMENT_STATUS_ENDPOINT(paymentId)
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể lấy trạng thái thanh toán'
      );
    }
  }
);

// Sync payment status using orderCode
export const syncPaymentStatus = createAsyncThunk(
  'payment/syncPaymentStatus',
  async (orderCode: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<PaymentSyncResponse>(
        PAYMENT_SYNC_ENDPOINT(orderCode)
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể đồng bộ trạng thái thanh toán'
      );
    }
  }
);

// Cancel payment
export const cancelPayment = createAsyncThunk(
  'payment/cancelPayment',
  async (paymentId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<PaymentCancelResponse>(
        PAYMENT_CANCEL_ENDPOINT(paymentId)
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể hủy thanh toán'
      );
    }
  }
);

// Get my payments
export const getMyPayments = createAsyncThunk(
  'payment/getMyPayments',
  async (params: PaymentQueryParams = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams();
      
      if (params.status) queryString.append('status', params.status);
      if (params.page) queryString.append('page', params.page.toString());
      if (params.limit) queryString.append('limit', params.limit.toString());
      if (params.sortBy) queryString.append('sortBy', params.sortBy);
      if (params.sortOrder) queryString.append('sortOrder', params.sortOrder);

      const url = queryString.toString() 
        ? `${MY_PAYMENTS_ENDPOINT}?${queryString.toString()}`
        : MY_PAYMENTS_ENDPOINT;

      const response = await axiosInstance.get<MyPaymentsResponse>(url);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể lấy danh sách thanh toán'
      );
    }
  }
);

// Get PayOS payment info
export const getPayOSPaymentInfo = createAsyncThunk(
  'payment/getPayOSPaymentInfo',
  async (orderCode: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<PayOSPaymentInfoResponse>(
        PAYOS_PAYMENT_INFO_ENDPOINT(orderCode)
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể lấy thông tin thanh toán từ PayOS'
      );
    }
  }
);

// Cancel PayOS payment
export const cancelPayOSPayment = createAsyncThunk(
  'payment/cancelPayOSPayment',
  async (orderCode: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<PaymentCancelResponse>(
        PAYOS_CANCEL_ENDPOINT(orderCode)
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể hủy thanh toán trên PayOS'
      );
    }
  }
);

// Poll payment status (for real-time updates) - legacy method
export const pollPaymentStatus = createAsyncThunk(
  'payment/pollPaymentStatus',
  async (paymentId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<PaymentStatusResponse>(
        PAYMENT_STATUS_ENDPOINT(paymentId)
      );
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể kiểm tra trạng thái thanh toán'
      );
    }
  }
);

// Poll payment status using orderCode (new method)
export const pollPaymentStatusByOrderCode = createAsyncThunk(
  'payment/pollPaymentStatusByOrderCode',
  async (orderCode: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<PaymentSyncResponse>(
        PAYMENT_SYNC_ENDPOINT(orderCode)
      );
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể kiểm tra trạng thái thanh toán'
      );
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
    setCurrentPayment: (state, action: PayloadAction<Payment>) => {
      state.currentPayment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Payment
      .addCase(createPayment.pending, (state) => {
        state.createPaymentLoading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, _action) => {
        state.createPaymentLoading = false;
        state.error = null;
        // Payment creation doesn't set currentPayment, it returns payment link
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.createPaymentLoading = false;
        state.error = action.payload as string;
      })

      // Get Payment Status
      .addCase(getPaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentPayment = action.payload.data;
      })
      .addCase(getPaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Cancel Payment
      .addCase(cancelPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelPayment.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        if (state.currentPayment) {
          state.currentPayment.status = 'cancelled';
        }
      })
      .addCase(cancelPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get My Payments
      .addCase(getMyPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.myPayments = action.payload.data.payments;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getMyPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // PayOS Payment Info
      .addCase(getPayOSPaymentInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPayOSPaymentInfo.fulfilled, (state, _action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getPayOSPaymentInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Cancel PayOS Payment
      .addCase(cancelPayOSPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelPayOSPayment.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        // Update current payment status to cancelled
        if (state.currentPayment) {
          state.currentPayment.status = 'cancelled';
        }
      })
      .addCase(cancelPayOSPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Poll Payment Status
      .addCase(pollPaymentStatus.pending, (state) => {
        // Don't set loading to true for polling to avoid UI flicker
        state.error = null;
      })
      .addCase(pollPaymentStatus.fulfilled, (state, action) => {
        state.error = null;
        state.currentPayment = action.payload.data;
      })
      .addCase(pollPaymentStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Sync Payment Status
      .addCase(syncPaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Update currentPayment with the new status from sync response
        if (state.currentPayment) {
          state.currentPayment.status = action.payload.data.newStatus as any;
        }
      })
      .addCase(syncPaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Poll Payment Status By Order Code
      .addCase(pollPaymentStatusByOrderCode.pending, (state) => {
        // Don't set loading to true for polling to avoid UI flicker
        state.error = null;
      })
      .addCase(pollPaymentStatusByOrderCode.fulfilled, (state, action) => {
        state.error = null;
        // Update currentPayment with the new status from sync response
        if (state.currentPayment) {
          state.currentPayment.status = action.payload.data.newStatus as any;
        }
      })
      .addCase(pollPaymentStatusByOrderCode.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentPayment, setCurrentPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
