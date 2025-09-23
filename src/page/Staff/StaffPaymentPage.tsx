import React, { useEffect, useState } from 'react';
import { Card, Select, DatePicker, Button, Spin, Alert, Tag, Space, Typography, Row, Col, Statistic } from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
    CalendarOutlined,
    UserOutlined,
    DollarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/services/store/store';
import { fetchWorkProgressList, fetchWorkProgressDetail } from '@/services/features/technician/workProgressSlice';
import { WorkProgressQueryParams, WorkProgress } from '@/interfaces/workProgress';
import ProcessPaymentModal from '@/components/Payment/ProcessPaymentModal';
import WorkProgressDetailModal from '@/components/WorkProgress/WorkProgressDetailModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const StaffPaymentPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { workProgressList, selectedWorkProgress: detailedWorkProgress, listLoading, detailLoading, error } = useAppSelector((state) => state.workProgress);

    // Filter states
    const [filters, setFilters] = useState<WorkProgressQueryParams>({});
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

    // Modal states
    const [processPaymentModalVisible, setProcessPaymentModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedWorkProgress, setSelectedWorkProgress] = useState<WorkProgress | null>(null);

    // Load data on component mount
    useEffect(() => {
        dispatch(fetchWorkProgressList(filters));
    }, [dispatch, filters]);

    // Handle filter changes
    const handleStatusFilterChange = (value: string) => {
        const newFilters = { ...filters };
        if (value === 'all') {
            delete newFilters.currentStatus;
        } else {
            newFilters.currentStatus = value as WorkProgressQueryParams['currentStatus'];
        }
        setFilters(newFilters);
    };

    const handleDateFilterChange = (date: dayjs.Dayjs | null) => {
        setSelectedDate(date);
        const newFilters = { ...filters };
        if (date) {
            newFilters.serviceDate = date.format('YYYY-MM-DD');
        } else {
            delete newFilters.serviceDate;
        }
        setFilters(newFilters);
    };

    const handleSearch = () => {
        dispatch(fetchWorkProgressList(filters));
    };

    const handleClearFilters = () => {
        setFilters({});
        setSelectedDate(null);
        dispatch(fetchWorkProgressList({}));
    };

    // Handle payment modal
    const handleOpenPaymentModal = (workProgress: WorkProgress) => {
        setSelectedWorkProgress(workProgress);
        setProcessPaymentModalVisible(true);
    };

    const handleClosePaymentModal = () => {
        setProcessPaymentModalVisible(false);
        setSelectedWorkProgress(null);
    };

    const handlePaymentSuccess = () => {
        // Refresh the work progress list after successful payment
        dispatch(fetchWorkProgressList(filters));
    };

    // Handle detail modal
    const handleViewDetails = async (workProgress: WorkProgress) => {
        setSelectedWorkProgress(workProgress);
        setDetailModalVisible(true);
        // Fetch detailed work progress data
        dispatch(fetchWorkProgressDetail(workProgress._id));
    };

    const handleCloseDetailModal = () => {
        setDetailModalVisible(false);
        setSelectedWorkProgress(null);
    };

    // Get status color and text
    const getStatusColor = (status: string) => {
        const statusColors: Record<string, string> = {
            'not_started': 'default',
            'in_progress': 'processing',
            'paused': 'warning',
            'completed': 'success',
            'delayed': 'error',
            'inspection_completed': 'blue',
            'quote_provided': 'orange',
            'quote_approved': 'green',
            'quote_rejected': 'red',
        };
        return statusColors[status] || 'default';
    };

    const getStatusText = (status: string) => {
        const statusTexts: Record<string, string> = {
            'not_started': 'Chưa bắt đầu',
            'in_progress': 'Đang thực hiện',
            'paused': 'Tạm dừng',
            'completed': 'Hoàn thành',
            'delayed': 'Trễ hạn',
            'inspection_completed': 'Đã kiểm tra',
            'quote_provided': 'Đã báo giá',
            'quote_approved': 'Đã duyệt giá',
            'quote_rejected': 'Từ chối giá',
        };
        return statusTexts[status] || status;
    };

    // Calculate statistics
    const getStatistics = () => {
        const total = workProgressList.length;
        const completed = workProgressList.filter(wp => wp.currentStatus === 'completed').length;
        const inProgress = workProgressList.filter(wp => wp.currentStatus === 'in_progress').length;
        const pending = workProgressList.filter(wp => wp.currentStatus === 'not_started' || wp.currentStatus === 'quote_provided').length;

        const totalRevenue = workProgressList.reduce((sum, wp) => {
            return sum + (wp.paymentDetails?.paidAmount || 0);
        }, 0);

        return { total, completed, inProgress, pending, totalRevenue };
    };

    const stats = getStatistics();

    return (
        <div className="p-6">
            <div className="mb-6">
                <Title level={2} className="mb-2">
                    <DollarOutlined className="mr-2" />
                    Quản lý Thanh toán
                </Title>
                <Text type="secondary">
                    Theo dõi và quản lý tiến độ công việc và thanh toán
                </Text>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng công việc"
                            value={stats.total}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Hoàn thành"
                            value={stats.completed}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đang thực hiện"
                            value={stats.inProgress}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu"
                            value={stats.totalRevenue}
                            prefix={<DollarOutlined />}
                            formatter={(value) => new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(Number(value))}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card className="mb-6">
                <Title level={4} className="mb-4">
                    <SearchOutlined className="mr-2" />
                    Bộ lọc
                </Title>
                <Row gutter={[24, 16]} align="bottom">
                    <Col xs={24} sm={12} lg={6}>
                        <div className="space-y-2">
                            <Text strong className="block">Trạng thái</Text>
                            <Select
                                placeholder="Chọn trạng thái"
                                style={{ width: '100%' }}
                                value={filters.currentStatus || 'all'}
                                onChange={handleStatusFilterChange}
                                size="large"
                            >
                                <Option value="all">Tất cả</Option>
                                <Option value="not_started">Chưa bắt đầu</Option>
                                <Option value="in_progress">Đang thực hiện</Option>
                                <Option value="paused">Tạm dừng</Option>
                                <Option value="completed">Hoàn thành</Option>
                                <Option value="delayed">Trễ hạn</Option>
                                <Option value="inspection_completed">Đã kiểm tra</Option>
                                <Option value="quote_provided">Đã báo giá</Option>
                                <Option value="quote_approved">Đã duyệt giá</Option>
                                <Option value="quote_rejected">Từ chối giá</Option>
                            </Select>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <div className="space-y-2">
                            <Text strong className="block">Ngày dịch vụ</Text>
                            <DatePicker
                                placeholder="Chọn ngày"
                                style={{ width: '100%' }}
                                value={selectedDate}
                                onChange={handleDateFilterChange}
                                format="DD/MM/YYYY"
                                size="large"
                            />
                        </div>
                    </Col>
                    <Col xs={24} sm={24} lg={12}>
                        <div className="flex justify-end gap-3">
                            <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                onClick={handleSearch}
                                loading={listLoading}
                                size="large"
                                className="min-w-[120px]"
                            >
                                Tìm kiếm
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleClearFilters}
                                size="large"
                                className="min-w-[120px]"
                            >
                                Xóa bộ lọc
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Error Alert */}
            {error && (
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                    className="mb-6"
                />
            )}

            {/* Work Progress List */}
            <Card>
                <Title level={4} className="mb-4">
                    <CalendarOutlined className="mr-2" />
                    Danh sách Tiến độ Công việc
                    {workProgressList.length > 0 && (
                        <Tag color="blue" className="ml-2">
                            {workProgressList.length} kết quả
                        </Tag>
                    )}
                </Title>

                {listLoading ? (
                    <div className="text-center py-8">
                        <Spin size="large" />
                        <div className="mt-4">
                            <Text>Đang tải dữ liệu...</Text>
                        </div>
                    </div>
                ) : workProgressList.length === 0 ? (
                    <div className="text-center py-8">
                        <ExclamationCircleOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                        <div className="mt-4">
                            <Text type="secondary">Không có dữ liệu</Text>
                        </div>
                    </div>
                ) : (
                    <Row gutter={[16, 16]}>
                        {workProgressList.map((workProgress) => (
                            <Col xs={24} lg={12} xl={8} key={workProgress._id}>
                                <WorkProgressCard
                                    workProgress={workProgress}
                                    getStatusColor={getStatusColor}
                                    getStatusText={getStatusText}
                                    onProcessPayment={handleOpenPaymentModal}
                                    onViewDetails={handleViewDetails}
                                />
                            </Col>
                        ))}
                    </Row>
                )}
            </Card>

            {/* Process Payment Modal */}
            <ProcessPaymentModal
                visible={processPaymentModalVisible}
                onCancel={handleClosePaymentModal}
                onSuccess={handlePaymentSuccess}
                workProgress={selectedWorkProgress}
            />

            {/* Work Progress Detail Modal */}
            <WorkProgressDetailModal
                visible={detailModalVisible}
                onCancel={handleCloseDetailModal}
                workProgress={detailedWorkProgress}
                loading={detailLoading}
            />
        </div>
    );
};

