import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { message } from "antd";
import axiosInstance from "../../constant/axiosInstance";
import { SERVICE_TYPE_ENDPOINT } from "../../constant/apiConfig";
import {
  ServiceType,
  PaginationInfo,
  ServiceTypesResponse,
} from "../../../interfaces/service";

interface AdminServiceState {
  items: ServiceType[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  search: string;
}

const initialState: AdminServiceState = {
  items: [],
  pagination: null,
  loading: false,
  error: null,
  page: 1,
  limit: 10,
  search: "",
};

export const fetchServiceTypes = createAsyncThunk<
  ServiceTypesResponse,
  { page?: number; limit?: number; search?: string },
  { rejectValue: { message: string } }
>("adminService/fetchServiceTypes", async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.search) query.append("search", params.search);

    const url = query.toString()
      ? `${SERVICE_TYPE_ENDPOINT}?${query.toString()}`
      : SERVICE_TYPE_ENDPOINT;

    const response = await axiosInstance.get(url);
    return response.data as ServiceTypesResponse;
  } catch (err: unknown) {
    const anyErr = err as any;
    const msg = anyErr?.response?.data?.message || anyErr?.message || "Lấy danh sách dịch vụ thất bại";
    return rejectWithValue({ message: msg });
  }
});

const adminServiceSlice = createSlice({
  name: "adminService",
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 1;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data.serviceTypes;
        state.pagination = action.payload.data.pagination;
        state.error = null;
      })
      .addCase(fetchServiceTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Lấy danh sách dịch vụ thất bại";
        message.error(state.error);
      });
  },
});

export const { setPage, setLimit, setSearch, clearError } = adminServiceSlice.actions;
export default adminServiceSlice.reducer;

