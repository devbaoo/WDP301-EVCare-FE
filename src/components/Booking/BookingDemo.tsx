import React from 'react';
import { Card, Button, Alert, Space } from 'antd';
import { Calendar, Car, Wrench, Building2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingDemo: React.FC = () => {
    const navigate = useNavigate();

    const steps = [
        {
            icon: <Car className="w-8 h-8 text-blue-500" />,
            title: "Chọn xe",
            description: "Chọn xe hiện có hoặc thêm xe mới",
            features: ["Danh sách xe của bạn", "Form tạo xe mới", "Validation dữ liệu"]
        },
        {
            icon: <Building2 className="w-8 h-8 text-green-500" />,
            title: "Chọn trung tâm",
            description: "Tìm trung tâm dịch vụ phù hợp",
            features: ["Tìm kiếm theo địa chỉ", "Lọc theo trạng thái", "Thông tin chi tiết"]
        },
        {
            icon: <Wrench className="w-8 h-8 text-orange-500" />,
            title: "Chọn dịch vụ",
            description: "Dịch vụ tương thích với xe",
            features: ["Dịch vụ phù hợp", "Thông tin AI", "Giá cả & thời gian"]
        },
        {
            icon: <Calendar className="w-8 h-8 text-purple-500" />,
            title: "Đặt lịch",
            description: "Chọn ngày giờ & thông tin cuối",
            features: ["Chọn ngày giờ", "Mô tả dịch vụ", "Độ ưu tiên"]
        }
    ];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Hệ thống đặt lịch bảo dưỡng xe điện
                </h1>
                <p className="text-gray-600 text-lg">
                    Quy trình đặt lịch đơn giản với 4 bước
                </p>
            </div>

            <Alert
                message="Demo Booking System"
                description="Đây là demo hệ thống đặt lịch với đầy đủ tính năng. Bạn có thể test toàn bộ quy trình từ chọn xe đến hoàn thành đặt lịch."
                type="info"
                showIcon
                className="mb-8"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {steps.map((step, index) => (
                    <Card
                        key={index}
                        hoverable
                        className="text-center h-full"
                    >
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                {step.icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Bước {index + 1}
                                </h3>
                                <h4 className="font-medium text-gray-700 mb-2">
                                    {step.title}
                                </h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    {step.description}
                                </p>
                                <ul className="text-xs text-gray-500 space-y-1">
                                    {step.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center">
                                            <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="text-center">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Sẵn sàng đặt lịch?
                        </h2>
                        <p className="text-gray-600">
                            Bắt đầu quy trình đặt lịch bảo dưỡng xe điện của bạn
                        </p>
                    </div>

                    <Space size="large">
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => navigate('/booking')}
                            className="bg-blue-600 hover:bg-blue-700 h-12 px-8"
                        >
                            Bắt đầu đặt lịch
                        </Button>
                        <Button
                            size="large"
                            onClick={() => navigate('/')}
                            className="h-12 px-8"
                        >
                            Về trang chủ
                        </Button>
                    </Space>

                    <div className="text-sm text-gray-500">
                        <p>Quy trình đặt lịch hoàn toàn miễn phí và dễ dàng</p>
                        <p>Hỗ trợ 24/7: 1900 1234</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default BookingDemo;