// Work Progress Card Component
interface WorkProgressCardProps {
    workProgress: WorkProgress;
    getStatusColor: (status: string) => string;
    getStatusText: (status: string) => string;
    onProcessPayment: (workProgress: WorkProgress) => void;
    onViewDetails: (workProgress: WorkProgress) => void;
}

const WorkProgressCard: React.FC<WorkProgressCardProps> = ({
    workProgress,
    getStatusColor,
    getStatusText,
    onProcessPayment,
    onViewDetails
}) => {
    const appointment = workProgress.appointmentId;
    const technician = workProgress.technicianId;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return dayjs(dateString).format('DD/MM/YYYY');
    };


    // Type guard to check if appointment is an object
    const isAppointmentObject = (appt: typeof appointment): appt is Exclude<typeof appointment, string> => {
        return appt !== null && typeof appt === 'object';
    };

    // Check if payment button should be shown
    const shouldShowPaymentButton = () => {
        // Only show for completed work progress
        if (workProgress.currentStatus !== 'completed') {
            return false;
        }

        // Check payment details - show button if payment method is "not_required" and status is "pending"
        if (workProgress.paymentDetails?.paymentMethod === 'not_required' &&
            workProgress.paymentDetails?.paymentStatus === 'pending') {
            return true;
        }

        // Check if already paid
        if (workProgress.paymentDetails?.paymentStatus === 'paid') {
            return false;
        }

        // Check appointment payment status
        if (isAppointmentObject(appointment) && appointment.payment?.status === 'paid') {
            return false;
        }

        return false;
    };

    return (
        <Card
            size="small"
            className="h-full hover:shadow-md transition-shadow"
            title={
                <div className="flex items-center justify-between">
                    <Text strong>#{workProgress._id.slice(-8)}</Text>
                    <Tag color={getStatusColor(workProgress.currentStatus)}>
                        {getStatusText(workProgress.currentStatus)}
                    </Tag>
                </div>
            }
        >
            <Space direction="vertical" size="small" className="w-full">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Text type="secondary" className="text-xs">Kỹ thuật viên</Text>
                        <br />
                        <Text className="text-sm">{typeof technician === 'string' ? technician : technician.email}</Text>
                    </div>
                    <div>
                        <Text type="secondary" className="text-xs">Ngày dịch vụ</Text>
                        <br />
                        <Text className="text-sm">{formatDate(workProgress.serviceDate)}</Text>
                    </div>
                </div>

                {/* Quote Amount */}
                {workProgress.quote && workProgress.quote.quoteAmount && (
                    <div>
                        <Text type="secondary" className="text-xs">Báo giá</Text>
                        <br />
                        <Text strong className="text-green-600">{formatCurrency(workProgress.quote.quoteAmount)}</Text>
                        <Tag
                            color={workProgress.quote.quoteStatus === 'approved' ? 'green' : 'orange'}
                            className="ml-2"
                        >
                            {workProgress.quote.quoteStatus === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                        </Tag>
                    </div>
                )}

                {/* Payment Status */}
                {workProgress.paymentDetails && (
                    <div>
                        <Text type="secondary" className="text-xs">Thanh toán</Text>
                        <br />
                        <div className="flex items-center gap-2">
                            <Tag color={workProgress.paymentDetails.paymentStatus === 'paid' ? 'green' : 'orange'}>
                                {workProgress.paymentDetails.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </Tag>
                            {workProgress.paymentDetails.paymentStatus === 'paid' && (
                                <Text className="text-sm">{formatCurrency(workProgress.paymentDetails.paidAmount)}</Text>
                            )}
                        </div>
                    </div>
                )}

                {/* Progress */}
                {workProgress.progressPercentage !== undefined && (
                    <div>
                        <Text type="secondary" className="text-xs">Tiến độ</Text>
                        <br />
                        <div className="flex items-center gap-2">
                            <Text className="text-sm">{workProgress.progressPercentage}%</Text>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${workProgress.progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="pt-3 border-t space-y-2">
                    <Button
                        type="default"
                        icon={<ExclamationCircleOutlined />}
                        onClick={() => onViewDetails(workProgress)}
                        className="w-full"
                        size="small"
                    >
                        Xem chi tiết
                    </Button>

                    {shouldShowPaymentButton() && (
                        <Button
                            type="primary"
                            icon={<DollarOutlined />}
                            onClick={() => onProcessPayment(workProgress)}
                            className="w-full bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                            size="small"
                        >
                            Xử lý Thanh toán
                        </Button>
                    )}
                </div>
            </Space>
        </Card>
    );
};

export default StaffPaymentPage;
