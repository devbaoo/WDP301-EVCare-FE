import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../constant/axiosInstance";
import {
  INVENTORY_DETAIL_ENDPOINT,
  INVENTORY_ENDPOINT,
  INVENTORY_LOW_STOCK_ALERTS_ENDPOINT,
  INVENTORY_STATS_ENDPOINT,
  INVENTORY_TRANSACTIONS_ENDPOINT,
} from "../../constant/apiConfig";
import {
  BaseResponse,
  InventoryFilterParams,
  InventoryItem,
  InventoryListResponse,
  InventoryPayload,
  InventoryResponse,
  InventoryState,
  InventoryStatsResponse,
  InventoryTransaction,
  InventoryTransactionPayload,
  InventoryTransactionsResponse,
} from "../../../interfaces/parts";

const initialState: InventoryState = {
  items: [],
  lowStockItems: [],
  transactions: [],
  statsByCenter: {},
  selectedItem: null,
  loading: false,
  fetchItemLoading: false,
  fetchLowStockLoading: false,
  statsLoading: false,
  createLoading: false,
  updateLoading: false,
  transactionLoading: false,
  fetchTransactionsLoading: false,
  error: null,
};

const normalizeInventoryFilters = (params?: InventoryFilterParams) => {
  if (!params) {
    return params;
  }

  const { lowStock, ...rest } = params;
  if (typeof lowStock === "boolean") {
    return { ...rest, lowStock: lowStock ? "true" : "false" };
  }
  return { ...rest, lowStock };
};

export const fetchInventoryItems = createAsyncThunk(
  "inventory/fetchInventoryItems",
  async (params: InventoryFilterParams | undefined, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(INVENTORY_ENDPOINT, {
        params: normalizeInventoryFilters(params),
      });
      return response.data as InventoryListResponse;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch inventory items"
      );
    }
  }
);

export const fetchInventoryById = createAsyncThunk(
  "inventory/fetchInventoryById",
  async (inventoryId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(INVENTORY_DETAIL_ENDPOINT(inventoryId));
      return response.data as InventoryResponse;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch inventory detail"
      );
    }
  }
);

export const fetchLowStockInventory = createAsyncThunk(
  "inventory/fetchLowStockInventory",
  async (centerId: string | undefined, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(INVENTORY_LOW_STOCK_ALERTS_ENDPOINT, {
        params: centerId ? { centerId } : undefined,
      });
      return response.data as InventoryListResponse;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch low stock alerts"
      );
    }
  }
);

export const fetchInventoryStats = createAsyncThunk(
  "inventory/fetchInventoryStats",
  async (centerId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(INVENTORY_STATS_ENDPOINT(centerId));
      return { ...(response.data as InventoryStatsResponse), centerId };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch inventory stats"
      );
    }
  }
);

export const createInventoryItem = createAsyncThunk(
  "inventory/createInventoryItem",
  async (payload: InventoryPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(INVENTORY_ENDPOINT, payload);
      return response.data as InventoryResponse;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to create inventory item"
      );
    }
  }
);

export const updateInventoryItem = createAsyncThunk(
  "inventory/updateInventoryItem",
  async (
    { inventoryId, payload }: { inventoryId: string; payload: Partial<InventoryPayload> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(
        INVENTORY_DETAIL_ENDPOINT(inventoryId),
        payload
      );
      return response.data as InventoryResponse;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to update inventory item"
      );
    }
  }
);

export const createInventoryTransaction = createAsyncThunk(
  "inventory/createInventoryTransaction",
  async (payload: InventoryTransactionPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(INVENTORY_TRANSACTIONS_ENDPOINT, payload);
      return response.data as InventoryResponse | (BaseResponse & { data?: InventoryTransaction });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to create inventory transaction"
      );
    }
  }
);

export const fetchInventoryTransactions = createAsyncThunk(
  "inventory/fetchInventoryTransactions",
  async (
    params: (Partial<InventoryTransactionPayload> & {
      startDate?: string;
      endDate?: string;
      performedBy?: string;
    }) | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(INVENTORY_TRANSACTIONS_ENDPOINT, {
        params,
      });
      return response.data as InventoryTransactionsResponse;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch inventory transactions"
      );
    }
  }
);

const extractTransaction = (payload: unknown): InventoryTransaction | undefined => {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }
  const data = (payload as { data?: InventoryTransaction }).data;
  if (!data) {
    return undefined;
  }
  return data;
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    resetInventoryError: (state) => {
      state.error = null;
    },
    clearSelectedInventoryItem: (state) => {
      state.selectedItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
      })
      .addCase(fetchInventoryItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchInventoryById.pending, (state) => {
        state.fetchItemLoading = true;
        state.error = null;
      })
      .addCase(fetchInventoryById.fulfilled, (state, action) => {
        state.fetchItemLoading = false;
        state.selectedItem = action.payload.data;
      })
      .addCase(fetchInventoryById.rejected, (state, action) => {
        state.fetchItemLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchLowStockInventory.pending, (state) => {
        state.fetchLowStockLoading = true;
        state.error = null;
      })
      .addCase(fetchLowStockInventory.fulfilled, (state, action) => {
        state.fetchLowStockLoading = false;
        state.lowStockItems = action.payload.data;
      })
      .addCase(fetchLowStockInventory.rejected, (state, action) => {
        state.fetchLowStockLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchInventoryStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchInventoryStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.statsByCenter[action.payload.centerId] = action.payload.data;
      })
      .addCase(fetchInventoryStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createInventoryItem.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.createLoading = false;
        const item = action.payload.data;
        state.items = [item, ...state.items.filter((existing) => existing._id !== item._id)];
      })
      .addCase(createInventoryItem.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateInventoryItem.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedItem = action.payload.data;
        state.items = state.items.map((item) =>
          item._id === updatedItem._id ? (updatedItem as InventoryItem) : item
        );
        if (state.selectedItem && state.selectedItem._id === updatedItem._id) {
          state.selectedItem = updatedItem as InventoryItem;
        }
        state.lowStockItems = state.lowStockItems.map((item) =>
          item._id === updatedItem._id ? (updatedItem as InventoryItem) : item
        );
      })
      .addCase(updateInventoryItem.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createInventoryTransaction.pending, (state) => {
        state.transactionLoading = true;
        state.error = null;
      })
      .addCase(createInventoryTransaction.fulfilled, (state, action) => {
        state.transactionLoading = false;
        const transaction = extractTransaction(action.payload);
        if (transaction) {
          state.transactions = [
            transaction,
            ...state.transactions.filter((existing) => existing._id !== transaction._id),
          ];
        }
      })
      .addCase(createInventoryTransaction.rejected, (state, action) => {
        state.transactionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchInventoryTransactions.pending, (state) => {
        state.fetchTransactionsLoading = true;
        state.error = null;
      })
      .addCase(fetchInventoryTransactions.fulfilled, (state, action) => {
        state.fetchTransactionsLoading = false;
        state.transactions = action.payload.data;
      })
      .addCase(fetchInventoryTransactions.rejected, (state, action) => {
        state.fetchTransactionsLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetInventoryError, clearSelectedInventoryItem } = inventorySlice.actions;

export default inventorySlice.reducer;
