import axiosInstance from "../../constant/axiosInstance";
import {
  DASHBOARD_OVERVIEW_ENDPOINT,
  DASHBOARD_REVENUE_ANALYTICS_ENDPOINT,
  DASHBOARD_BOOKING_ANALYTICS_ENDPOINT,
  DASHBOARD_CUSTOMER_GROWTH_ENDPOINT,
  DASHBOARD_SERVICE_CENTER_PERFORMANCE_ENDPOINT,
  DASHBOARD_INVENTORY_STATS_ENDPOINT,
  DASHBOARD_RECENT_ACTIVITIES_ENDPOINT,
  DASHBOARD_TOP_CUSTOMERS_ENDPOINT,
} from "../../constant/apiConfig";
import {
  DashboardQueryParams,
  OverviewResponse,
  RevenueAnalyticsResponse,
  BookingAnalyticsResponse,
  CustomerGrowthResponse,
  ServiceCenterPerformanceResponse,
  InventoryStatsResponse,
  RecentActivitiesResponse,
  TopCustomersResponse,
} from "../../../interfaces/dashboard";

/**
 * Build query string from params object
 */
const buildQueryString = (params?: DashboardQueryParams): string => {
  if (!params) return "";

  const queryParams = new URLSearchParams();

  if (params.startDate) queryParams.append("startDate", params.startDate);
  if (params.endDate) queryParams.append("endDate", params.endDate);
  if (params.serviceCenterId)
    queryParams.append("serviceCenterId", params.serviceCenterId);
  if (params.groupBy) queryParams.append("groupBy", params.groupBy);
  if (params.limit) queryParams.append("limit", params.limit.toString());

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : "";
};

/**
 * Get overview statistics
 * @param params - Query parameters (startDate, endDate, serviceCenterId)
 */
export const getOverviewStats = async (
  params?: DashboardQueryParams
): Promise<OverviewResponse> => {
  const queryString = buildQueryString(params);
  const response = await axiosInstance.get<OverviewResponse>(
    `${DASHBOARD_OVERVIEW_ENDPOINT}${queryString}`
  );
  return response.data;
};

/**
 * Get revenue analytics
 * @param params - Query parameters (startDate, endDate, groupBy, serviceCenterId)
 */
export const getRevenueAnalytics = async (
  params?: DashboardQueryParams
): Promise<RevenueAnalyticsResponse> => {
  const queryString = buildQueryString(params);
  const response = await axiosInstance.get<RevenueAnalyticsResponse>(
    `${DASHBOARD_REVENUE_ANALYTICS_ENDPOINT}${queryString}`
  );
  return response.data;
};

/**
 * Get booking analytics
 * @param params - Query parameters (startDate, endDate, groupBy, serviceCenterId)
 */
export const getBookingAnalytics = async (
  params?: DashboardQueryParams
): Promise<BookingAnalyticsResponse> => {
  const queryString = buildQueryString(params);
  const response = await axiosInstance.get<BookingAnalyticsResponse>(
    `${DASHBOARD_BOOKING_ANALYTICS_ENDPOINT}${queryString}`
  );
  return response.data;
};

/**
 * Get customer growth statistics
 * @param params - Query parameters (startDate, endDate, groupBy)
 */
export const getCustomerGrowth = async (
  params?: DashboardQueryParams
): Promise<CustomerGrowthResponse> => {
  const queryString = buildQueryString(params);
  const response = await axiosInstance.get<CustomerGrowthResponse>(
    `${DASHBOARD_CUSTOMER_GROWTH_ENDPOINT}${queryString}`
  );
  return response.data;
};

/**
 * Get service center performance (Admin only)
 * @param params - Query parameters (startDate, endDate)
 */
export const getServiceCenterPerformance = async (
  params?: DashboardQueryParams
): Promise<ServiceCenterPerformanceResponse> => {
  const queryString = buildQueryString(params);
  const response = await axiosInstance.get<ServiceCenterPerformanceResponse>(
    `${DASHBOARD_SERVICE_CENTER_PERFORMANCE_ENDPOINT}${queryString}`
  );
  return response.data;
};

/**
 * Get inventory statistics
 * @param params - Query parameters (serviceCenterId)
 */
export const getInventoryStats = async (
  params?: DashboardQueryParams
): Promise<InventoryStatsResponse> => {
  const queryString = buildQueryString(params);
  const response = await axiosInstance.get<InventoryStatsResponse>(
    `${DASHBOARD_INVENTORY_STATS_ENDPOINT}${queryString}`
  );
  return response.data;
};

/**
 * Get recent activities (bookings and payments)
 * @param params - Query parameters (limit)
 */
export const getRecentActivities = async (
  params?: DashboardQueryParams
): Promise<RecentActivitiesResponse> => {
  const queryString = buildQueryString(params);
  const response = await axiosInstance.get<RecentActivitiesResponse>(
    `${DASHBOARD_RECENT_ACTIVITIES_ENDPOINT}${queryString}`
  );
  return response.data;
};

/**
 * Get top customers by spending
 * @param params - Query parameters (limit, startDate, endDate)
 */
export const getTopCustomers = async (
  params?: DashboardQueryParams
): Promise<TopCustomersResponse> => {
  const queryString = buildQueryString(params);
  const response = await axiosInstance.get<TopCustomersResponse>(
    `${DASHBOARD_TOP_CUSTOMERS_ENDPOINT}${queryString}`
  );
  return response.data;
};
