export interface ModelDistribution {
  modelId: string;
  count: number;
  averageAge: number;
  _id: string;
}

export interface VehiclePopulation {
  totalVehicles: number;
  modelDistribution: ModelDistribution[];
}

export interface ServicePatterns {
  averageServiceInterval: number;
  peakServiceMonths: string[];
}

export interface SeasonalFactors {
  [month: string]: number;
}

export interface AnalysisData {
  historicalUsage: any[];
  seasonalFactors: SeasonalFactors;
  vehiclePopulation: VehiclePopulation;
  servicePatterns: ServicePatterns;
}

export interface PredictedDemand {
  next30Days: number;
  next60Days: number;
  next90Days: number;
}

export interface InventoryRecommendation {
  partId: string;
  partName: string;
  currentStock: number;
  recommendedMinStock: number;
  recommendedMaxStock: number;
  predictedDemand: PredictedDemand;
  riskLevel: "low" | "medium" | "high" | "critical";
  reasoning: string;
  confidence: number;
  _id: string;
}

export interface CostOptimization {
  totalInventoryValue: number;
  potentialSavings: number;
  overStockedItems: string[];
  underStockedItems: string[];
}

export interface Predictions {
  inventoryRecommendations: InventoryRecommendation[];
  costOptimization: CostOptimization;
}

export interface ServiceCenter {
  _id: string;
  name: string;
  description: string;
  address: {
    coordinates: {
      lat: number;
      lng: number;
    };
    street: string;
    ward: string;
    district: string;
    city: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  operatingHours: {
    [day: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  capacity: {
    maxConcurrentServices: number;
    maxDailyAppointments: number;
  };
  rating: {
    average: number;
    count: number;
  };
  aiSettings: {
    enableInventoryPrediction: boolean;
    enableMaintenancePrediction: boolean;
    enableDemandForecasting: boolean;
  };
  services: string[];
  staff: any[];
  status: string;
  images: Array<{
    url: string;
    caption: string;
    isPrimary: boolean;
    _id: string;
  }>;
  paymentMethods: Array<{
    type: string;
    isEnabled: boolean;
    _id: string;
  }>;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AIPrediction {
  _id: string;
  centerId: string | ServiceCenter;
  predictionType:
    | "inventory_optimization"
    | "demand_forecast"
    | "stock_optimization";
  analysisData: AnalysisData;
  predictions: Predictions;
  aiModelUsed: string;
  validUntil: string;
  status: "active" | "expired" | "inactive";
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  // Additional fields for other prediction types
  partId?: string;
  predictedValue?: number;
  confidenceScore?: number;
  predictionPeriod?: string;
  modelVersion?: string;
  inputData?: any;
}

export interface AIPredictionStats {
  totalParts: number;
  criticalRiskParts: number;
  highRiskParts: number;
  mediumRiskParts: number;
  lowRiskParts: number;
  overStockedItems: number;
  underStockedItems: number;
  potentialSavings: number;
  averageConfidence: number;
  lastUpdated: string;
  validUntil: string;
}

export interface AIPredictionResponse {
  success: boolean;
  data: AIPrediction;
  message: string;
}

export interface AIPredictionHistoryResponse {
  success: boolean;
  data: AIPrediction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  message: string;
}

export interface AIPredictionStatsResponse {
  success: boolean;
  data: AIPredictionStats;
  message: string;
}

export interface AIPredictionState {
  latestPrediction: AIPrediction | null;
  predictionHistory: AIPrediction[];
  stats: AIPredictionStats | null;
  loading: boolean;
  generateLoading: boolean;
  regenerateLoading: boolean;
  historyLoading: boolean;
  statsLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  } | null;
}
