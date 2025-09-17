import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { message } from "antd";
import axiosInstance from "../../constant/axiosInstance";
import { SERVICE_TYPE_CREATE_ENDPOINT, SERVICE_TYPE_DELETE_ENDPOINT, SERVICE_TYPE_ENDPOINT, SERVICE_TYPE_UPDATE_ENDPOINT } from "../../constant/apiConfig";
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

// Create service type
export const createServiceType = createAsyncThunk<
  ServiceType,
  Partial<ServiceType>,
  { rejectValue: { message: string } }
>("adminService/createServiceType", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(SERVICE_TYPE_CREATE_ENDPOINT, payload);
    const created: ServiceType = response.data?.data || response.data;
    message.success("Tạo dịch vụ thành công");
    return created;
  } catch (err: unknown) {
    const anyErr = err as any;
    const msg = anyErr?.response?.data?.message || anyErr?.message || "Tạo dịch vụ thất bại";
    message.error(msg);
    return rejectWithValue({ message: msg });
  }
});

// Update service type
export const updateServiceType = createAsyncThunk<
  ServiceType,
  { id: string; data: Partial<ServiceType> },
  { rejectValue: { message: string } }
>("adminService/updateServiceType", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(SERVICE_TYPE_UPDATE_ENDPOINT(id), data);
    const updated: ServiceType = response.data?.data || response.data;
    message.success("Cập nhật dịch vụ thành công");
    return updated;
  } catch (err: unknown) {
    const anyErr = err as any;
    const msg = anyErr?.response?.data?.message || anyErr?.message || "Cập nhật dịch vụ thất bại";
    message.error(msg);
    return rejectWithValue({ message: msg });
  }
});

// Delete service type
export const deleteServiceType = createAsyncThunk<
  { id: string },
  string,
  { rejectValue: { message: string } }
>("adminService/deleteServiceType", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(SERVICE_TYPE_DELETE_ENDPOINT(id));
    message.success("Xóa dịch vụ thành công");
    return { id };
  } catch (err: unknown) {
    const anyErr = err as any;
    const msg = anyErr?.response?.data?.message || anyErr?.message || "Xóa dịch vụ thất bại";
    message.error(msg);
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
      })
      // Create
      .addCase(createServiceType.pending, (state) => {
        state.loading = true;
      })
      .addCase(createServiceType.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.items = [action.payload, ...state.items];
        }
      })
      .addCase(createServiceType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Tạo dịch vụ thất bại";
      })
      // Update
      .addCase(updateServiceType.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateServiceType.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.items.findIndex((it) => it._id === updated._id);
        if (index !== -1) {
          state.items[index] = updated;
        }
      })
      .addCase(updateServiceType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Cập nhật dịch vụ thất bại";
      })
      // Delete
      .addCase(deleteServiceType.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteServiceType.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((it) => it._id !== action.payload.id);
      })
      .addCase(deleteServiceType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Xóa dịch vụ thất bại";
      });
  },
});

export const { setPage, setLimit, setSearch, clearError } = adminServiceSlice.actions;
export default adminServiceSlice.reducer;

