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
  myBookings: Booking[];
  bookingDetails: BookingData | null;
  // Admin booking confirmation
  awaitingConfirmationBookings: AwaitingConfirmationBooking[];
  awaitingConfirmationPagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;
  awaitingConfirmationLoading: boolean;
  confirmBookingLoading: boolean;
  // Staff confirmed bookings
  confirmedBookings: AwaitingConfirmationBooking[];
  confirmedBookingsPagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;
  confirmedBookingsLoading: boolean;
  // Pending offline payment bookings
  pendingOfflinePaymentBookings: AwaitingConfirmationBooking[];
  pendingOfflinePaymentPagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;
  pendingOfflinePaymentLoading: boolean;
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

// Added Booking interface
export interface Booking {
  _id: string;
  appointmentTime: {
    date: string;
    startTime?: string;
    endTime?: string;
    duration?: number;
  };
  serviceType?: {
    name: string;
    pricing?: {
      basePrice: number;
      priceType: string;
      currency: string;
      isNegotiable: boolean;
    };
    category?: string;
    _id?: string;
  };
  serviceCenter?: {
    name: string;
    address?: {
      coordinates: {
        lat: number;
        lng: number;
      };
      street: string;
      ward: string;
      district: string;
      city: string;
    };
    contact?: {
      phone: string;
      email: string;
      website?: string;
    };
    _id?: string;
  };
  vehicle?: {
    vehicleInfo: {
      vehicleModel: string;
      year: number;
      color: string;
      licensePlate: string;
    };
    _id: string;
  };
  status: string;
  serviceDetails?: {
    description: string;
    priority?: string;
    estimatedCost?: number;
    isInspectionOnly?: boolean;
    isFromPackage?: boolean;
    servicePackageId?: string;
  };
  payment?: {
    method: string;
    status: string;
    amount: number;
    paidAt?: string;
    notes?: string;
  };
  confirmation?: {
    isConfirmed: boolean;
    confirmationMethod: string;
    confirmedAt?: string;
    confirmedBy?: string;
  };
  cancellation?: {
    isCancelled: boolean;
    refundAmount: number;
    cancelledAt?: string;
    cancelledBy?: string;
    reason?: string;
  };
  rescheduling?: {
    isRescheduled: boolean;
  };
  completion?: {
    isCompleted: boolean;
    completedAt?: string;
    completedBy?: string;
    workDone?: string;
    recommendations?: string;
  };
  inspectionAndQuote?: {
    quoteStatus?: string;
    inspectionNotes?: string;
    inspectionCompletedAt?: string;
    vehicleCondition?: string;
    diagnosisDetails?: string;
    quoteAmount?: number;
    quoteDetails?: string;
    quotedAt?: string;
    customerResponseAt?: string;
    customerResponseNotes?: string;
  };
  reminders?: string[];
  documents?: string[];
  internalNotes?: string[];
  feedback?: {
    overall: number;
    service: number;
    technician: number;
    facility: number;
    comment: string;
    submittedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Awaiting Confirmation Booking interfaces
export interface AwaitingConfirmationBooking {
  _id: string;
  customer:
    | string
    | {
        _id: string;
        email: string;
        fullName: string;
        phone: string;
      };
  vehicle:
    | string
    | {
        _id: string;
        vehicleInfo: {
          year: number;
          licensePlate: string;
          color: string;
          vehicleModel?: {
            _id: string;
            brand: string;
            modelName: string;
          };
        };
      };
  serviceCenter: {
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
    services: string[];
    staff: Array<{
      user: string;
      role: string;
      isActive: boolean;
      _id: string;
    }>;
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
  };
  serviceType:
    | string
    | {
        _id: string;
        name: string;
        pricing: {
          basePrice: number;
          priceType: string;
          currency: string;
          isNegotiable: boolean;
        };
      };
  appointmentTime: {
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
  };
  serviceDetails: {
    description: string;
    priority: string;
    estimatedCost: number;
    isInspectionOnly: boolean;
    isFromPackage: boolean;
  };
  inspectionAndQuote: {
    quoteStatus: string;
  };
  payment: {
    method: string;
    status: string;
    amount: number;
    paidAt: string;
    transactionId?: string;
  };
  confirmation: {
    isConfirmed: boolean;
    confirmationMethod: string;
    confirmedAt?: string;
    confirmedBy?: string;
  };
  cancellation: {
    isCancelled: boolean;
    refundAmount: number;
  };
  rescheduling: {
    isRescheduled: boolean;
  };
  completion: {
    isCompleted: boolean;
  };
  status: string;
  reminders: string[];
  documents: string[];
  internalNotes: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AwaitingConfirmationQueryParams {
  serviceCenterId: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface AwaitingConfirmationResponse {
  success: boolean;
  message: string;
  data: {
    appointments: AwaitingConfirmationBooking[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface ConfirmBookingResponse {
  success: boolean;
  message: string;
  data: AwaitingConfirmationBooking;
}
