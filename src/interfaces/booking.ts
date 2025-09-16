import { Vehicle } from "./vehicle";

export interface ServiceDetails {
  duration: number;
  complexity: string;
  requiredSkills: string[];
  tools: string[];
}

export interface ServicePricing {
  basePrice: number;
  priceType: string;
  currency: string;
  isNegotiable: boolean;
}

export interface ProcedureStep {
  stepNumber: number;
  title: string;
  description: string;
  estimatedTime: number;
  requiredTools: string[];
  safetyNotes: string[];
  _id: string;
}

export interface Procedure {
  steps: ProcedureStep[];
  totalSteps: number;
}

export interface Requirements {
  minBatteryLevel: number;
  maxMileage: number;
  specialConditions: string[];
  safetyRequirements: string[];
}

export interface AIData {
  averageCompletionTime: number;
  successRate: number;
  commonIssues: string[];
  recommendations: string[];
}

export interface RequiredPart {
  partName: string;
  partType: string;
  quantity: number;
  isOptional: boolean;
  estimatedCost: number;
  _id: string;
}

export interface CompatibleVehicle {
  brand: string;
  model: string;
  year: string;
  batteryType: string;
  _id: string;
}

export interface ServiceImage {
  url: string;
  caption: string;
  isPrimary: boolean;
  _id: string;
}

export interface ServiceType {
  _id: string;
  name: string;
  description: string;
  category: string;
  serviceDetails: ServiceDetails;
  pricing: ServicePricing;
  procedure: Procedure;
  requirements: Requirements;
  aiData: AIData;
  requiredParts: RequiredPart[];
  compatibleVehicles: CompatibleVehicle[];
  status: string;
  images: ServiceImage[];
  tags: string[];
  priority: number;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ServicePackageIncludedService {
  _id: string;
  name: string;
  category?: string;
  pricing?: Partial<ServicePricing>;
}

export interface ServicePackage {
  _id: string;
  packageName: string;
  description: string;
  durationMonths: number;
  price: number;
  includedServices: ServicePackageIncludedService[];
  maxServicesPerMonth: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface BookingData {
  customerId: string;
  vehicleId: string;
  serviceCenterId: string;
  // When booking a single service
  serviceTypeId?: string;
  // When subscribing/booking a package
  servicePackageId?: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceDescription: string;
  priority: "low" | "medium" | "high" | "critical";
  paymentPreference: "online" | "offline";
  isInspectionOnly?: boolean;
}

export interface BookingStep {
  step: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface BookingState {
  currentStep: number;
  bookingData: Partial<BookingData>;
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  serviceCenters: BookingServiceCenter[];
  selectedServiceCenter: BookingServiceCenter | null;
  compatibleServices: ServiceType[];
  selectedService: ServiceType | null;
  compatiblePackages: ServicePackage[];
  selectedServicePackage: ServicePackage | null;
  availableTimeSlots: TimeSlot[];
  popularServices: ServiceType[];
  loading: boolean;
  error: string | null;
  createVehicleLoading: boolean;
  createBookingLoading: boolean;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: number;
  availableTechnicians: string[];
}

export interface TimeSlotsResponse {
  success: boolean;
  message: string;
  data: {
    date: string;
    serviceCenter: string;
    serviceType: string;
    availableSlots: TimeSlot[];
    totalSlots: number;
  };
}

export interface BookingServiceCenter {
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
    website?: string;
  };
  operatingHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
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
  services: Array<{
    _id: string;
    name: string;
    category: string;
    pricing: {
      basePrice: number;
    };
  }>;
  staff: Array<{
    _id: string;
    user: {
      _id: string;
      username: string;
      email: string;
      fullName: string;
    };
    role: string;
    isActive: boolean;
  }>;
  status: string;
  images: Array<{
    _id: string;
    url: string;
    caption: string;
    isPrimary: boolean;
  }>;
  paymentMethods: Array<{
    _id: string;
    type: string;
    isEnabled: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
