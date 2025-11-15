import React, { useCallback, useEffect, useState } from "react";
import {
    Card,
    Table,
    Button,
    Select,
    Row,
    Col,
    Space,
    Tag,
    Modal,
    Typography,
    Popconfirm,
    message,
    Tooltip,
    DatePicker,
    Form,
    Input,
    TimePicker,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    TeamOutlined,
    ScheduleOutlined,
    PlusOutlined,
    CalendarOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

// Extend dayjs with UTC plugin
dayjs.extend(utc);

import { useAppDispatch, useAppSelector } from "../../services/store/store";
import { fetchServiceCenters } from "../../services/features/serviceCenter/serviceCenterSlice";
import {
    fetchTechnicianStaff,
    fetchTechnicianSchedulesByCenter,
    updateSchedule,
    deleteSchedule,
    clearStaff,
    clearSchedules,
} from "../../services/features/technician/technicianSlice";
import {
    TechnicianStaff,
    TechnicianSchedule,
    UpdateSchedulePayload,
} from "../../interfaces/technician";
import { ServiceCenter } from "../../interfaces/serviceCenter";
import SingleScheduleModal from "../../components/Technician/SingleScheduleModal";
import MultipleScheduleModal from "../../components/Technician/MultipleScheduleModal";

const { Option } = Select;
const { Title, Text } = Typography;

// Helper function to parse work date correctly
const parseWorkDate = (dateString: string): dayjs.Dayjs => {
    if (dateString.includes('T') || dateString.includes('Z')) {
        // ISO date with time - parse as UTC then convert to local
        return dayjs.utc(dateString);
    } else {
        // Date only - parse as local date
        return dayjs(dateString);
    }
};

const StaffSchedulesTechnicianPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        technicianStaff,
        schedules,
        fetchStaffLoading,
        fetchSchedulesByCenterLoading,
        updateScheduleLoading,
        deleteScheduleLoading,
    } = useAppSelector((state) => state.technician);
    const { serviceCenters } = useAppSelector((state) => state.serviceCenter);

    const [selectedServiceCenter, setSelectedServiceCenter] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs());
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<TechnicianSchedule | null>(null);
    const [singleScheduleModalVisible, setSingleScheduleModalVisible] = useState(false);
    const [multipleScheduleModalVisible, setMultipleScheduleModalVisible] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState<TechnicianStaff | null>(null);

    const fetchSchedules = useCallback(() => {
        if (!selectedServiceCenter) return;

        // Ensure we're working with the correct date in local timezone
        let workDateParam: string | undefined;
        if (selectedDate) {
            // Use start of day in local timezone to avoid timezone conversion issues
            const localDate = selectedDate.startOf('day');
            workDateParam = localDate.format("YYYY-MM-DD");
        }

        const params = {
            centerId: selectedServiceCenter,
            workDate: workDateParam,
        };
        dispatch(fetchTechnicianSchedulesByCenter(params));
    }, [selectedServiceCenter, selectedDate, dispatch]);

    const fetchStaff = useCallback(() => {
        if (!selectedServiceCenter) return;
        dispatch(fetchTechnicianStaff(selectedServiceCenter));
    }, [selectedServiceCenter, dispatch]);

    useEffect(() => {
        dispatch(fetchServiceCenters({ page: 1, limit: 1000 }));
    }, [dispatch]);

    useEffect(() => {
        if (serviceCenters.length > 0 && !selectedServiceCenter) {
            setSelectedServiceCenter(serviceCenters[0]._id);
        }
    }, [serviceCenters, selectedServiceCenter]);

    useEffect(() => {
        if (selectedServiceCenter) {
            fetchStaff();
        }
    }, [fetchStaff, selectedServiceCenter]);

    useEffect(() => {
        if (selectedServiceCenter) {
            fetchSchedules();
        }
    }, [fetchSchedules, selectedServiceCenter]);



    const handleServiceCenterChange = (centerId: string) => {
        setSelectedServiceCenter(centerId);
        // Clear previous data
        dispatch(clearStaff());
        dispatch(clearSchedules());
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "scheduled":
                return "blue";
            case "working":
                return "orange";
            case "completed":
                return "green";
            case "absent":
                return "red";
            case "on_leave":
                return "purple";
            default:
                return "default";
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case "scheduled":
                return "Đã lên lịch";
            case "working":
                return "Đang làm việc";
            case "completed":
                return "Hoàn thành";
            case "absent":
                return "Vắng mặt";
            case "on_leave":
                return "Nghỉ phép";
            default:
                return status;
        }
    };

    const handleViewSchedule = (schedule: TechnicianSchedule) => {
        setSelectedSchedule(schedule);
        setViewModalVisible(true);
    };

    const handleEditSchedule = (schedule: TechnicianSchedule) => {
        setSelectedSchedule(schedule);
        setEditModalVisible(true);
    };

    const handleDeleteSchedule = async (scheduleId: string) => {
        try {
            await dispatch(deleteSchedule(scheduleId)).unwrap();
            message.success("Xóa lịch làm việc thành công!");
            fetchSchedules();
        } catch {
            message.error("Có lỗi xảy ra khi xóa lịch làm việc!");
        }
    };

    const handleUpdateSchedule = async (values: { workDate?: dayjs.Dayjs; shiftTime?: [dayjs.Dayjs, dayjs.Dayjs]; status?: string; notes?: string }) => {
        if (!selectedSchedule) return;

        try {
            const payload: UpdateSchedulePayload = {
                _id: selectedSchedule._id,
                workDate: values.workDate?.format("YYYY-MM-DD"),
                shiftStart: values.shiftTime?.[0]?.format("HH:mm"),
                shiftEnd: values.shiftTime?.[1]?.format("HH:mm"),
                status: values.status as "scheduled" | "working" | "completed" | "absent" | "on_leave",
                notes: values.notes,
            };

            await dispatch(updateSchedule(payload)).unwrap();
            message.success("Cập nhật lịch làm việc thành công!");
            setEditModalVisible(false);
            setSelectedSchedule(null);
            fetchSchedules();
        } catch {
            message.error("Có lỗi xảy ra khi cập nhật lịch làm việc!");
        }
    };

    const handleCreateSingleSchedule = (technician: TechnicianStaff) => {
        setSelectedTechnician(technician);
        setSingleScheduleModalVisible(true);
    };

    const handleCreateMultipleSchedules = (technician: TechnicianStaff) => {
        setSelectedTechnician(technician);
        setMultipleScheduleModalVisible(true);
    };

    const handleSingleScheduleModalSuccess = () => {
        setSingleScheduleModalVisible(false);
        setSelectedTechnician(null);
        fetchSchedules();
        fetchStaff();
    };

    const handleMultipleScheduleModalSuccess = () => {
        setMultipleScheduleModalVisible(false);
        setSelectedTechnician(null);
        fetchSchedules();
        fetchStaff();
    };

    const columns = [
        {
            title: "Kỹ thuật viên",
            key: "technician",
            render: (record: TechnicianSchedule) => (
                <div>
                    <div className="font-medium">
                        {record.technicianId.fullName || record.technicianId.email}
                    </div>
                    <div className="text-sm text-gray-500">
                        {record.technicianId.email}
                    </div>
                </div>
            ),
        },
        {
            title: "Ngày làm việc",
            key: "workDate",
            render: (record: TechnicianSchedule) => {
                const workDate = parseWorkDate(record.workDate);
                const formattedDate = workDate.format("DD/MM/YYYY");

                return (
                    <div>
                        <div className="font-medium">
                            {formattedDate}
                        </div>
                        <div className="text-sm text-gray-500">
                            {record.shiftStart} - {record.shiftEnd}
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Trung tâm",
            key: "center",
            render: (record: TechnicianSchedule) => (
                <div>
                    <div className="font-medium">{record.centerId.name}</div>
                    <div className="text-sm text-gray-500">
                        {record.centerId.address.ward}, {record.centerId.address.district}
                    </div>
                </div>
            ),
        },
        {
            title: "Trạng thái",
            key: "status",
            render: (record: TechnicianSchedule) => (
                <Tag color={getStatusColor(record.status)}>
                    {getStatusText(record.status)}
                </Tag>
            ),
        },
        {
            title: "Ghi chú",
            key: "notes",
            render: (record: TechnicianSchedule) => (
                <div className="max-w-xs">
                    <Text ellipsis={{ tooltip: record.notes }}>
                        {record.notes || "Không có"}
                    </Text>
                </div>
            ),
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (record: TechnicianSchedule) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="default"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewSchedule(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditSchedule(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa lịch làm việc"
                        description="Bạn có chắc chắn muốn xóa lịch làm việc này?"
                        onConfirm={() => handleDeleteSchedule(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Tooltip title="Xóa">
                            <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                loading={deleteScheduleLoading}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const staffColumns = [
        {
            title: "Kỹ thuật viên",
            key: "technician",
            render: (record: TechnicianStaff) => (
                <div>
                    <div className="font-medium">
                        {record.userId.fullName || record.userId.email}
                    </div>
                    <div className="text-sm text-gray-500">
                        {record.userId.email}
                    </div>
                </div>
            ),
        },
        {
            title: "Thời gian làm việc",
            key: "workPeriod",
            render: (record: TechnicianStaff) => (
                <div>
                    <div>Từ: {dayjs(record.startDate).format("DD/MM/YYYY")}</div>
                    <div>Đến: {dayjs(record.endDate).format("DD/MM/YYYY")}</div>
                </div>
            ),
        },
        {
            title: "Trạng thái",
            key: "status",
            render: (record: TechnicianStaff) => (
                <Tag color={record.isActive ? "green" : "red"}>
                    {record.isActive ? "Hoạt động" : "Không hoạt động"}
                </Tag>
            ),
        },
        {
            title: "Vị trí",
            key: "position",
            render: (record: TechnicianStaff) => {
                // Translate position to Vietnamese
                const positionMap: Record<string, string> = {
                    'technician': 'Kỹ thuật viên',
                    'staff': 'Nhân viên',
                    'admin': 'Quản trị viên',
                    'manager': 'Quản lý'
                };
                const displayPosition = positionMap[record.position?.toLowerCase() || ''] || record.position || 'N/A';
                return (
                    <Tag color="blue">{displayPosition}</Tag>
                );
            },
        },
        {
            title: "Hành động",
            key: "actions",
            render: (record: TechnicianStaff) => (
                <Space direction="vertical" size="small">
                    <Button
                        type="primary"
                        size="small"
                        icon={<CalendarOutlined />}
                        onClick={() => handleCreateSingleSchedule(record)}
                        disabled={!record.isActive}
                    >
                        Lịch theo ngày
                    </Button>
                    <Button
                        type="default"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => handleCreateMultipleSchedules(record)}
                        disabled={!record.isActive}
                    >
                        Lịch nhiều ngày
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <Title level={2}>Quản lý Lịch Làm Việc Kỹ Thuật Viên</Title>
                <Text type="secondary">
                    Quản lý lịch làm việc và danh sách kỹ thuật viên theo trung tâm
                </Text>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={6}>
                        <Text strong>Trung tâm dịch vụ:</Text>
                        <Select
                            placeholder="Chọn trung tâm"
                            style={{ width: "100%", marginTop: 8 }}
                            value={selectedServiceCenter}
                            onChange={handleServiceCenterChange}
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
                        <Text strong>Ngày làm việc:</Text>
                        <DatePicker
                            style={{ width: "100%", marginTop: 8 }}
                            value={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Button
                            onClick={fetchSchedules}
                            loading={fetchSchedulesByCenterLoading}
                            style={{ marginTop: 32 }}
                            type="primary"
                        >
                            Tải lại
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Technician Staff */}
            <Card title={
                <div className="flex items-center">
                    <TeamOutlined className="mr-2 text-blue-500" />
                    <span>Danh sách Kỹ thuật viên</span>
                </div>
            } className="mb-6">
                <Table
                    columns={staffColumns}
                    dataSource={technicianStaff}
                    rowKey="_id"
                    loading={fetchStaffLoading}
                    pagination={false}
                    scroll={{ x: 800 }}
                    locale={{ emptyText: "Không có kỹ thuật viên nào" }}
                />
            </Card>

            {/* Schedules */}
            <Card title={
                <div className="flex items-center">
                    <ScheduleOutlined className="mr-2 text-green-500" />
                    <span>Lịch làm việc</span>
                </div>
            }>
                <Table
                    columns={columns}
                    dataSource={schedules}
                    rowKey="_id"
                    loading={fetchSchedulesByCenterLoading}
                    pagination={false}
                    scroll={{ x: 1200 }}
                    locale={{ emptyText: "Không có lịch làm việc nào" }}
                />

                {/* Show total count */}
                {schedules.length > 0 && (
                    <div style={{ marginTop: 16, textAlign: "center" }}>
                        <Text type="secondary">
                            Hiển thị {schedules.length} lịch làm việc
                        </Text>
                    </div>
                )}
            </Card>


            {/* View Schedule Modal */}
            <Modal
                title="Chi tiết lịch làm việc"
                open={viewModalVisible}
                onCancel={() => {
                    setViewModalVisible(false);
                    setSelectedSchedule(null);
                }}
                footer={
                    <Button onClick={() => {
                        setViewModalVisible(false);
                        setSelectedSchedule(null);
                    }}>
                        Đóng
                    </Button>
                }
                width={600}
            >
                {selectedSchedule && (
                    <div className="space-y-4">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <div>
                                    <Text strong>Kỹ thuật viên:</Text>
                                    <div className="mt-1">
                                        {selectedSchedule.technicianId.fullName || selectedSchedule.technicianId.email}
                                    </div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div>
                                    <Text strong>Trung tâm:</Text>
                                    <div className="mt-1">{selectedSchedule.centerId.name}</div>
                                </div>
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <div>
                                    <Text strong>Ngày làm việc:</Text>
                                    <div className="mt-1">
                                        {parseWorkDate(selectedSchedule.workDate).format("DD/MM/YYYY")}
                                    </div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div>
                                    <Text strong>Ca làm việc:</Text>
                                    <div className="mt-1">
                                        {selectedSchedule.shiftStart} - {selectedSchedule.shiftEnd}
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <div>
                                    <Text strong>Trạng thái:</Text>
                                    <div className="mt-1">
                                        <Tag color={getStatusColor(selectedSchedule.status)}>
                                            {getStatusText(selectedSchedule.status)}
                                        </Tag>
                                    </div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div>
                                    <Text strong>Khả năng làm việc:</Text>
                                    <div className="mt-1">
                                        <Tag color={selectedSchedule.availability === "available" ? "green" : "red"}>
                                            {selectedSchedule.availability === "available" ? "Có sẵn" : "Bận"}
                                        </Tag>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {selectedSchedule.breakTime && selectedSchedule.breakTime.length > 0 && (
                            <div>
                                <Text strong>Thời gian nghỉ:</Text>
                                <div className="mt-1">
                                    {selectedSchedule.breakTime.map((breakTime, index) => (
                                        <div key={index} className="text-sm text-gray-600">
                                            {breakTime.start} - {breakTime.end}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedSchedule.notes && (
                            <div>
                                <Text strong>Ghi chú:</Text>
                                <div className="mt-1">{selectedSchedule.notes}</div>
                            </div>
                        )}

                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <div>
                                    <Text strong>Giờ làm thêm:</Text>
                                    <div className="mt-1">{selectedSchedule.overtimeHours}h</div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div>
                                    <Text strong>Giờ làm thực tế:</Text>
                                    <div className="mt-1">{selectedSchedule.actualWorkHours}h</div>
                                </div>
                            </Col>
                        </Row>

                        <div>
                            <Text strong>Lịch hẹn được giao:</Text>
                            <div className="mt-1">
                                {selectedSchedule.assignedAppointments.length > 0
                                    ? `${selectedSchedule.assignedAppointments.length} lịch hẹn`
                                    : "Không có"
                                }
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Schedule Modal */}
            <Modal
                title="Chỉnh sửa lịch làm việc"
                open={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    setSelectedSchedule(null);
                }}
                footer={null}
                width={600}
            >
                {selectedSchedule && (
                    <Form
                        layout="vertical"
                        onFinish={handleUpdateSchedule}
                        initialValues={{
                            workDate: dayjs(selectedSchedule.workDate),
                            shiftTime: [
                                dayjs(`${dayjs().format('YYYY-MM-DD')} ${selectedSchedule.shiftStart}`),
                                dayjs(`${dayjs().format('YYYY-MM-DD')} ${selectedSchedule.shiftEnd}`)
                            ],
                            status: selectedSchedule.status,
                            notes: selectedSchedule.notes || '',
                        }}
                    >
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <div className="mb-4 p-3 bg-gray-50 rounded">
                                    <Text strong>Kỹ thuật viên:</Text>
                                    <div className="mt-1">
                                        {selectedSchedule.technicianId.fullName || selectedSchedule.technicianId.email}
                                    </div>
                                </div>
                            </Col>
                            <Col span={24}>
                                <div className="mb-4 p-3 bg-gray-50 rounded">
                                    <Text strong>Trung tâm:</Text>
                                    <div className="mt-1">{selectedSchedule.centerId.name}</div>
                                </div>
                            </Col>
                        </Row>

                        <Form.Item
                            label="Ngày làm việc"
                            name="workDate"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày làm việc' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            label="Ca làm việc"
                            name="shiftTime"
                            rules={[{ required: true, message: 'Vui lòng chọn ca làm việc' }]}
                        >
                            <TimePicker.RangePicker style={{ width: '100%' }} format="HH:mm" />
                        </Form.Item>

                        <Form.Item
                            label="Trạng thái"
                            name="status"
                            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                        >
                            <Select>
                                <Option value="scheduled">Đã lên lịch</Option>
                                <Option value="working">Đang làm việc</Option>
                                <Option value="completed">Hoàn thành</Option>
                                <Option value="absent">Vắng mặt</Option>
                                <Option value="on_leave">Nghỉ phép</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Ghi chú"
                            name="notes"
                        >
                            <Input.TextArea rows={3} placeholder="Nhập ghi chú..." />
                        </Form.Item>

                        <div className="flex justify-end space-x-2">
                            <Button onClick={() => {
                                setEditModalVisible(false);
                                setSelectedSchedule(null);
                            }}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={updateScheduleLoading}
                            >
                                Cập nhật
                            </Button>
                        </div>
                    </Form>
                )}
            </Modal>

            {/* Single Schedule Modal */}
            {selectedTechnician && (
                <SingleScheduleModal
                    visible={singleScheduleModalVisible}
                    onCancel={() => {
                        setSingleScheduleModalVisible(false);
                        setSelectedTechnician(null);
                    }}
                    onSuccess={handleSingleScheduleModalSuccess}
                    technicianId={selectedTechnician.userId._id}
                    centerId={selectedTechnician.centerId}
                />
            )}

            {/* Multiple Schedule Modal */}
            {selectedTechnician && (
                <MultipleScheduleModal
                    visible={multipleScheduleModalVisible}
                    onCancel={() => {
                        setMultipleScheduleModalVisible(false);
                        setSelectedTechnician(null);
                    }}
                    onSuccess={handleMultipleScheduleModalSuccess}
                    technicianId={selectedTechnician.userId._id}
                    centerId={selectedTechnician.centerId}
                />
            )}
        </div>
    );
};

export default StaffSchedulesTechnicianPage;
