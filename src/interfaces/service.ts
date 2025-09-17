export interface ServiceStep {
  stepNumber: number;
  title: string;
  description: string;
  estimatedTime?: number;
  requiredTools?: string[];
  safetyNotes?: string[];
  _id?: string;
}

export interface ServiceProcedure {
  steps: ServiceStep[];
  totalSteps: number;
}

export interface ServiceDetails {
  duration: number; // minutes
  complexity: "easy" | "medium" | "hard";
  requiredSkills?: string[];
  tools?: string[];
}

export interface ServicePricing {
  basePrice: number;
  priceType: "fixed" | "range" | "hourly";
  currency: string; // e.g. VND
  isNegotiable?: boolean;
}

export interface ServiceRequirement {
  partName: string;
  partType: string;
  quantity: number;
  isOptional: boolean;
  estimatedCost?: number;
  _id?: string;
}

export interface CompatibleVehicle {
  brand: string;
  model: string;
  year: string | number;
  batteryType?: string;
  _id?: string;
}

export interface ServiceImage {
  url: string;
  caption?: string;
  isPrimary?: boolean;
  _id?: string;
}

export interface ServiceType {
  _id: string;
  name: string;
  description: string;
  category: string;
  serviceDetails: ServiceDetails;
  pricing: ServicePricing;
  procedure: ServiceProcedure;
  requirements?: {
    minBatteryLevel?: number;
    maxMileage?: number;
    specialConditions?: string[];
    safetyRequirements?: string[];
  };
  requiredParts?: ServiceRequirement[];
  compatibleVehicles: CompatibleVehicle[];
  status: "active" | "inactive";
  tags?: string[];
  priority?: number;
  isPopular?: boolean;
  images?: ServiceImage[];
  aiData?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ServiceTypesPayload {
  serviceTypes: ServiceType[];
  pagination: PaginationInfo;
}

export interface ServiceTypesResponse {
  success: boolean;
  message: string;
  data: ServiceTypesPayload;
}

