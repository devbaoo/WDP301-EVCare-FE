import React, { useEffect, useState } from "react";
import {
    CalendarOutlined,
    EyeOutlined,
    EditOutlined,
    CloseOutlined,
    FilterOutlined,
    ReloadOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    InfoCircleOutlined,
    EnvironmentOutlined,
    TagOutlined,
    HistoryOutlined
} from "@ant-design/icons";
import {
    Card,
    Table,
    Button,
    Select,
    Space,
    Tooltip,
    Row,
    Col,
    Statistic,
    Tag,
    DatePicker,
    Empty,
    Spin,
    message,
    Typography,
    Divider,
    Modal,
    Input as AntInput
} from "antd";
import axiosInstance from "../../services/constant/axiosInstance";
import { BOOKING_DETAILS_ENDPOINT, BOOKING_TIME_SLOTS_ENDPOINT, APPOINTMENT_PROGRESS_ENDPOINT, TECHNICIAN_PROGRESS_QUOTE_RESPONSE_ENDPOINT } from "../../services/constant/apiConfig";
import { Booking } from "../../interfaces/booking";
import { cancelBooking, rescheduleBooking, fetchMyBookings } from "../../services/features/booking/bookingSlice";
import { useAppDispatch, useAppSelector } from "../../services/store/store";
import dayjs from 'dayjs';

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = AntInput;

