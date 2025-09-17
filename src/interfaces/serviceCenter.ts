export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  coordinates: Coordinates;
  street: string;
  ward: string;
  district: string;
  city: string;
}

export interface Contact {
  phone: string;
  email: string;
  website: string;
}

export interface OperatingHours {
  open: string;
  close: string;
  isOpen: boolean;
}

export interface WeeklyOperatingHours {
  monday: OperatingHours;
  tuesday: OperatingHours;
  wednesday: OperatingHours;
  thursday: OperatingHours;
  friday: OperatingHours;
  saturday: OperatingHours;
  sunday: OperatingHours;
}

export interface Capacity {
  maxConcurrentServices: number;
  maxDailyAppointments: number;
}

export interface Rating {
  average: number;
  count: number;
}

export interface AISettings {
  enableInventoryPrediction: boolean;
  enableMaintenancePrediction: boolean;
  enableDemandForecasting: boolean;
}

export interface ServicePricing {
  basePrice: number;
}

export interface Service {
  _id: string;
  name: string;
  category: string;
  pricing: ServicePricing;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
}

export interface Staff {
  _id: string;
  user: User;
  role: string;
  isActive: boolean;
}

export interface Image {
  _id: string;
  url: string;
  caption: string;
  isPrimary: boolean;
}

export interface PaymentMethod {
  _id: string;
  type: string;
  isEnabled: boolean;
}

export interface ServiceCenter {
  _id: string;
  name: string;
  description: string;
  address: Address;
  contact: Contact;
  operatingHours: WeeklyOperatingHours;
  capacity: Capacity;
  rating: Rating;
  aiSettings: AISettings;
  services: Service[];
  staff: Staff[];
  status: string;
  images: Image[];
  paymentMethods: PaymentMethod[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ServiceCentersResponse {
  success: boolean;
  message: string;
  data: {
    serviceCenters: ServiceCenter[];
    pagination: Pagination;
  };
}

export interface ServiceCenterState {
  serviceCenters: ServiceCenter[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  selectedServiceCenter: ServiceCenter | null;
}

// Payloads for create/update requests to the API (client-side)
export interface ServiceCenterCreatePayload {
  name: string;
  description: string;
  address: {
    street: string;
    ward: string;
    district: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  operatingHours: WeeklyOperatingHours;
  services: string[]; // array of service ids
  staff: Array<{
    user: string; // user id
    role: string;
    isActive: boolean;
  }>;
  capacity: Capacity;
  status: string;
  images: Array<{
    url: string;
    caption: string;
    isPrimary: boolean;
  }>;
  rating: Rating;
  paymentMethods: Array<{
    type: string;
    isEnabled: boolean;
  }>;
  aiSettings: AISettings;
}

export interface ServiceCenterUpdatePayload extends ServiceCenterCreatePayload {
  _id: string;
}