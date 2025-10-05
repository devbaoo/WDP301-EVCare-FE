import type { VehicleModel } from "./vehicle";

export interface BaseResponse {
  success: boolean;
  message: string;
}

export interface SupplierInfo {
  name: string;
  contact: string;
  leadTimeDays: number;
}

export interface CompatibleModel {
  _id: string;
  brand: string;
  model: string;
  year: number;
}

export interface Part {
  _id: string;
  partNumber: string;
  partName: string;
  category: string;
  description?: string;
  compatibleModels: Array<string | CompatibleModel>;
  unitPrice: number;
  supplierInfo?: SupplierInfo;
  isCritical: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartPayload {
  partNumber: string;
  partName: string;
  category: string;
  description?: string;
  compatibleModels?: string[];
  unitPrice: number;
  supplierInfo?: SupplierInfo;
  isCritical: boolean;
}

export interface PartFilterParams {
  partNumber?: string;
  partName?: string;
  category?: string;
  isCritical?: boolean;
  compatibleModel?: string;
}

export interface PartsListResponse extends BaseResponse {
  data: Part[];
}

export interface PartResponse extends BaseResponse {
  data: Part;
}

export interface PartsState {
  parts: Part[];
  selectedPart: Part | null;
  compatibleParts: Part[];
  vehicleModels: VehicleModel[];
  loading: boolean;
  fetchPartLoading: boolean;
  fetchCompatibleLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  fetchVehicleModelsLoading: boolean;
  error: string | null;
}

export interface InventoryCenterRef {
  _id: string;
  name: string;
  location?: string;
}

export interface InventoryPartRef {
  _id: string;
  partNumber: string;
  partName: string;
  category?: string;
  isCritical?: boolean;
}

export interface InventoryItem {
  _id: string;
  centerId: string | InventoryCenterRef;
  partId: string | InventoryPartRef;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  lastRestockDate?: string;
  costPerUnit?: number;
  location?: string;
  status: string;
  updatedAt: string;
  createdAt?: string;
}

export interface InventoryPayload {
  centerId: string;
  partId: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  costPerUnit?: number;
  location?: string;
}

export interface InventoryFilterParams {
  centerId?: string;
  partId?: string;
  status?: string;
  lowStock?: boolean | string;
}

export interface InventoryListResponse extends BaseResponse {
  data: InventoryItem[];
}

export interface InventoryResponse extends BaseResponse {
  data: InventoryItem;
}

export interface InventoryStats {
  totalItems: number;
  totalStock: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
}

export interface InventoryStatsResponse extends BaseResponse {
  data: InventoryStats;
}

export interface InventoryState {
  items: InventoryItem[];
  lowStockItems: InventoryItem[];
  transactions: InventoryTransaction[];
  statsByCenter: Record<string, InventoryStats>;
  selectedItem: InventoryItem | null;
  loading: boolean;
  fetchItemLoading: boolean;
  fetchLowStockLoading: boolean;
  statsLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  transactionLoading: boolean;
  fetchTransactionsLoading: boolean;
  error: string | null;
}

export interface TransactionUserRef {
  _id: string;
  username: string;
  fullName?: string;
}

export interface InventoryTransaction {
  _id: string;
  inventoryId: string | InventoryItem;
  transactionType: string;
  quantity: number;
  unitCost?: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  performedBy?: string | TransactionUserRef;
  transactionDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryTransactionPayload {
  inventoryId: string;
  transactionType: string;
  quantity: number;
  unitCost?: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
}

export interface InventoryTransactionsResponse extends BaseResponse {
  data: InventoryTransaction[];
}

export interface AiPredictionInputData {
  transactionCount?: number;
  historicalPeriod?: string;
  currentStock?: number;
  forecastId?: string;
  leadTimeDays?: number;
  dailyUsage?: number;
  recommendedMinStock?: number;
  recommendedReorderPoint?: number;
  recommendedMaxStock?: number;
  currentMinStock?: number;
  currentReorderPoint?: number;
  currentMaxStock?: number;
}

export interface AiPrediction {
  _id: string;
  centerId?: string | InventoryCenterRef;
  partId?: string | InventoryPartRef;
  predictionType: string;
  predictedValue?: number;
  confidenceScore?: number;
  predictionPeriod?: string;
  modelVersion?: string;
  inputData?: AiPredictionInputData;
  createdAt: string;
  updatedAt?: string;
}

export interface AiPredictionsResponse extends BaseResponse {
  data: AiPrediction[];
}

export interface AiPredictionResponse extends BaseResponse {
  data: AiPrediction;
}

export interface DemandForecastPayload {
  centerId: string;
  predictionPeriod: string;
}

export interface StockOptimizationPayload {
  centerId: string;
}

export interface ApplyRecommendationsPayload {
  centerId: string;
  predictionIds?: string[];
}

export interface ApplyRecommendationsResponse extends BaseResponse {
  data: InventoryItem[];
}

export interface AiState {
  predictions: AiPrediction[];
  selectedPrediction: AiPrediction | null;
  latestDemandForecast: AiPrediction[];
  latestStockOptimization: AiPrediction[];
  applyResults: InventoryItem[];
  loading: boolean;
  fetchPredictionLoading: boolean;
  demandForecastLoading: boolean;
  stockOptimizationLoading: boolean;
  applyRecommendationsLoading: boolean;
  error: string | null;
}
