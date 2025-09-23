// Technician Schedule Interfaces

export interface BreakTime {
  _id?: string;
  start: string; // HH:mm format
  end: string; // HH:mm format
}

export interface LeaveRequest {
  status: "pending" | "approved" | "rejected";
}

export interface TechnicianInfo {
  _id: string;
  email: string;
  fullName?: string;
  phone?: string;
  role?: string;
}

export interface ServiceCenterInfo {
  _id: string;
  name: string;
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
}

export interface TechnicianSchedule {
  _id: string;
  technicianId: TechnicianInfo;
  centerId: ServiceCenterInfo;
  workDate: string; // ISO date
  shiftStart: string; // HH:mm format
  shiftEnd: string; // HH:mm format
  status: "scheduled" | "working" | "completed" | "absent" | "on_leave";
  breakTime: BreakTime[];
  overtimeHours: number;
  availability: "available" | "busy" | "unavailable";
  assignedAppointments: any[]; // Array of appointment IDs or objects
  actualWorkHours: number;
  notes?: string;
  leaveRequest?: LeaveRequest;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Request payloads
export interface CreateSingleSchedulePayload {
  technicianId: string;
  centerId: string;
  workDate: string; // ISO date format (YYYY-MM-DD)
  shiftStart: string; // HH:mm format
  shiftEnd: string; // HH:mm format
  breakTime?: BreakTime[];
  notes?: string;
}

export interface CreateDefaultSchedulesPayload {
  technicianId: string;
  centerId: string;
  startDate: string; // ISO date format (YYYY-MM-DD)
  endDate: string; // ISO date format (YYYY-MM-DD)
}

// Query params for fetching technician schedules
export interface TechnicianScheduleQueryParams {
  technicianId?: string;
  centerId?: string;
  workDate?: string; // ISO date format (YYYY-MM-DD)
  startDate?: string; // ISO date format (YYYY-MM-DD)
  endDate?: string; // ISO date format (YYYY-MM-DD)
  status?: "scheduled" | "completed" | "cancelled" | "in-progress";
  availability?: "available" | "busy" | "unavailable";
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Response interfaces
export interface CreateSingleScheduleResponse {
  success: boolean;
  data: TechnicianSchedule;
  message: string;
}

export interface CreateDefaultSchedulesResponse {
  success: boolean;
  data: TechnicianSchedule[];
  message: string;
}

export interface TechnicianScheduleListResponse {
  success: boolean;
  data: {
    schedules: TechnicianSchedule[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
  message: string;
}

export interface TechnicianScheduleByCenterResponse {
  success: boolean;
  data: TechnicianSchedule[];
}

// Technician Staff interfaces
export interface TechnicianStaff {
  _id: string;
  userId: TechnicianInfo;
  centerId: string;
  position: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface TechnicianStaffResponse {
  success: boolean;
  data: TechnicianStaff[];
}

export interface AvailableTechnician {
  _id: string;
  email: string;
  fullName?: string;
  phone?: string;
  role: string;
  isAvailable: boolean;
  reason?: string;
}

export interface AvailableTechniciansResponse {
  success: boolean;
  data: AvailableTechnician[];
}

// Update/Create Schedule interfaces
export interface UpdateSchedulePayload {
  _id: string;
  technicianId?: string;
  centerId?: string;
  workDate?: string;
  shiftStart?: string;
  shiftEnd?: string;
  status?: "scheduled" | "working" | "completed" | "absent" | "on_leave";
  breakTime?: BreakTime[];
  notes?: string;
}

export interface UpdateScheduleResponse {
  success: boolean;
  data: TechnicianSchedule;
  message: string;
}

export interface DeleteScheduleResponse {
  success: boolean;
  message: string;
}

// State interface
export interface TechnicianState {
  schedules: TechnicianSchedule[];
  technicianStaff: TechnicianStaff[];
  availableTechnicians: AvailableTechnician[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;
  loading: boolean;
  createScheduleLoading: boolean;
  createDefaultSchedulesLoading: boolean;
  fetchSchedulesLoading: boolean;
  fetchSchedulesByCenterLoading: boolean;
  fetchStaffLoading: boolean;
  fetchAvailableTechniciansLoading: boolean;
  updateScheduleLoading: boolean;
  deleteScheduleLoading: boolean;
  error: string | null;
}
