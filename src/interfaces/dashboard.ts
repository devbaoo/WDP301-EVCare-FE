// Dashboard API Response Types

export interface RevenueStats {
  total: number;
  transactions: number;
  average: number;
}

export interface BookingsByStatus {
  completed: number;
  pending_confirmation: number;
  in_progress: number;
  cancelled: number;
  confirmed: number;
}

export interface BookingStats {
  total: number;
  byStatus: BookingsByStatus;
}

export interface CustomerStats {
  total: number;
  new: number;
}

export interface VehicleStats {
  total: number;
}

export interface ServiceCenterStats {
  total: number;
}

export interface TopService {
  _id: string;
  name: string;
  count: number;
}

export interface TopTechnician {
  _id: string;
  name: string;
  email: string;
  totalJobs: number;
}

export interface OverviewData {
  revenue: RevenueStats;
  bookings: BookingStats;
  customers: CustomerStats;
  vehicles: VehicleStats;
  serviceCenters: ServiceCenterStats;
  activePackages: number;
  topServices: TopService[];
  topTechnicians: TopTechnician[];
}

export interface OverviewResponse {
  success: boolean;
  data: OverviewData;
}

// Revenue Analytics
export interface RevenueAnalytic {
  period: string;
  revenue: number;
  transactions: number;
  average: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  totalTransactions: number;
  growthRate: string;
}

export interface RevenueAnalyticsData {
  analytics: RevenueAnalytic[];
  summary: RevenueSummary;
}

export interface RevenueAnalyticsResponse {
  success: boolean;
  data: RevenueAnalyticsData;
}

// Booking Analytics
export interface BookingAnalytic {
  period: string;
  total: number;
  completed: number;
  cancelled: number;
  pending: number;
  inProgress: number;
  completionRate: string;
}

export interface BookingAnalyticsSummary {
  totalBookings: number;
  totalCompleted: number;
  totalCancelled: number;
  averageCompletionRate: number;
}

export interface BookingAnalyticsData {
  analytics: BookingAnalytic[];
  summary: BookingAnalyticsSummary;
}

export interface BookingAnalyticsResponse {
  success: boolean;
  data: BookingAnalyticsData;
}

// Customer Growth
export interface CustomerGrowth {
  period: string;
  newCustomers: number;
}

export interface CustomerGrowthSummary {
  totalNewCustomers: number;
}

export interface CustomerGrowthData {
  growth: CustomerGrowth[];
  summary: CustomerGrowthSummary;
}

export interface CustomerGrowthResponse {
  success: boolean;
  data: CustomerGrowthData;
}

// Service Center Performance
export interface ServiceCenterPerformance {
  _id: string;
  name: string;
  address: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  completionRate: number;
}

export interface ServiceCenterPerformanceResponse {
  success: boolean;
  data: ServiceCenterPerformance[];
}

// Inventory Stats
export interface PartInfo {
  _id: string;
  name: string;
  code: string;
}

export interface ServiceCenterInfo {
  _id: string;
  name: string;
}

export interface LowStockPart {
  part: PartInfo;
  serviceCenter: ServiceCenterInfo;
  currentStock: number;
  minStockLevel: number;
  deficit: number;
}

export interface InventorySummary {
  totalParts: number;
  totalQuantity: number;
  totalValue: number;
  lowStockItems: number;
}

export interface InventoryStatsData {
  summary: InventorySummary;
  lowStockParts: LowStockPart[];
}

export interface InventoryStatsResponse {
  success: boolean;
  data: InventoryStatsData;
}

// Recent Activities
export interface RecentBooking {
  _id: string;
  customer: {
    fullName: string;
    email: string;
  };
  vehicle: {
    licensePlate: string;
    model: string;
  };
  serviceCenter: {
    name: string;
  };
  serviceType: {
    name: string;
  };
  status: string;
  appointmentTime: {
    date: string;
    startTime: string;
    endTime: string;
  };
  createdAt: string;
}

export interface RecentPayment {
  _id: string;
  customer: {
    fullName: string;
    email: string;
  };
  paymentInfo: {
    amount: number;
    description: string;
  };
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface RecentActivitiesData {
  recentBookings: RecentBooking[];
  recentPayments: RecentPayment[];
}

export interface RecentActivitiesResponse {
  success: boolean;
  data: RecentActivitiesData;
}

// Top Customers
export interface TopCustomer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  totalSpent: number;
  totalTransactions: number;
  averageSpending: number;
}

export interface TopCustomersResponse {
  success: boolean;
  data: TopCustomer[];
}

// Query Parameters
export interface DashboardQueryParams {
  startDate?: string;
  endDate?: string;
  serviceCenterId?: string;
  groupBy?: "day" | "month" | "year";
  limit?: number;
}
