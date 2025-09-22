import React, { useState, useEffect, useCallback } from "react";
import {
    Card,
    Table,
    Button,
    DatePicker,
    Select,
    Row,
    Col,
    Space,
    Tag,
    Modal,
    message,
    Pagination,
    Typography,
    Divider,
} from "antd";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    UserOutlined,
    CarOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../services/store/store";
import {
    fetchAwaitingConfirmationBookings,
    confirmBooking,
} from "../../services/features/booking/bookingSlice";
import { fetchServiceCenters } from "../../services/features/serviceCenter/serviceCenterSlice";
import {
    AwaitingConfirmationBooking,
    AwaitingConfirmationQueryParams,
} from "../../interfaces/booking";
import { ServiceCenter } from "../../interfaces/serviceCenter";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const BookingManagePages: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        awaitingConfirmationBookings,
        awaitingConfirmationPagination,
        awaitingConfirmationLoading,
        confirmBookingLoading,
    } = useAppSelector((state) => state.booking);
    const { serviceCenters } = useAppSelector((state) => state.serviceCenter);

    // State for filters
    const [selectedServiceCenter, setSelectedServiceCenter] = useState<string>("");
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
        dayjs().subtract(30, "day"),
        dayjs(),
    ]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // Modal state
    const [selectedBooking, setSelectedBooking] = useState<AwaitingConfirmationBooking | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);

    const fetchBookings = useCallback(() => {
        if (!selectedServiceCenter || !dateRange) return;

        const params: AwaitingConfirmationQueryParams = {
            serviceCenterId: selectedServiceCenter,
            dateFrom: dateRange[0].format("YYYY-MM-DD"),
            dateTo: dateRange[1].format("YYYY-MM-DD"),
            page: currentPage,
            limit: pageSize,
            sortBy,
            sortOrder,
        };

        dispatch(fetchAwaitingConfirmationBookings(params));
    }, [selectedServiceCenter, dateRange, currentPage, pageSize, sortBy, sortOrder, dispatch]);

    useEffect(() => {
        // Fetch service centers on component mount
        dispatch(fetchServiceCenters({ page: 1, limit: 1000 }));
    }, [dispatch]);

    // Auto-select first service center when service centers are loaded
    useEffect(() => {
        if (serviceCenters.length > 0 && !selectedServiceCenter) {
            setSelectedServiceCenter(serviceCenters[0]._id);
        }
    }, [serviceCenters, selectedServiceCenter]);

    useEffect(() => {
        // Fetch awaiting confirmation bookings when filters change
        if (selectedServiceCenter && dateRange) {
            fetchBookings();
        }
    }, [fetchBookings, selectedServiceCenter, dateRange]);

    const handleConfirmBooking = async (bookingId: string) => {
        try {
            await dispatch(confirmBooking(bookingId)).unwrap();
            message.success("Đã xác nhận booking thành công!");
            setConfirmModalVisible(false);
            setSelectedBooking(null);
            // Refresh the list
            fetchBookings();
        } catch {
            message.error("Có lỗi xảy ra khi xác nhận booking!");
        }
    };

    const openDetailModal = (booking: AwaitingConfirmationBooking) => {
        setSelectedBooking(booking);
        setDetailModalVisible(true);
    };

    const openConfirmModal = (booking: AwaitingConfirmationBooking) => {
        setSelectedBooking(booking);
        setConfirmModalVisible(true);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "paid":
                return "blue";
            case "confirmed":
                return "green";
            case "cancelled":
                return "red";
            default:
                return "default";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case "critical":
                return "red";
            case "high":
                return "orange";
            case "medium":
                return "blue";
            case "low":
                return "green";
            default:
                return "default";
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return dayjs(dateString).format("DD/MM/YYYY");
    };

    const formatDateTime = (dateString: string) => {
        return dayjs(dateString).format("DD/MM/YYYY HH:mm");
    };

    const columns = [
        {
            title: "Khách hàng",
            key: "customer",
            render: (record: AwaitingConfirmationBooking) => {
                const customer = typeof record.customer === 'string'
                    ? { fullName: 'N/A', email: 'N/A', phone: 'N/A' }
                    : record.customer;
                return (
                    <div>
                        <div className="font-medium">{customer.fullName}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                    </div>
                );
            },
        },
        {
            title: "Xe",
            key: "vehicle",
            render: (record: AwaitingConfirmationBooking) => {
                const vehicle = typeof record.vehicle === 'string'
                    ? { vehicleInfo: { licensePlate: 'N/A', year: 'N/A', color: 'N/A' } }
                    : record.vehicle;
                return (
                    <div>
                        <div className="font-medium">
                            {vehicle.vehicleInfo.licensePlate}
                        </div>
                        <div className="text-sm text-gray-500">
                            Năm: {vehicle.vehicleInfo.year} • Màu: {vehicle.vehicleInfo.color}
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Dịch vụ",
            key: "service",
            render: (record: AwaitingConfirmationBooking) => {
                const serviceType = typeof record.serviceType === 'string'
                    ? { name: 'N/A', pricing: { basePrice: 0 } }
                    : record.serviceType;
                return (
                    <div>
                        <div className="font-medium">{serviceType.name}</div>
                        <div className="text-sm text-gray-500">{record.serviceDetails.description}</div>
                        <div className="text-sm font-medium text-green-600">
                            {formatCurrency(serviceType.pricing.basePrice)}
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Thời gian hẹn",
            key: "appointment",
            render: (record: AwaitingConfirmationBooking) => (
                <div>
                    <div className="font-medium">{formatDate(record.appointmentTime.date)}</div>
                    <div className="text-sm text-gray-500">
                        {record.appointmentTime.startTime} - {record.appointmentTime.endTime}
                    </div>
                </div>
            ),
        },
        {
            title: "Thanh toán",
            key: "payment",
            render: (record: AwaitingConfirmationBooking) => (
                <div>
                    <Tag color={getStatusColor(record.payment.status)}>
                        {record.payment.status.toUpperCase()}
                    </Tag>
                    <div className="text-sm font-medium text-green-600 mt-1">
                        {formatCurrency(record.payment.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                        {formatDateTime(record.payment.paidAt)}
                    </div>
                    <div className="text-xs text-gray-500">
                        {record.payment.method}
                    </div>
                </div>
            ),
        },
        {
            title: "Ưu tiên",
            key: "priority",
            render: (record: AwaitingConfirmationBooking) => (
                <Tag color={getPriorityColor(record.serviceDetails.priority)}>
                    {record.serviceDetails.priority.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (record: AwaitingConfirmationBooking) => (
                <Space>
                    <Button
                        size="small"
                        onClick={() => openDetailModal(record)}
                        icon={<UserOutlined />}
                    >
                        Chi tiết
                    </Button>
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => openConfirmModal(record)}
                        icon={<CheckCircleOutlined />}
                        loading={confirmBookingLoading}
                    >
                        Xác nhận
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <Title level={2}>Quản lý Booking Chờ Xác Nhận</Title>
                <Text type="secondary">
                    Quản lý các booking đã thanh toán và chờ xác nhận từ admin
                </Text>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={6}>
                        <div>
                            <Text strong>Trung tâm dịch vụ:</Text>
                            <Select
                                placeholder="Chọn trung tâm"
                                style={{ width: "100%", marginTop: 8 }}
                                value={selectedServiceCenter}
                                onChange={setSelectedServiceCenter}
                                showSearch
                                optionFilterProp="children"
                            >
                                {serviceCenters.map((center: ServiceCenter) => (
                                    <Option key={center._id} value={center._id}>
                                        {center.name}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div>
                            <Text strong>Khoảng thời gian:</Text>
                            <RangePicker
                                style={{ width: "100%", marginTop: 8 }}
                                value={dateRange}
                                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                                format="DD/MM/YYYY"
                            />
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <div>
                            <Text strong>Sắp xếp theo:</Text>
                            <Select
                                style={{ width: "100%", marginTop: 8 }}
                                value={sortBy}
                                onChange={setSortBy}
                            >
                                <Option value="createdAt">Ngày tạo</Option>
                                <Option value="appointmentTime">Thời gian hẹn</Option>
                                <Option value="payment.amount">Số tiền</Option>
                            </Select>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <div>
                            <Text strong>Thứ tự:</Text>
                            <Select
                                style={{ width: "100%", marginTop: 8 }}
                                value={sortOrder}
                                onChange={setSortOrder}
                            >
                                <Option value="desc">Giảm dần</Option>
                                <Option value="asc">Tăng dần</Option>
                            </Select>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Button
                            type="primary"
                            onClick={fetchBookings}
                            loading={awaitingConfirmationLoading}
                            style={{ marginTop: 32 }}
                        >
                            Tải lại
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={awaitingConfirmationBookings}
                    rowKey="_id"
                    loading={awaitingConfirmationLoading}
                    pagination={false}
                    scroll={{ x: 1200 }}
                />

                {awaitingConfirmationPagination && (
                    <div className="mt-4 flex justify-between items-center">
                        <Text type="secondary">
                            Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, awaitingConfirmationPagination.totalItems)}
                            trong tổng số {awaitingConfirmationPagination.totalItems} kết quả
                        </Text>
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={awaitingConfirmationPagination.totalItems}
                            onChange={(page, size) => {
                                setCurrentPage(page);
                                if (size) setPageSize(size);
                            }}
                            showSizeChanger
                            showQuickJumper
                            showTotal={(total, range) => `${range[0]}-${range[1]} của ${total}`}
                        />
                    </div>
                )}
            </Card>

            {/* Booking Detail Modal */}
            <Modal
                title="Chi tiết Booking"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>,
                ]}
                width={800}
            >
                {selectedBooking && (
                    <div className="space-y-4">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Card size="small" title="Thông tin khách hàng">
                                    <Space direction="vertical" className="w-full">
                                        <div><UserOutlined /> {typeof selectedBooking.customer === 'string' ? 'N/A' : selectedBooking.customer.fullName}</div>
                                        <div><MailOutlined /> {typeof selectedBooking.customer === 'string' ? 'N/A' : selectedBooking.customer.email}</div>
                                        <div><PhoneOutlined /> {typeof selectedBooking.customer === 'string' ? 'N/A' : selectedBooking.customer.phone}</div>
                                    </Space>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small" title="Thông tin xe">
                                    <Space direction="vertical" className="w-full">
                                        <div><CarOutlined /> {typeof selectedBooking.vehicle === 'string' ? 'N/A' : selectedBooking.vehicle.vehicleInfo.licensePlate}</div>
                                        <div>Năm: {typeof selectedBooking.vehicle === 'string' ? 'N/A' : selectedBooking.vehicle.vehicleInfo.year}</div>
                                        <div>Màu: {typeof selectedBooking.vehicle === 'string' ? 'N/A' : selectedBooking.vehicle.vehicleInfo.color}</div>
                                    </Space>
                                </Card>
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Card size="small" title="Dịch vụ">
                                    <Space direction="vertical" className="w-full">
                                        <div className="font-medium">{typeof selectedBooking.serviceType === 'string' ? 'N/A' : selectedBooking.serviceType.name}</div>
                                        <div>Mô tả: {selectedBooking.serviceDetails.description}</div>
                                        <div className="text-green-600 font-medium">
                                            <DollarOutlined /> {formatCurrency(typeof selectedBooking.serviceType === 'string' ? 0 : selectedBooking.serviceType.pricing.basePrice)}
                                        </div>
                                    </Space>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small" title="Lịch hẹn">
                                    <Space direction="vertical" className="w-full">
                                        <div><CalendarOutlined /> {formatDate(selectedBooking.appointmentTime.date)}</div>
                                        <div><ClockCircleOutlined /> {selectedBooking.appointmentTime.startTime} - {selectedBooking.appointmentTime.endTime}</div>
                                        <div>Trung tâm: {selectedBooking.serviceCenter.name}</div>
                                        <div><EnvironmentOutlined /> {selectedBooking.serviceCenter.address.street}, {selectedBooking.serviceCenter.address.ward}, {selectedBooking.serviceCenter.address.district}, {selectedBooking.serviceCenter.address.city}</div>
                                    </Space>
                                </Card>
                            </Col>
                        </Row>

                        <Card size="small" title="Mô tả dịch vụ">
                            <Text>{selectedBooking.serviceDetails.description}</Text>
                        </Card>

                        <Card size="small" title="Thông tin thanh toán">
                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    <div>Trạng thái: <Tag color={getStatusColor(selectedBooking.payment.status)}>{selectedBooking.payment.status.toUpperCase()}</Tag></div>
                                </Col>
                                <Col span={8}>
                                    <div>Số tiền: <Text className="text-green-600 font-medium">{formatCurrency(selectedBooking.payment.amount)}</Text></div>
                                </Col>
                                <Col span={8}>
                                    <div>Phương thức: {selectedBooking.payment.method}</div>
                                </Col>
                            </Row>
                            <div className="mt-2">
                                <Text type="secondary">Thời gian thanh toán: {formatDateTime(selectedBooking.payment.paidAt)}</Text>
                            </div>
                        </Card>
                    </div>
                )}
            </Modal>

            {/* Confirm Booking Modal */}
            <Modal
                title="Xác nhận Booking"
                open={confirmModalVisible}
                onOk={() => selectedBooking && handleConfirmBooking(selectedBooking._id)}
                onCancel={() => setConfirmModalVisible(false)}
                confirmLoading={confirmBookingLoading}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                {selectedBooking && (
                    <div>
                        <p>Bạn có chắc chắn muốn xác nhận booking này?</p>
                        <Divider />
                        <div className="space-y-2">
                            <div><strong>Khách hàng:</strong> {typeof selectedBooking.customer === 'string' ? 'N/A' : selectedBooking.customer.fullName}</div>
                            <div><strong>Xe:</strong> {typeof selectedBooking.vehicle === 'string' ? 'N/A' : selectedBooking.vehicle.vehicleInfo.licensePlate}</div>
                            <div><strong>Dịch vụ:</strong> {typeof selectedBooking.serviceType === 'string' ? 'N/A' : selectedBooking.serviceType.name}</div>
                            <div><strong>Thời gian:</strong> {formatDate(selectedBooking.appointmentTime.date)} {selectedBooking.appointmentTime.startTime}</div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default BookingManagePages;


