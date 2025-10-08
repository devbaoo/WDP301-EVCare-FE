import React, { useCallback, useEffect, useState } from "react";
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
    Pagination,
    Typography,
    List,
    Checkbox,
    message,
} from "antd";
import {
    CalendarOutlined,
    UserOutlined,
    CarOutlined,
    PhoneOutlined,
    MailOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../services/store/store";
import { fetchServiceCenters } from "../../services/features/serviceCenter/serviceCenterSlice";
import {
    AwaitingConfirmationBooking,
    AwaitingConfirmationQueryParams,
} from "../../interfaces/booking";
import { ServiceCenter } from "../../interfaces/serviceCenter";
import { fetchConfirmedBookings } from "../../services/features/booking/bookingSlice";
import { addAppointmentToSchedule, fetchTechnicianSchedules, fetchTechnicianSchedulesByCenter } from "../../services/features/technician/technicianSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../services/store/store";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const StaffTechnicianPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        confirmedBookings,
        confirmedBookingsPagination,
        confirmedBookingsLoading,
    } = useAppSelector((state) => state.booking);
    const { serviceCenters } = useAppSelector((state) => state.serviceCenter);
    const techLoading = useSelector((s: RootState) => s.technician.fetchSchedulesLoading);
    const techSchedules = useSelector((s: RootState) => s.technician.schedules);

    // Previously used to disable re-assignment; now allow multiple assignments -> keep for future analytics if needed

    const [selectedServiceCenter, setSelectedServiceCenter] = useState<string>("");
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
        dayjs().subtract(30, "day"),
        dayjs(),
    ]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

        dispatch(fetchConfirmedBookings(params));
    }, [selectedServiceCenter, dateRange, currentPage, pageSize, sortBy, sortOrder, dispatch]);

    useEffect(() => {
        dispatch(fetchServiceCenters({ page: 1, limit: 1000 }));
    }, [dispatch]);

    useEffect(() => {
        if (serviceCenters.length > 0 && !selectedServiceCenter) {
            setSelectedServiceCenter(serviceCenters[0]._id);
        }
    }, [serviceCenters, selectedServiceCenter]);

    useEffect(() => {
        if (selectedServiceCenter && dateRange) {
            fetchBookings();
        }
    }, [fetchBookings, selectedServiceCenter, dateRange]);

    // Keep technician schedules for the selected center loaded to know which bookings are already assigned
    useEffect(() => {
        if (selectedServiceCenter) {
            dispatch(fetchTechnicianSchedulesByCenter({ centerId: selectedServiceCenter }));
        }
    }, [dispatch, selectedServiceCenter]);

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

    const columns = [
        {
            title: "Khách hàng",
            key: "customer",
            render: (record: AwaitingConfirmationBooking) => {
                const customer =
                    typeof record.customer === "string"
                        ? { fullName: "N/A" }
                        : record.customer;
                return (
                    <div className="font-medium">{customer?.fullName || "N/A"}</div>
                );
            },
        },
        {
            title: "Xe",
            key: "vehicle",
            render: (record: AwaitingConfirmationBooking) => {
                const vehicle =
                    typeof record.vehicle === "string"
                        ? {
                            vehicleInfo: {
                                licensePlate: "N/A",
                                vehicleModel: { brand: "N/A", modelName: "N/A" }
                            }
                        }
                        : record.vehicle;
                return (
                    <div>
                        <div className="font-medium">{vehicle?.vehicleInfo?.licensePlate || "N/A"}</div>
                        <div className="text-sm text-gray-500">
                            {vehicle?.vehicleInfo?.vehicleModel?.brand || "N/A"} {vehicle?.vehicleInfo?.vehicleModel?.modelName || "N/A"}
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Dịch vụ",
            key: "service",
            render: (record: AwaitingConfirmationBooking) => {
                const serviceType =
                    typeof record.serviceType === "string"
                        ? { name: "N/A" }
                        : record.serviceType;
                return (
                    <div className="font-medium">{serviceType?.name || "N/A"}</div>
                );
            },
        },
        {
            title: "Thời gian hẹn",
            key: "appointment",
            render: (record: AwaitingConfirmationBooking) => (
                <div>
                    <div className="font-medium">
                        {dayjs(record.appointmentTime.date).format("DD/MM/YYYY")}
                    </div>
                    <div className="text-sm text-gray-500">
                        {record.appointmentTime.startTime} - {record.appointmentTime.endTime}
                    </div>
                </div>
            ),
        },
        {
            title: "Trạng thái",
            key: "status",
            render: (record: AwaitingConfirmationBooking) => (
                <div>
                    <Tag color={record.confirmation.isConfirmed ? "green" : "orange"}>
                        {record.confirmation.isConfirmed ? "ĐÃ XÁC NHẬN" : "CHỜ XÁC NHẬN"}
                    </Tag>
                    <div className="text-xs text-gray-500 mt-1">
                        <Tag color={getStatusColor(record.payment.status)}>
                            {record.payment.status.toUpperCase()}
                        </Tag>
                    </div>
                </div>
            ),
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (record: AwaitingConfirmationBooking) => (
                <Space>
                    <Button size="small" onClick={() => setDetailBooking(record)} icon={<UserOutlined />}>
                        Chi tiết
                    </Button>
                    <Button size="small" type="primary" onClick={() => openAssignModal(record)}>
                        Gán nhân viên
                    </Button>
                </Space>
            ),
        },
    ];

    const [detailBooking, setDetailBooking] = useState<AwaitingConfirmationBooking | null>(null);
    const [assignVisible, setAssignVisible] = useState(false);
    const [assignLoading, setAssignLoading] = useState(false);
    const [selectedScheduleIds, setSelectedScheduleIds] = useState<string[]>([]);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

    const openAssignModal = async (booking: AwaitingConfirmationBooking) => {
        const centerId = ((): string | undefined => {
            const sc = (booking as AwaitingConfirmationBooking).serviceCenter as AwaitingConfirmationBooking["serviceCenter"];
            if (sc && typeof sc === "object" && "_id" in sc) return sc._id as string;
            return selectedServiceCenter;
        })();
        const dateISO = booking.appointmentTime?.date;
        const workDate = dateISO ? dayjs(dateISO).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
        setAssignVisible(true);
        setSelectedAppointmentId(booking._id);
        setSelectedScheduleIds([]);
        dispatch(fetchTechnicianSchedules({ centerId, workDate, status: "working", availability: "available" }));
    };

    const handleAssign = async () => {
        if (!selectedAppointmentId || selectedScheduleIds.length === 0) return;
        setAssignLoading(true);
        try {
            await Promise.all(
                selectedScheduleIds.map((sid) =>
                    dispatch(addAppointmentToSchedule({ scheduleId: sid, appointmentId: selectedAppointmentId })).unwrap()
                )
            );
            message.success("Đã gán kỹ thuật viên cho booking");
            setAssignVisible(false);
            setSelectedScheduleIds([]);
            setSelectedAppointmentId(null);
            // Refresh list
            fetchBookings();
        } catch {
            message.error("Gán thất bại");
        } finally {
            setAssignLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Title level={2}>Danh sách Booking Đã Xác Nhận</Title>
                <Text type="secondary">Các lịch hẹn đã được xác nhận tại trung tâm</Text>
            </div>

            <Card className="mb-6">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={6}>
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
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Text strong>Khoảng thời gian:</Text>
                        <RangePicker
                            style={{ width: "100%", marginTop: 8 }}
                            value={dateRange}
                            onChange={(dates) =>
                                setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)
                            }
                            format="DD/MM/YYYY"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
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
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Text strong>Thứ tự:</Text>
                        <Select
                            style={{ width: "100%", marginTop: 8 }}
                            value={sortOrder}
                            onChange={setSortOrder}
                        >
                            <Option value="desc">Giảm dần</Option>
                            <Option value="asc">Tăng dần</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Button onClick={fetchBookings} loading={confirmedBookingsLoading} style={{ marginTop: 32 }}>
                            Tải lại
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Card>
                <Table
                    columns={columns}
                    dataSource={confirmedBookings}
                    rowKey="_id"
                    loading={confirmedBookingsLoading}
                    pagination={false}
                    scroll={{ x: 1200 }}
                />

                {confirmedBookingsPagination && (
                    <div className="mt-4 flex justify-between items-center">
                        <Text type="secondary">
                            Hiển thị {(currentPage - 1) * pageSize + 1} -
                            {" "}
                            {Math.min(currentPage * pageSize, confirmedBookingsPagination.totalItems)} trong tổng số {confirmedBookingsPagination.totalItems} kết quả
                        </Text>
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={confirmedBookingsPagination.totalItems}
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

            <Modal
                title="Chi tiết Booking"
                open={!!detailBooking}
                onCancel={() => setDetailBooking(null)}
                footer={<Button onClick={() => setDetailBooking(null)}>Đóng</Button>}
            >
                {detailBooking && (
                    <div className="space-y-2">
                        <div>
                            <UserOutlined /> {typeof detailBooking.customer === "string" ? "N/A" : detailBooking.customer.fullName}
                        </div>
                        <div>
                            <MailOutlined /> {typeof detailBooking.customer === "string" ? "N/A" : detailBooking.customer.email}
                        </div>
                        <div>
                            <PhoneOutlined /> {typeof detailBooking.customer === "string" ? "N/A" : detailBooking.customer.phone}
                        </div>
                        <div>
                            <CarOutlined /> {typeof detailBooking.vehicle === "string" ? "N/A" : detailBooking.vehicle.vehicleInfo.licensePlate}
                        </div>
                        <div>
                            <strong>Hãng:</strong> {typeof detailBooking.vehicle === "string" ? "N/A" : detailBooking.vehicle.vehicleInfo.vehicleModel?.brand || "N/A"}
                        </div>
                        <div>
                            <strong>Model:</strong> {typeof detailBooking.vehicle === "string" ? "N/A" : detailBooking.vehicle.vehicleInfo.vehicleModel?.modelName || "N/A"}
                        </div>
                        <div>
                            <CalendarOutlined /> {dayjs(detailBooking.appointmentTime.date).format("DD/MM/YYYY")} {detailBooking.appointmentTime.startTime}
                        </div>
                        <div>
                            <strong>Trạng thái xác nhận:</strong> <Tag color={detailBooking.confirmation.isConfirmed ? "green" : "orange"}>{detailBooking.confirmation.isConfirmed ? "ĐÃ XÁC NHẬN" : "CHỜ XÁC NHẬN"}</Tag>
                        </div>
                        {detailBooking.confirmation.isConfirmed && (
                            <>
                                <div>
                                    <strong>Phương thức xác nhận:</strong> {detailBooking.confirmation.confirmationMethod}
                                </div>
                                <div>
                                    <strong>Thời gian xác nhận:</strong> {dayjs(detailBooking.confirmation.confirmedAt).format("DD/MM/YYYY HH:mm")}
                                </div>

                            </>
                        )}
                    </div>
                )}
            </Modal>

            <Modal
                title="Gán nhân viên vào booking"
                open={assignVisible}
                onCancel={() => setAssignVisible(false)}
                footer={
                    <Space>
                        <Button onClick={() => setAssignVisible(false)}>Hủy</Button>
                        <Button type="primary" onClick={handleAssign} loading={assignLoading} disabled={selectedScheduleIds.length === 0}>
                            Gán {selectedScheduleIds.length > 1 ? `(${selectedScheduleIds.length})` : ''}
                        </Button>
                    </Space>
                }
            >
                {techLoading ? (
                    <div className="py-6">Đang tải...</div>
                ) : techSchedules.length === 0 ? (
                    <div className="py-6 text-gray-600">Hiện tại không có nhân viên phù hợp với booking.</div>
                ) : (
                    <List
                        dataSource={techSchedules}
                        renderItem={(item) => {
                            const checked = selectedScheduleIds.includes(item._id);
                            return (
                                <List.Item className="!px-0">
                                    <Checkbox
                                        checked={checked}
                                        onChange={(e) => {
                                            setSelectedScheduleIds((prev) =>
                                                e.target.checked
                                                    ? Array.from(new Set([...prev, item._id]))
                                                    : prev.filter((id) => id !== item._id)
                                            );
                                        }}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{item.technicianId.fullName || item.technicianId.email}</span>
                                            <span className="text-sm text-gray-500">Ca: {item.shiftStart} - {item.shiftEnd} • Trạng thái: {item.status}</span>
                                        </div>
                                    </Checkbox>
                                </List.Item>
                            );
                        }}
                    />
                )}
            </Modal>

        </div>
    );
};

export default StaffTechnicianPage;


