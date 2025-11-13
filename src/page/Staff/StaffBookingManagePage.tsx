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
  fetchPendingOfflinePaymentBookings,
  confirmBooking,
} from "../../services/features/booking/bookingSlice";
import { fetchServiceCenters } from "../../services/features/serviceCenter/serviceCenterSlice";
import { AwaitingConfirmationBooking } from "../../interfaces/booking";
import { ServiceCenter } from "../../interfaces/serviceCenter";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const StaffBookingManagePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    pendingOfflinePaymentBookings,
    pendingOfflinePaymentPagination,
    pendingOfflinePaymentLoading,
    confirmBookingLoading,
  } = useAppSelector((state) => state.booking);
  const { serviceCenters } = useAppSelector((state) => state.serviceCenter);

  // State for filters
  const [selectedServiceCenter, setSelectedServiceCenter] =
    useState<string>("");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    [dayjs().subtract(30, "day"), dayjs()]
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal state
  const [selectedBooking, setSelectedBooking] =
    useState<AwaitingConfirmationBooking | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const fetchBookings = useCallback(() => {
    if (!selectedServiceCenter || !dateRange) return;

    const params = {
      serviceCenterId: selectedServiceCenter,
      dateFrom: dateRange[0].format("YYYY-MM-DD"),
      dateTo: dateRange[1].format("YYYY-MM-DD"),
      page: currentPage,
      limit: pageSize,
      sortBy,
      sortOrder,
    };

    dispatch(fetchPendingOfflinePaymentBookings(params));
  }, [
    selectedServiceCenter,
    dateRange,
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    dispatch,
  ]);

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
    // Fetch bookings when filters change
    if (selectedServiceCenter && dateRange) {
      fetchBookings();
    }
  }, [fetchBookings, selectedServiceCenter, dateRange]);

  const openDetailModal = (booking: AwaitingConfirmationBooking) => {
    setSelectedBooking(booking);
    setDetailModalVisible(true);
  };

  const openConfirmModal = (booking: AwaitingConfirmationBooking) => {
    setSelectedBooking(booking);
    setConfirmModalVisible(true);
  };

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
        const customer =
          typeof record.customer === "string" || !record.customer
            ? { fullName: "N/A" }
            : record.customer;
        return <div className="font-medium">{customer.fullName}</div>;
      },
    },
    {
      title: "Xe",
      key: "vehicle",
      render: (record: AwaitingConfirmationBooking) => {
        const vehicle =
          typeof record.vehicle === "string" || !record.vehicle
            ? {
                vehicleInfo: {
                  licensePlate: "N/A",
                  vehicleModel: { brand: "N/A", modelName: "N/A" },
                },
              }
            : record.vehicle;
        return (
          <div>
            <div className="font-medium">
              {vehicle.vehicleInfo.licensePlate}
            </div>
            <div className="text-sm text-gray-500">
              {vehicle.vehicleInfo.vehicleModel?.brand}{" "}
              {vehicle.vehicleInfo.vehicleModel?.modelName}
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
          typeof record.serviceType === "string" || !record.serviceType
            ? { name: "N/A" }
            : record.serviceType;
        return <div className="font-medium">{serviceType.name}</div>;
      },
    },
    {
      title: "Thời gian hẹn",
      key: "appointment",
      render: (record: AwaitingConfirmationBooking) => {
        const date = record.appointmentTime?.date
          ? formatDate(record.appointmentTime.date)
          : "N/A";
        const start = record.appointmentTime?.startTime ?? "N/A";
        const end = record.appointmentTime?.endTime ?? "N/A";
        return (
          <div>
            <div className="font-medium">{date}</div>
            <div className="text-sm text-gray-500">
              {start} - {end}
            </div>
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (record: AwaitingConfirmationBooking) => (
        <div>
          <Tag color={record.confirmation?.isConfirmed ? "green" : "orange"}>
            {record.confirmation?.isConfirmed ? "ĐÃ XÁC NHẬN" : "CHỜ XÁC NHẬN"}
          </Tag>
          <div className="text-xs text-gray-500 mt-1">
            <Tag color={getStatusColor(record.payment?.status ?? "pending")}>
              {(record.payment?.status ?? "pending").toUpperCase()}
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
          <Button
            size="small"
            onClick={() => openDetailModal(record)}
            icon={<UserOutlined />}>
            Chi tiết
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={() => openConfirmModal(record)}
            icon={<CheckCircleOutlined />}
            loading={confirmBookingLoading}
            disabled={record.confirmation?.isConfirmed}>
            Xác nhận
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>Quản lý Booking Chờ Thanh Toán</Title>
        <Text type="secondary">
          Quản lý các booking chưa thanh toán tại trung tâm
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
                optionFilterProp="children">
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
                onChange={(dates) =>
                  setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)
                }
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
                onChange={setSortBy}>
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
                onChange={setSortOrder}>
                <Option value="desc">Giảm dần</Option>
                <Option value="asc">Tăng dần</Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              type="primary"
              onClick={fetchBookings}
              loading={pendingOfflinePaymentLoading}
              style={{ marginTop: 32 }}>
              Tải lại
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table - Pending Offline Payment */}
      <Card>
        <Table
          columns={columns}
          dataSource={pendingOfflinePaymentBookings}
          rowKey="_id"
          loading={pendingOfflinePaymentLoading}
          pagination={false}
          scroll={{ x: 1200 }}
        />

        {pendingOfflinePaymentPagination && (
          <div className="mt-4 flex justify-between items-center">
            <Text type="secondary">
              Hiển thị {(currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(
                currentPage * pageSize,
                pendingOfflinePaymentPagination.totalItems
              )}
              trong tổng số {pendingOfflinePaymentPagination.totalItems} kết quả
            </Text>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={pendingOfflinePaymentPagination.totalItems}
              onChange={(page, size) => {
                setCurrentPage(page);
                if (size) setPageSize(size);
              }}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} của ${total}`
              }
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
        width={800}>
        {selectedBooking && (
          <div className="space-y-4">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" title="Thông tin khách hàng">
                  <Space direction="vertical" className="w-full">
                    <div>
                      <UserOutlined />{" "}
                      {typeof selectedBooking.customer === "string"
                        ? "N/A"
                        : selectedBooking.customer.fullName}
                    </div>
                    <div>
                      <MailOutlined />{" "}
                      {typeof selectedBooking.customer === "string"
                        ? "N/A"
                        : selectedBooking.customer.email}
                    </div>
                    <div>
                      <PhoneOutlined />{" "}
                      {typeof selectedBooking.customer === "string"
                        ? "N/A"
                        : selectedBooking.customer.phone}
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Thông tin xe">
                  <Space direction="vertical" className="w-full">
                    <div>
                      <CarOutlined />{" "}
                      {typeof selectedBooking.vehicle === "string"
                        ? "N/A"
                        : selectedBooking.vehicle.vehicleInfo.licensePlate}
                    </div>
                    <div>
                      Hãng:{" "}
                      {typeof selectedBooking.vehicle === "string"
                        ? "N/A"
                        : selectedBooking.vehicle.vehicleInfo.vehicleModel
                            ?.brand || "N/A"}
                    </div>
                    <div>
                      Model:{" "}
                      {typeof selectedBooking.vehicle === "string"
                        ? "N/A"
                        : selectedBooking.vehicle.vehicleInfo.vehicleModel
                            ?.modelName || "N/A"}
                    </div>
                    <div>
                      Năm:{" "}
                      {typeof selectedBooking.vehicle === "string"
                        ? "N/A"
                        : selectedBooking.vehicle.vehicleInfo.year}
                    </div>
                    <div>
                      Màu:{" "}
                      {typeof selectedBooking.vehicle === "string"
                        ? "N/A"
                        : selectedBooking.vehicle.vehicleInfo.color}
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" title="Dịch vụ">
                  <Space direction="vertical" className="w-full">
                    <div className="font-medium">
                      {typeof selectedBooking.serviceType === "string" ||
                      !selectedBooking.serviceType
                        ? "N/A"
                        : selectedBooking.serviceType.name}
                    </div>
                    <div>
                      Mô tả: {selectedBooking.serviceDetails.description}
                    </div>
                    <div className="text-green-600 font-medium">
                      <DollarOutlined />{" "}
                      {formatCurrency(
                        typeof selectedBooking.serviceType === "string" ||
                          !selectedBooking.serviceType
                          ? 0
                          : selectedBooking.serviceType.pricing.basePrice
                      )}
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Lịch hẹn">
                  <Space direction="vertical" className="w-full">
                    <div>
                      <CalendarOutlined />{" "}
                      {selectedBooking.appointmentTime?.date
                        ? formatDate(selectedBooking.appointmentTime.date)
                        : "N/A"}
                    </div>
                    <div>
                      <ClockCircleOutlined />{" "}
                      {selectedBooking.appointmentTime?.startTime ?? "N/A"} -{" "}
                      {selectedBooking.appointmentTime?.endTime ?? "N/A"}
                    </div>
                    <div>
                      Trung tâm:{" "}
                      {typeof selectedBooking.serviceCenter === "string"
                        ? "N/A"
                        : selectedBooking.serviceCenter?.name ?? "N/A"}
                    </div>
                    <div>
                      <EnvironmentOutlined />{" "}
                      {typeof selectedBooking.serviceCenter === "string"
                        ? "N/A"
                        : `${
                            selectedBooking.serviceCenter?.address?.street ??
                            "N/A"
                          }, ${
                            selectedBooking.serviceCenter?.address?.ward ??
                            "N/A"
                          }, ${
                            selectedBooking.serviceCenter?.address?.district ??
                            "N/A"
                          }, ${
                            selectedBooking.serviceCenter?.address?.city ??
                            "N/A"
                          }`}
                    </div>
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
                  <div>
                    Trạng thái:{" "}
                    <Tag
                      color={getStatusColor(
                        selectedBooking.payment?.status ?? "pending"
                      )}>
                      {(
                        selectedBooking.payment?.status ?? "pending"
                      ).toUpperCase()}
                    </Tag>
                  </div>
                </Col>
                <Col span={8}>
                  <div>
                    Số tiền:{" "}
                    <Text className="text-green-600 font-medium">
                      {formatCurrency(selectedBooking.payment?.amount ?? 0)}
                    </Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div>
                    Phương thức: {selectedBooking.payment?.method ?? "N/A"}
                  </div>
                </Col>
              </Row>
              <div className="mt-2">
                <Text type="secondary">
                  Thời gian thanh toán:{" "}
                  {selectedBooking.payment?.paidAt
                    ? formatDateTime(selectedBooking.payment.paidAt)
                    : "N/A"}
                </Text>
              </div>
            </Card>

            <Card size="small" title="Thông tin xác nhận">
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <div>
                    Trạng thái:{" "}
                    <Tag
                      color={
                        selectedBooking.confirmation?.isConfirmed
                          ? "green"
                          : "orange"
                      }>
                      {selectedBooking.confirmation?.isConfirmed
                        ? "ĐÃ XÁC NHẬN"
                        : "CHỜ XÁC NHẬN"}
                    </Tag>
                  </div>
                </Col>
                <Col span={8}>
                  <div>
                    Phương thức:{" "}
                    {selectedBooking.confirmation?.confirmationMethod ?? "N/A"}
                  </div>
                </Col>
              </Row>
              {selectedBooking.confirmation?.isConfirmed && (
                <div className="mt-2">
                  <Text type="secondary">
                    Thời gian xác nhận:{" "}
                    {selectedBooking.confirmation?.confirmedAt
                      ? formatDateTime(selectedBooking.confirmation.confirmedAt)
                      : "N/A"}
                  </Text>
                </div>
              )}
            </Card>
          </div>
        )}
      </Modal>

      {/* Confirm Booking Modal */}
      <Modal
        title="Xác nhận Booking"
        open={confirmModalVisible}
        onOk={() =>
          selectedBooking && handleConfirmBooking(selectedBooking._id)
        }
        onCancel={() => setConfirmModalVisible(false)}
        confirmLoading={confirmBookingLoading}
        okText="Xác nhận"
        cancelText="Hủy">
        {selectedBooking && (
          <div>
            <p>Bạn có chắc chắn muốn xác nhận booking này?</p>
            <Divider />
            <div className="space-y-2">
              <div>
                <strong>Khách hàng:</strong>{" "}
                {typeof selectedBooking.customer === "string" ||
                !selectedBooking.customer
                  ? "N/A"
                  : selectedBooking.customer.fullName}
              </div>
              <div>
                <strong>Xe:</strong>{" "}
                {typeof selectedBooking.vehicle === "string" ||
                !selectedBooking.vehicle
                  ? "N/A"
                  : selectedBooking.vehicle.vehicleInfo.licensePlate}
              </div>
              <div>
                <strong>Dịch vụ:</strong>{" "}
                {typeof selectedBooking.serviceType === "string" ||
                !selectedBooking.serviceType
                  ? "N/A"
                  : selectedBooking.serviceType.name}
              </div>
              <div>
                <strong>Thời gian:</strong>{" "}
                {selectedBooking.appointmentTime?.date
                  ? formatDate(selectedBooking.appointmentTime.date)
                  : "N/A"}{" "}
                {selectedBooking.appointmentTime?.startTime ?? ""}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffBookingManagePage;
