import React, { useState, useEffect } from "react";
import StatCard from "../../components/Admin/StatCard";
import RevenueChart from "../../components/Admin/RevenueChart";
import BookingStatusChart from "../../components/Admin/BookingStatusChart";
import RecentActivities from "../../components/Admin/RecentActivities";
import TopCustomersTable from "../../components/Admin/TopCustomersTable";
import {
    getOverviewStats,
    getRevenueAnalytics,
    getRecentActivities,
    getTopCustomers,
} from "../../services/features/admin/dashboardApi";
import {
    OverviewData,
    RevenueAnalyticsData,
    RecentActivitiesData,
    TopCustomer,
} from "../../interfaces/dashboard";

const DashboardPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<OverviewData | null>(null);
    const [revenueData, setRevenueData] = useState<RevenueAnalyticsData | null>(null);
    const [recentActivities, setRecentActivities] = useState<RecentActivitiesData | null>(null);
    const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
    const [dateRange, setDateRange] = useState<{
        startDate: string;
        endDate: string;
    }>({
        startDate: getDefaultStartDate(),
        endDate: getDefaultEndDate(),
    });
    const [revenueGroupBy, setRevenueGroupBy] = useState<"day" | "month" | "year">("month");

    // Get default date range (last 30 days)
    function getDefaultStartDate(): string {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split("T")[0];
    }

    function getDefaultEndDate(): string {
        const date = new Date();
        return date.toISOString().split("T")[0];
    }

    // Fetch all dashboard data
    const fetchDashboardData = React.useCallback(async () => {
        try {
            setLoading(true);

            // Fetch overview stats
            const overviewResponse = await getOverviewStats({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
            });
            setOverview(overviewResponse.data);

            // Fetch revenue analytics
            const revenueResponse = await getRevenueAnalytics({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                groupBy: revenueGroupBy,
            });
            setRevenueData(revenueResponse.data);

            // Fetch recent activities
            const activitiesResponse = await getRecentActivities({ limit: 5 });
            setRecentActivities(activitiesResponse.data);

            // Fetch top customers
            const customersResponse = await getTopCustomers({
                limit: 10,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
            });
            setTopCustomers(customersResponse.data);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, [dateRange.startDate, dateRange.endDate, revenueGroupBy]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bảng Điều Khiển</h1>
                    <p className="text-gray-600 mt-1">Tổng quan hệ thống EVCare</p>
                </div>

                {/* Date Range Filter */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <select
                            value={revenueGroupBy}
                            onChange={(e) => setRevenueGroupBy(e.target.value as "day" | "month" | "year")}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="day">Theo ngày</option>
                            <option value="month">Theo tháng</option>
                            <option value="year">Theo năm</option>
                        </select>
                        <label className="text-sm font-medium text-gray-700">Từ:</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) =>
                                setDateRange({ ...dateRange, startDate: e.target.value })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Đến:</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) =>
                                setDateRange({ ...dateRange, endDate: e.target.value })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setDateRange({
                                startDate: getDefaultStartDate(),
                                endDate: getDefaultEndDate(),
                            });
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        30 ngày
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {overview && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Tổng Doanh thu"
                        value={formatCurrency(overview.revenue.total)}
                        subtitle={`${overview.revenue.transactions} giao dịch`}
                        icon={
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        }
                        color="green"
                    />

                    <StatCard
                        title="Tổng Đặt Lịch"
                        value={overview.bookings.total}
                        subtitle={`${overview.bookings.byStatus.completed} hoàn thành`}
                        icon={
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                        }
                        color="blue"
                    />

                    <StatCard
                        title="Khách hàng"
                        value={overview.customers.total}
                        subtitle={`${overview.customers.new} khách mới`}
                        icon={
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                            </svg>
                        }
                        color="purple"
                    />

                    <StatCard
                        title="Trung tâm dịch vụ"
                        value={overview.serviceCenters.total}
                        subtitle={`${overview.vehicles.total} xe đã đăng ký`}
                        icon={
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                            </svg>
                        }
                        color="indigo"
                    />
                </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Doanh thu</h3>
                        
                    </div>
                    {revenueData && (
                        <RevenueChart
                            data={revenueData.analytics}
                            groupBy={revenueGroupBy}
                        />
                    )}
                </div>

                {/* Booking Status Chart */}
                {overview && <BookingStatusChart data={overview.bookings.byStatus} />}
            </div>

            {/* Top Services and Technicians */}
            {overview && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Services */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Dịch vụ phổ biến
                        </h3>
                        <div className="space-y-3">
                            {overview.topServices.map((service, index) => (
                                <div
                                    key={service._id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                                            {index + 1}
                                        </span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {service.name}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-600">
                                        {service.count} lượt
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Technicians */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Kỹ thuật viên xuất sắc
                        </h3>
                        <div className="space-y-3">
                            {overview.topTechnicians.map((tech, index) => (
                                <div
                                    key={tech._id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-semibold text-sm">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {tech.name}
                                            </p>
                                            <p className="text-xs text-gray-500">{tech.email}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-600">
                                        {tech.totalJobs} công việc
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Activities */}
            {recentActivities && <RecentActivities data={recentActivities} />}

            {/* Top Customers */}
            <TopCustomersTable customers={topCustomers} />
        </div>
    );
};

export default DashboardPage;



