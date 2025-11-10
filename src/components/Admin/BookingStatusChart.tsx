import React from "react";
import { BookingsByStatus } from "../../interfaces/dashboard";

interface BookingStatusChartProps {
    data: BookingsByStatus;
}

const BookingStatusChart: React.FC<BookingStatusChartProps> = ({ data }) => {
    const statusConfig = [
        {
            key: "completed",
            label: "Hoàn thành",
            color: "bg-green-500",
            value: data.completed,
        },
        {
            key: "confirmed",
            label: "Đã xác nhận",
            color: "bg-blue-500",
            value: data.confirmed,
        },
        {
            key: "in_progress",
            label: "Đang thực hiện",
            color: "bg-yellow-500",
            value: data.in_progress,
        },
        {
            key: "pending_confirmation",
            label: "Chờ xác nhận",
            color: "bg-orange-500",
            value: data.pending_confirmation,
        },
        {
            key: "cancelled",
            label: "Đã hủy",
            color: "bg-red-500",
            value: data.cancelled,
        },
    ];

    const total = Object.values(data).reduce((sum, val) => sum + val, 0);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Trạng thái Booking
            </h3>

            {/* Pie Chart representation using bars */}
            <div className="space-y-3">
                {statusConfig.map((status) => {
                    const percentage = total > 0 ? (status.value / total) * 100 : 0;
                    return (
                        <div key={status.key}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {status.label}
                                    </span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                    {status.value} ({percentage.toFixed(1)}%)
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`${status.color} h-2 rounded-full transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Total */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Tổng cộng</span>
                    <span className="text-lg font-bold text-gray-900">{total} bookings</span>
                </div>
            </div>
        </div>
    );
};

export default BookingStatusChart;