function BookingHistory() {
    const dispatch = useAppDispatch();
    const { myBookings, loading, error } = useAppSelector((state) => state.booking);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [progressModalOpen, setProgressModalOpen] = useState(false);
    const [progressLoading, setProgressLoading] = useState(false);
    const [progressData, setProgressData] = useState<Record<string, unknown> | null>(null);
    const [quoteResponseNotes, setQuoteResponseNotes] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [newDate, setNewDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [cancelReason, setCancelReason] = useState("");
    const [availableSlots, setAvailableSlots] = useState<{ startTime: string; endTime: string; }[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [rescheduleError, setRescheduleError] = useState<string | null>(null);

    const fetchBookings = React.useCallback(() => {
        const params: Record<string, string | number> = {
            page: currentPage,
            limit: pageSize
        };

        // Chỉ thêm sortBy và sortOrder nếu có giá trị
        if (sortBy && sortOrder) {
            params.sortBy = sortBy;
            params.sortOrder = sortOrder;
        }

        if (statusFilter !== 'all') {
            params.status = statusFilter;
        }

        if (dateRange && dateRange[0] && dateRange[1]) {
            params.startDate = dateRange[0].format('YYYY-MM-DD');
            params.endDate = dateRange[1].format('YYYY-MM-DD');
        }

        dispatch(fetchMyBookings(params));
    }, [currentPage, pageSize, statusFilter, sortBy, sortOrder, dateRange, dispatch]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Handler functions
    const handlePageChange = (page: number, size?: number) => {
        setCurrentPage(page);
        if (size) {
            setPageSize(size);
        }
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handleSortChange = (value: string) => {
        if (value === 'none') {
            setSortBy('');
            setSortOrder('');
        } else {
            const [newSortBy, newSortOrder] = value.split('-');
            setSortBy(newSortBy);
            setSortOrder(newSortOrder as 'asc' | 'desc');
        }
        setCurrentPage(1);
    };

    const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
        setDateRange(dates);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setStatusFilter('all');
        setDateRange(null);
        setSortBy('');
        setSortOrder('');
        setCurrentPage(1);
    };


    // Calculate statistics
    const stats = {
        total: myBookings.length,
        confirmed: myBookings.filter(b => b.status === 'confirmed').length,
        inProgress: myBookings.filter(b => ['in_progress', 'maintenance_in_progress'].includes(b.status)).length,
        completed: myBookings.filter(b => b.status === 'completed').length,
        cancelled: myBookings.filter(b => b.status === 'cancelled').length
    };

    const fetchBookingDetails = async (bookingId: string) => {
        try {
            const response = await axiosInstance.get(BOOKING_DETAILS_ENDPOINT(bookingId));
            setSelectedBooking(response.data.data);
            setIsModalOpen(true);
        } catch (err) {
            const error = err as Error;
            message.error(error.message || "Failed to fetch booking details");
        }
    };

    const openProgressModal = async (appointmentId: string) => {
        setProgressModalOpen(true);
        setProgressLoading(true);
        setProgressData(null);
        try {
            const res = await axiosInstance.get(APPOINTMENT_PROGRESS_ENDPOINT(appointmentId));
            const data = res.data;
            if (data?.success) {
                setProgressData(data.data);
            } else {
                setProgressData({ notFound: true, message: data?.message || "Progress record not found for this appointment" });
            }
        } catch (e) {
            setProgressData({ notFound: true, message: "Progress record not found for this appointment" });
        } finally {
            setProgressLoading(false);
        }
    };

    const closeProgressModal = () => {
        setProgressModalOpen(false);
        setProgressData(null);
        setQuoteResponseNotes("");
    };

    const submitQuoteResponse = async (status: "approved" | "rejected") => {
        if (!progressData?._id) return;
        try {
            setProgressLoading(true);
            const res = await axiosInstance.put(TECHNICIAN_PROGRESS_QUOTE_RESPONSE_ENDPOINT(progressData._id as string), {
                status,
                notes: quoteResponseNotes,
            });
            if (res.data?.success) {
                setProgressData(res.data.data);
                // reload bookings to reflect status change if server updates appointment status
                await fetchBookings();
                message.success(status === "approved" ? "Approved quote successfully" : "Rejected quote successfully");
                // Close the progress modal after successful action
                closeProgressModal();
            } else {
                message.error("Update failed");
            }
        } catch (e) {
            message.error("Update failed");
        } finally {
            setProgressLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBooking(null);
    };

    const openReschedule = async (booking: Booking) => {
        try {
            setRescheduleError(null);
            const detailRes = await axiosInstance.get(BOOKING_DETAILS_ENDPOINT(booking._id));
            const detail = detailRes.data?.data || booking;
            setSelectedBooking(detail);
            const initialDate = (detail.appointmentTime?.date || booking.appointmentTime.date || "").substring(0, 10);
            setNewDate(initialDate);
            setSelectedSlot("");
            setIsRescheduleOpen(true);
        } catch (err) {
            const error = err as any;
            message.error(error.response?.data?.message || error.message || "Failed to load appointment details");
        }
    };

    const closeReschedule = () => {
        setIsRescheduleOpen(false);
        setSelectedBooking(null);
        setNewDate("");
        setSelectedSlot("");
        setAvailableSlots([]);
        setRescheduleError(null);
    };

    const submitReschedule = async () => {
        if (!selectedBooking) return;

        if (!newDate) {
            setRescheduleError("Please select a new date");
            return;
        }
        if (!selectedSlot) {
            setRescheduleError("Please select a new time slot");
            return;
        }

        setRescheduleError(null);
        try {
            await dispatch(rescheduleBooking({
                bookingId: selectedBooking._id,
                appointmentDate: newDate,
                appointmentTime: selectedSlot,
            }) as any);
            await fetchBookings();
            closeReschedule();
        } catch (err) {
            const error = err as any;
            message.error(error.response?.data?.message || error.message || "Rescheduling failed");
        }
    };

    const openCancel = (booking: Booking) => {
        setSelectedBooking(booking);
        setCancelReason("");
        setIsCancelOpen(true);
    };

    const closeCancel = () => {
        setIsCancelOpen(false);
        setSelectedBooking(null);
        setCancelReason("");
    };

    const submitCancel = async () => {
        if (!selectedBooking) return;
        try {
            await dispatch(cancelBooking({ bookingId: selectedBooking._id, reason: cancelReason }) as any);
            await fetchBookings();
            closeCancel();
        } catch (err) {
            const error = err as any;
            message.error(error.response?.data?.message || error.message || "Cancellation failed");
        }
    };

    useEffect(() => {
        const loadSlots = async () => {
            try {
                if (!isRescheduleOpen || !newDate || !selectedBooking) return;
                const serviceCenterId = (selectedBooking as any)?.serviceCenter?._id || (selectedBooking as any)?.serviceCenterId;
                if (!serviceCenterId) return;
                setLoadingSlots(true);
                const res = await axiosInstance.get(BOOKING_TIME_SLOTS_ENDPOINT(serviceCenterId, newDate));
                const slots = res.data?.data?.availableSlots || [];
                setAvailableSlots(slots);
                setSelectedSlot("");
            } catch (err) {
                const error = err as any;
                message.error(error.response?.data?.message || error.message || "Failed to load available time slots");
            } finally {
                setLoadingSlots(false);
            }
        };
        loadSlots();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newDate, isRescheduleOpen]);

    const getStatusTag = (status: string) => {
        const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
            "pending_confirmation": { color: "orange", icon: <ClockCircleOutlined /> },
            "confirmed": { color: "blue", icon: <CheckCircleOutlined /> },
            "in_progress": { color: "processing", icon: <ClockCircleOutlined /> },
            "inspection_completed": { color: "purple", icon: <InfoCircleOutlined /> },
            "quote_provided": { color: "cyan", icon: <TagOutlined /> },
            "quote_approved": { color: "green", icon: <CheckCircleOutlined /> },
            "quote_rejected": { color: "red", icon: <CloseOutlined /> },
            "maintenance_in_progress": { color: "blue", icon: <ClockCircleOutlined /> },
            "maintenance_completed": { color: "green", icon: <CheckCircleOutlined /> },
            "payment_pending": { color: "orange", icon: <ClockCircleOutlined /> },
            "completed": { color: "success", icon: <CheckCircleOutlined /> },
            "cancelled": { color: "error", icon: <CloseOutlined /> },
            "rescheduled": { color: "warning", icon: <EditOutlined /> },
            "no_show": { color: "default", icon: <ExclamationCircleOutlined /> },
        };

        const config = statusConfig[status] || { color: "default", icon: <InfoCircleOutlined /> };
        const displayStatus = status.replace(/_/g, ' ').toUpperCase();

        return (
            <Tag color={config.color} icon={config.icon}>
                {displayStatus}
            </Tag>
        );
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            weekday: 'short'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const formatTime = (timeString: string) => {
        if (!timeString) return "N/A";
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${period}`;
    };

    // Table columns definition
    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            render: (_: Record<string, any>, __: Record<string, any>, index: number) => (
                <div className="text-center font-medium text-gray-600">
                    {(currentPage - 1) * pageSize + index + 1}
                </div>
            ),
        },
        {
            title: 'Ngày hẹn',
            dataIndex: ['appointmentTime', 'date'],
            key: 'date',
            width: 120,
            sorter: true,
            render: (date: string) => (
                <div>
                    <div className="font-medium text-gray-900">
                        {dayjs(date).format('DD/MM/YYYY')}
                    </div>
                    <div className="text-xs text-gray-500">
                        {dayjs(date).format('ddd')}
                    </div>
                </div>
            ),
        },
        {
            title: 'Dịch vụ',
            key: 'service',
            width: 150,
            render: (record: Booking) => {
                const serviceName = record.serviceDetails?.isInspectionOnly
                    ? "Đang chọn dịch vụ mang xe tới kiểm tra"
                    : (record.serviceType?.name || 'N/A');

                return (
                    <div>
                        <div className="font-medium text-gray-900">
                            {serviceName}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                            <EnvironmentOutlined className="mr-1" />
                            {record.serviceCenter?.name || 'N/A'}
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Thời gian',
            key: 'time',
            width: 120,
            render: (record: Booking) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-900">
                        {record.appointmentTime?.startTime && record.appointmentTime?.endTime
                            ? `${formatTime(record.appointmentTime.startTime)} - ${formatTime(record.appointmentTime.endTime)}`
                            : "N/A"}
                    </div>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (status: string) => getStatusTag(status),
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 200,
            fixed: 'right' as const,
            render: (record: Booking) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => fetchBookingDetails(record._id)}
                        />
                    </Tooltip>
                    <Tooltip title="Xem tiến độ">
                        <Button
                            type="text"
                            size="small"
                            icon={<InfoCircleOutlined />}
                            onClick={() => openProgressModal(record._id)}
                        />
                    </Tooltip>
                    {canRescheduleBooking(record.status) && (
                        <Tooltip title="Đổi lịch">
                            <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => openReschedule(record)}
                            />
                        </Tooltip>
                    )}
                    {canCancelBooking(record.status) && (
                        <Tooltip title="Hủy lịch">
                            <Button
                                type="text"
                                size="small"
                                danger
                                icon={<CloseOutlined />}
                                onClick={() => openCancel(record)}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    const canCancelBooking = (status: string) => {
        return status !== "cancelled" && status !== "completed" && status !== "confirmed";
    };

    const canRescheduleBooking = (status: string) => {
        return status !== "cancelled" && status !== "completed";
    };


    return (
        <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            {/* Header */}
            <Card className="mb-6" style={{ background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)', color: 'white', border: 'none' }}>
                <div className="flex items-center justify-between">
                    <div>
                        <Title level={2} style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <HistoryOutlined style={{ fontSize: '32px' }} />
                            Lịch sử đặt lịch
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginTop: '8px' }}>
                            Xem và quản lý lịch sử đặt lịch của bạn
                        </Text>
                    </div>
                    <Button
                        type="primary"
                        ghost
                        icon={<ReloadOutlined />}
                        onClick={fetchBookings}
                        loading={loading}
                        size="large"
                    >
                        Làm mới
                    </Button>
                </div>
            </Card>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={4}>
                    <Card>
                        <Statistic
                            title="Tổng số lịch"
                            value={stats.total}
                            prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={4}>
                    <Card>
                        <Statistic
                            title="Đã xác nhận"
                            value={stats.confirmed}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={4}>
                    <Card>
                        <Statistic
                            title="Đang thực hiện"
                            value={stats.inProgress}
                            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={4}>
                    <Card>
                        <Statistic
                            title="Hoàn thành"
                            value={stats.completed}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={4}>
                    <Card>
                        <Statistic
                            title="Đã hủy"
                            value={stats.cancelled}
                            prefix={<CloseOutlined style={{ color: '#ff4d4f' }} />}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card className="mb-6">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={6}>
                        <div className="flex items-center gap-2 mb-2">
                            <FilterOutlined style={{ color: '#8c8c8c' }} />
                            <Text strong>Bộ lọc:</Text>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Select
                            placeholder="Trạng thái"
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
                            style={{ width: '100%' }}
                            allowClear
                        >
                            <Option value="all">Tất cả</Option>
                            <Option value="pending_confirmation">Chờ xác nhận</Option>
                            <Option value="confirmed">Đã xác nhận</Option>
                            <Option value="in_progress">Đang thực hiện</Option>
                            <Option value="inspection_completed">Hoàn thành kiểm tra</Option>
                            <Option value="quote_provided">Đã báo giá</Option>
                            <Option value="quote_approved">Đã duyệt giá</Option>
                            <Option value="quote_rejected">Từ chối giá</Option>
                            <Option value="maintenance_in_progress">Đang bảo trì</Option>
                            <Option value="maintenance_completed">Hoàn thành bảo trì</Option>
                            <Option value="payment_pending">Chờ thanh toán</Option>
                            <Option value="completed">Hoàn thành</Option>
                            <Option value="cancelled">Đã hủy</Option>
                            <Option value="rescheduled">Đã đổi lịch</Option>
                            <Option value="no_show">Không đến</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <RangePicker
                            style={{ width: '100%' }}
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            placeholder={['Từ ngày', 'Đến ngày']}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Select
                            placeholder="Sắp xếp"
                            value={sortBy && sortOrder ? `${sortBy}-${sortOrder}` : 'none'}
                            onChange={handleSortChange}
                            style={{ width: '100%' }}
                        >
                            <Option value="none">Không sắp xếp</Option>
                            <Option value="appointmentTime.date-desc">Mới nhất</Option>
                            <Option value="appointmentTime.date-asc">Cũ nhất</Option>
                            <Option value="createdAt-desc">Tạo gần đây</Option>
                            <Option value="createdAt-asc">Tạo xa nhất</Option>
                            <Option value="status-asc">Trạng thái A-Z</Option>
                            <Option value="status-desc">Trạng thái Z-A</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Space>
                            <Button onClick={clearFilters} icon={<FilterOutlined />}>
                                Xóa bộ lọc
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Error State */}
            {error && (
                <Card className="mb-6" style={{ borderLeft: '4px solid #ff4d4f' }}>
                    <div className="flex items-center">
                        <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px', marginRight: '12px' }} />
                        <div>
                            <Text strong style={{ color: '#ff4d4f' }}>Lỗi tải dữ liệu</Text>
                            <div>
                                <Text type="secondary">{error}</Text>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Bookings Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={myBookings}
                    loading={loading}
                    rowKey="_id"
                    scroll={{ x: 1000 }}
                    pagination={{
                        current: currentPage,
                        total: myBookings.length,
                        pageSize: pageSize,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} kết quả`,
                        onChange: handlePageChange,
                        onShowSizeChange: handlePageChange,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        responsive: true,
                    }}
                    locale={{
                        emptyText: (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="Không có dữ liệu đặt lịch"
                            />
                        ),
                    }}
                />
            </Card>

            {/* Booking Details Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <InfoCircleOutlined />
                        Chi tiết lịch hẹn
                    </div>
                }
                open={isModalOpen}
                onCancel={closeModal}
                footer={[
                    <Button key="close" onClick={closeModal}>
                        Đóng
                    </Button>
                ]}
                width={600}
            >
                {selectedBooking && (
                    <div className="space-y-4">
                        {[
                            { icon: <CalendarOutlined />, label: "Ngày hẹn", value: formatDate(selectedBooking.appointmentTime.date) },
                            {
                                icon: <ClockCircleOutlined />, label: "Thời gian", value: selectedBooking.appointmentTime?.startTime && selectedBooking.appointmentTime?.endTime
                                    ? `${formatTime(selectedBooking.appointmentTime.startTime)} - ${formatTime(selectedBooking.appointmentTime.endTime)}`
                                    : "N/A"
                            },
                            {
                                icon: <InfoCircleOutlined />,
                                label: "Dịch vụ",
                                value: selectedBooking.serviceDetails?.isInspectionOnly
                                    ? "Đang chọn dịch vụ mang xe tới kiểm tra"
                                    : (selectedBooking.serviceType?.name || "N/A")
                            },
                            { icon: <EnvironmentOutlined />, label: "Trung tâm", value: selectedBooking.serviceCenter?.name || "N/A" },
                            { icon: <CheckCircleOutlined />, label: "Trạng thái", value: getStatusTag(selectedBooking.status), status: true },
                            { icon: <EditOutlined />, label: "Mô tả", value: selectedBooking.serviceDetails?.description || "N/A" }
                        ].map((item, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="text-blue-600 mt-1">{item.icon}</div>
                                <div className="flex-1">
                                    <Text type="secondary" className="block text-sm">{item.label}</Text>
                                    {item.status ? (
                                        item.value
                                    ) : (
                                        <Text strong className="block">{item.value}</Text>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
            {/* Progress Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <InfoCircleOutlined />
                        Tiến độ lịch hẹn
                    </div>
                }
                open={progressModalOpen}
                onCancel={closeProgressModal}
                footer={null}
                width={800}
            >
                {progressLoading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Spin size="large" />
                        <Text className="mt-4">Đang tải dữ liệu...</Text>
                    </div>
                ) : progressData?.notFound ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                        <Text className="text-yellow-800">{String(progressData?.message || "Không tìm thấy bản ghi tiến độ cho lịch hẹn này")}</Text>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {(() => {
                            const iq = (progressData?.appointmentId as any)?.inspectionAndQuote || (progressData as any)?.inspectionAndQuote || (progressData as any)?.quote || {};
                            const formatCurrency = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v || 0));
                            return (
                                <Card title="Thông tin kiểm tra & báo giá" className="mb-4">
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} md={12}>
                                            <Text type="secondary" className="block text-xs">Ghi chú kiểm tra</Text>
                                            <Text className="block">{iq.inspectionNotes || '-'}</Text>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Text type="secondary" className="block text-xs">Hoàn thành kiểm tra lúc</Text>
                                            <Text className="block">{iq.inspectionCompletedAt ? new Date(iq.inspectionCompletedAt).toLocaleString() : '-'}</Text>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Text type="secondary" className="block text-xs">Tình trạng xe</Text>
                                            <Text className="block">{iq.vehicleCondition || '-'}</Text>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Text type="secondary" className="block text-xs">Chi tiết chẩn đoán</Text>
                                            <Text className="block">{iq.diagnosisDetails || '-'}</Text>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Text type="secondary" className="block text-xs">Số tiền báo giá</Text>
                                            <Text strong className="block text-blue-600">{iq.quoteAmount ? formatCurrency(iq.quoteAmount) : '-'}</Text>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Text type="secondary" className="block text-xs">Trạng thái báo giá</Text>
                                            <Tag color="blue">{(iq.quoteStatus || 'pending').replaceAll('_', ' ')}</Tag>
                                        </Col>
                                    </Row>
                                    <Divider />
                                    <div>
                                        <Text type="secondary" className="block text-xs mb-2">Chi tiết báo giá</Text>
                                        <Text className="block">{iq.quoteDetails || '-'}</Text>
                                    </div>
                                </Card>
                            );
                        })()}

                        <Row gutter={[16, 16]} className="mb-4">
                            <Col xs={24} md={12}>
                                <Card size="small">
                                    <Statistic
                                        title="Trạng thái hiện tại"
                                        value={((progressData as any)?.currentStatus || "").replaceAll("_", " ")}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} md={12}>
                                <Card size="small">
                                    <Statistic
                                        title="Trạng thái báo giá"
                                        value={(progressData as any)?.appointmentId?.inspectionAndQuote?.quoteStatus || (progressData as any)?.quote?.quoteStatus || "pending"}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {Array.isArray(progressData?.milestones) && progressData.milestones.length > 0 && (
                            <Card title="Các mốc tiến độ" className="mb-4">
                                <ul className="list-disc list-inside space-y-2">
                                    {progressData.milestones.map((m: Record<string, any>) => (
                                        <li key={m._id || m.name}>
                                            <Text strong>{m.name}:</Text> {m.description} {m.status && <Tag>{m.status}</Tag>}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        <Card title="Phản hồi báo giá">
                            <TextArea
                                rows={3}
                                placeholder="Ghi chú của bạn (tùy chọn)"
                                value={quoteResponseNotes}
                                onChange={(e) => setQuoteResponseNotes(e.target.value)}
                                className="mb-4"
                            />
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<CheckCircleOutlined />}
                                    onClick={() => submitQuoteResponse("approved")}
                                    loading={progressLoading}
                                >
                                    Chấp nhận
                                </Button>
                                <Button
                                    danger
                                    icon={<CloseOutlined />}
                                    onClick={() => submitQuoteResponse("rejected")}
                                    loading={progressLoading}
                                >
                                    Từ chối
                                </Button>
                            </Space>
                        </Card>
                    </div>
                )}
            </Modal>

            {/* Reschedule Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <EditOutlined />
                        Đổi lịch hẹn
                    </div>
                }
                open={isRescheduleOpen}
                onCancel={closeReschedule}
                footer={[
                    <Button key="cancel" onClick={closeReschedule}>
                        Hủy
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={submitReschedule}
                        loading={loading}
                    >
                        Xác nhận
                    </Button>
                ]}
                width={500}
            >
                <div className="space-y-4">
                    <div>
                        <Text strong className="block mb-2">
                            <CalendarOutlined />
                            Ngày mới
                        </Text>
                        <DatePicker
                            style={{ width: '100%' }}
                            value={newDate ? dayjs(newDate) : null}
                            onChange={(date) => setNewDate(date ? date.format('YYYY-MM-DD') : '')}
                        />
                    </div>

                    <div>
                        <Text strong className="block mb-2">
                            <ClockCircleOutlined />
                            Khung giờ mới
                        </Text>
                        <Select
                            style={{ width: '100%' }}
                            placeholder={loadingSlots ? "Đang tải khung giờ..." : "Chọn khung giờ"}
                            value={selectedSlot}
                            onChange={setSelectedSlot}
                            loading={loadingSlots}
                        >
                            {availableSlots.map((slot, idx) => (
                                <Option key={`${slot.startTime}-${idx}`} value={slot.startTime}>
                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </Option>
                            ))}
                        </Select>
                        {(!loadingSlots && availableSlots.length === 0 && newDate) && (
                            <Text type="secondary" className="block mt-2">
                                <InfoCircleOutlined />
                                Không có khung giờ trống cho ngày đã chọn.
                            </Text>
                        )}
                    </div>

                    {rescheduleError && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                            <div className="flex items-center">
                                <ExclamationCircleOutlined className="text-red-500 mr-3" />
                                <Text className="text-red-700">{rescheduleError}</Text>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Cancel Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <CloseOutlined />
                        Hủy lịch hẹn
                    </div>
                }
                open={isCancelOpen}
                onCancel={closeCancel}
                footer={[
                    <Button key="cancel" onClick={closeCancel}>
                        Hủy
                    </Button>,
                    <Button
                        key="submit"
                        danger
                        icon={<CloseOutlined />}
                        onClick={submitCancel}
                        loading={loading}
                    >
                        Xác nhận hủy
                    </Button>
                ]}
                width={500}
            >
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <ExclamationCircleOutlined className="text-red-500 text-xl" />
                            <div>
                                <Text strong className="text-red-800 block">Cảnh báo</Text>
                                <Text className="text-red-700">Hành động này không thể hoàn tác. Lịch hẹn của bạn sẽ bị hủy.</Text>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Text strong className="block mb-2">
                            <EditOutlined />
                            Lý do hủy (tùy chọn)
                        </Text>
                        <TextArea
                            rows={3}
                            placeholder="Lý do hủy lịch hẹn là gì?"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default BookingHistory;