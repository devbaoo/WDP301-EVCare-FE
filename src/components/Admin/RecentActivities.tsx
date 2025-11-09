import React from "react";
import { RecentActivitiesData } from "../../interfaces/dashboard";

interface RecentActivitiesProps {
    data: RecentActivitiesData;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ data }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            completed: "bg-green-100 text-green-800",
            confirmed: "bg-blue-100 text-blue-800",
            in_progress: "bg-yellow-100 text-yellow-800",
            pending_confirmation: "bg-orange-100 text-orange-800",
            cancelled: "bg-red-100 text-red-800",
            paid: "bg-green-100 text-green-800",
            pending: "bg-yellow-100 text-yellow-800",
            failed: "bg-red-100 text-red-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            completed: "Hoàn thành",
            confirmed: "Đã xác nhận",
            in_progress: "Đang thực hiện",
            pending_confirmation: "Chờ xác nhận",
            cancelled: "Đã hủy",
            paid: "Đã thanh toán",
            pending: "Chờ thanh toán",
            failed: "Thất bại",
        };
        return labels[status] || status;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Hoạt động gần đây
            </h3>

            <div className="space-y-6">
                {/* Recent Bookings */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Booking mới nhất
                    </h4>
                    <div className="space-y-3">
                        {data.recentBookings && data.recentBookings.length > 0 ? (
                            data.recentBookings.map((booking) => (
                                <div
                                    key={booking._id}
                                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold text-sm">
                                            {booking.customer.fullName.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {booking.customer.fullName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {booking.vehicle.licensePlate} - {booking.vehicle.model}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {booking.serviceType.name} tại {booking.serviceCenter.name}
                                                </p>
                                            </div>
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                    booking.status
                                                )}`}
                                            >
                                                {getStatusLabel(booking.status)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatDate(booking.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">
                                Không có booking mới
                            </p>
                        )}
                    </div>
                </div>

                {/* Recent Payments */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Thanh toán mới nhất
                    </h4>
                    <div className="space-y-3">
                        {data.recentPayments && data.recentPayments.length > 0 ? (
                            data.recentPayments.map((payment) => (
                                <div
                                    key={payment._id}
                                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="text-green-600 font-semibold text-sm">
                                            ₫
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {payment.customer.fullName}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {payment.paymentInfo.description}
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900 mt-1">
                                                    {formatCurrency(payment.paymentInfo.amount)}
                                                </p>
                                            </div>
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                    payment.status
                                                )}`}
                                            >
                                                {getStatusLabel(payment.status)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatDate(payment.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">
                                Không có thanh toán mới
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecentActivities;
