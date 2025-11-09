import React from "react";
import { RevenueAnalytic } from "../../interfaces/dashboard";

interface RevenueChartProps {
    data: RevenueAnalytic[];
    groupBy: "day" | "month" | "year";
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, groupBy }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Biểu đồ Doanh thu
                </h3>
                <div className="flex items-center justify-center h-64 text-gray-500">
                    Không có dữ liệu
                </div>
            </div>
        );
    }

    // Calculate max value for scaling
    const maxRevenue = Math.max(...data.map((item) => item.revenue));
    const formatRevenue = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}K`;
        }
        return value.toString();
    };

    const formatPeriod = (period: string) => {
        if (groupBy === "day") {
            const date = new Date(period);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        }
        if (groupBy === "month") {
            const date = new Date(period);
            return `T${date.getMonth() + 1}/${date.getFullYear()}`;
        }
        return period;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Biểu đồ Doanh thu
            </h3>

            {/* Simple bar chart */}
            <div className="space-y-4">
                {data.map((item, index) => (
                    <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 font-medium">
                                {formatPeriod(item.period)}
                            </span>
                            <span className="text-gray-900 font-semibold">
                                {formatRevenue(item.revenue)} VND
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                style={{
                                    width: `${(item.revenue / maxRevenue) * 100}%`,
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{item.transactions} giao dịch</span>
                            <span>TB: {formatRevenue(item.average)} VND</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-600 rounded"></div>
                        <span className="text-gray-600">Doanh thu</span>
                    </div>
                    <div className="text-gray-500">
                        Tổng: {formatRevenue(data.reduce((sum, item) => sum + item.revenue, 0))} VND
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueChart;
