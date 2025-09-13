import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { message } from "antd";
import axiosInstance from "../../constant/axiosInstance";
import {
  SERVICE_CENTERS_ENDPOINT,
  SERVICE_CENTER_DETAIL_ENDPOINT,
  SERVICE_CENTER_NEARBY_ENDPOINT,
} from "../../constant/apiConfig";
import {
  ServiceCenterState,
  ServiceCentersResponse,
  ServiceCenter,
} from "../../../interfaces/serviceCenter";

// Initial state
const initialState: ServiceCenterState = {
  serviceCenters: [],
  pagination: null,
  loading: false,
  error: null,
  selectedServiceCenter: null,
};

// Async thunks
export const fetchServiceCenters = createAsyncThunk<
  ServiceCentersResponse,
  { page?: number; limit?: number; search?: string },
  { rejectValue: { message: string } }
>("serviceCenter/fetchServiceCenters", async (params = {}, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);

    const url = queryParams.toString() 
      ? `${SERVICE_CENTERS_ENDPOINT}?${queryParams.toString()}`
      : SERVICE_CENTERS_ENDPOINT;

    const response = await axiosInstance.get(url);
    return response.data;
  } catch (err: unknown) {
    const error = err as any;
    const message = error.response?.data?.message || error.message || "Lấy danh sách trung tâm dịch vụ thất bại";
    return rejectWithValue({ message });
  }
});

export const fetchServiceCenterById = createAsyncThunk<
  ServiceCenter,
  string,
  { rejectValue: { message: string } }
>("serviceCenter/fetchServiceCenterById", async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(SERVICE_CENTER_DETAIL_ENDPOINT(id));
    return response.data.data;
  } catch (err: unknown) {
    const error = err as any;
    const message = error.response?.data?.message || error.message || "Lấy thông tin trung tâm dịch vụ thất bại";
    return rejectWithValue({ message });
  }
});

export const fetchNearbyServiceCenters = createAsyncThunk<
  ServiceCentersResponse,
  { lat: number; lng: number; radius?: number },
  { rejectValue: { message: string } }
>("serviceCenter/fetchNearbyServiceCenters", async (params, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("lat", params.lat.toString());
    queryParams.append("lng", params.lng.toString());
    if (params.radius) queryParams.append("radius", params.radius.toString());

    // Use fetch for nearby search to avoid CORS issues
    const response = await fetch(`${SERVICE_CENTER_NEARBY_ENDPOINT}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    
    // API nearby search returns array directly, not wrapped in data object
    const serviceCenters = Array.isArray(data) ? data : data.data || [];
    
    return {
      success: true,
      message: "Lấy danh sách trung tâm gần đây thành công",
      data: {
        serviceCenters: serviceCenters,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: serviceCenters.length,
          itemsPerPage: serviceCenters.length
        }
      }
    };
  } catch (err: unknown) {
    const error = err as any;
    const message = error.response?.data?.message || error.message || "Failed to fetch nearby service centers";
    return rejectWithValue({ message });
  }
});

// Service Center slice
const serviceCenterSlice = createSlice({
  name: "serviceCenter",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedServiceCenter: (state, action) => {
      state.selectedServiceCenter = action.payload;
    },
    clearSelectedServiceCenter: (state) => {
      state.selectedServiceCenter = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch service centers cases
    builder
      .addCase(fetchServiceCenters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceCenters.fulfilled, (state, action) => {
        state.loading = false;
        state.serviceCenters = action.payload.data.serviceCenters;
        state.pagination = action.payload.data.pagination;
        state.error = null;
        // Không hiển thị toast success cho fetch danh sách
      })
      .addCase(fetchServiceCenters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Lấy danh sách trung tâm dịch vụ thất bại";
        message.error(state.error);
      })
      // Fetch service center by ID cases
      .addCase(fetchServiceCenterById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceCenterById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedServiceCenter = action.payload;
        state.error = null;
      })
      .addCase(fetchServiceCenterById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Lấy thông tin trung tâm dịch vụ thất bại";
        message.error(state.error);
      })
      // Fetch nearby service centers cases
      .addCase(fetchNearbyServiceCenters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNearbyServiceCenters.fulfilled, (state, action) => {
        state.loading = false;
        state.serviceCenters = action.payload.data.serviceCenters;
        state.pagination = action.payload.data.pagination;
        state.error = null;
        // Không hiển thị toast success cho fetch nearby
      })
      .addCase(fetchNearbyServiceCenters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Lấy danh sách trung tâm gần đây thất bại";
        message.error(state.error);
      });
  },
});

export const { clearError, setSelectedServiceCenter, clearSelectedServiceCenter } = serviceCenterSlice.actions;
export default serviceCenterSlice.reducer;
