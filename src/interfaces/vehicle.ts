export interface VehicleModel {
  _id: string;
  brand: string;
  modelName: string;
  yearFrom: number;
  yearTo: number;
  batteryType: string;
  batteryCapacity?: number;
  maintenanceIntervals: {
    [key: string]: string;
  };
}

export interface VehicleInfo {
  vehicleModel: VehicleModel;
  year: number;
  color: string;
  licensePlate: string;
  brand?: string;
  modelName?: string;
  batteryType?: string;
  batteryCapacity?: number | string;
}

export interface VehicleInfoUpdatableFields {
  licensePlate?: string;
  color?: string;
  year?: number;
}

export type UpdateVehicleData =
  | {
      vehicleInfo?: VehicleInfoUpdatableFields;
    }
  | VehicleInfoUpdatableFields;

export interface CurrentStatus {
  mileage: number;
  batteryHealth: number;
  isActive: boolean;
}

export interface Vehicle {
  _id: string;
  owner: string;
  vehicleInfo: VehicleInfo;
  currentStatus: CurrentStatus;
  status: string;
  maintenanceHistory: any[];
  alerts: any[];
  images: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateVehicleData {
  vehicleInfo: {
    brand: string;
    modelName: string;
    year: number;
    batteryType: string;
    licensePlate: string;
    color: string;
    batteryCapacity: string;
  };
}

export interface CreateVehicleResponse {
  success: boolean;
  message: string;
  data: Vehicle;
}

export interface VehicleState {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  loading: boolean;
  error: string | null;
}
