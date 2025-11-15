import React from "react";
import {
  Modal,
  Typography,
  Card,
  Tag,
  Space,
  Row,
  Col,
  Spin,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { WorkProgress } from "@/interfaces/workProgress";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface WorkProgressDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  workProgress: WorkProgress | null;
  loading?: boolean;
}

const WorkProgressDetailModal: React.FC<WorkProgressDetailModalProps> = ({
  visible,
  onCancel,
  workProgress,
  loading = false,
}) => {
  if (!workProgress) {
    return null;
  }

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

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      not_started: "default",
      in_progress: "processing",
      paused: "warning",
      completed: "success",
      delayed: "error",
      inspection_completed: "blue",
      quote_provided: "orange",
      quote_approved: "green",
      quote_rejected: "red",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      not_started: "Chưa bắt đầu",
      in_progress: "Đang thực hiện",
      paused: "Tạm dừng",
      completed: "Hoàn thành",
      delayed: "Trễ hạn",
      inspection_completed: "Đã kiểm tra",
      quote_provided: "Đã báo giá",
      quote_approved: "Đã duyệt giá",
      quote_rejected: "Từ chối giá",
    };
    return statusTexts[status] || status;
  };

  const appointment = workProgress.appointmentId;
  const isAppointmentObject = (
    appt: typeof appointment
  ): appt is Exclude<typeof appointment, string> => {
    return appt !== null && typeof appt === "object";
  };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <FileTextOutlined className="mr-2 text-blue-600" />
          <Title level={4} className="mb-0">
            Chi tiết Công việc #{workProgress._id.slice(-8)}
          </Title>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
      destroyOnHidden>
      {loading ? (
        <div className="text-center py-8">
          <Spin size="large" />
          <div className="mt-4">
            <Text>Đang tải chi tiết...</Text>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Info */}
          <Card size="small">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <div className="flex items-center">
                    <UserOutlined className="mr-2 text-gray-500" />
                    <Text strong>Kỹ thuật viên:</Text>
                    <Text>
                      {typeof workProgress.technicianId === "object"
                        ? workProgress.technicianId.email
                        : workProgress.technicianId}
                    </Text>
                  </div>
                  <div className="flex items-center">
                    <CalendarOutlined className="mr-2 text-gray-500" />
                    <Text strong>Ngày dịch vụ:</Text>
                    <Text>{formatDate(workProgress.serviceDate)}</Text>
                  </div>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <div className="flex items-center">
                    <Text strong>Trạng thái:</Text>
                    <Tag color={getStatusColor(workProgress.currentStatus)}>
                      {getStatusText(workProgress.currentStatus)}
                    </Tag>
                  </div>
                  <div className="flex items-center">
                    <Text strong>Tiến độ:</Text>
                    <Text>{workProgress.progressPercentage || 0}%</Text>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Appointment Details */}
          {isAppointmentObject(appointment) && (
            <Card
              size="small"
              title={
                <>
                  <CarOutlined className="mr-2" />
                  Thông tin lịch hẹn
                </>
              }>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Space direction="vertical" size="small">
                    <div>
                      <Text strong>Thời gian hẹn:</Text>
                      <br />
                      <Text>
                        {formatDateTime(appointment.appointmentTime?.date)} -{" "}
                        {appointment.appointmentTime?.startTime}
                      </Text>
                    </div>
                    {appointment.serviceDetails && (
                      <div>
                        <Text strong>Mô tả dịch vụ:</Text>
                        <br />
                        <Text>{appointment.serviceDetails.description}</Text>
                      </div>
                    )}
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" size="small">
                    {/* Hidden per request: remove deposit and confirmation summary in detail view */}
                  </Space>
                </Col>
              </Row>
            </Card>
          )}

          {/* Payment Details */}
          {(workProgress.paymentDetails ||
            (isAppointmentObject(appointment) && appointment.payment)) && (
            <Card
              size="small"
              title={
                <>
                  <DollarOutlined className="mr-2" />
                  Chi tiết thanh toán
                </>
              }>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Space direction="vertical" size="small">
                    <Text strong>Phương thức:</Text>
                    <Text>
                      {workProgress.paymentDetails?.paymentMethod ||
                        (isAppointmentObject(appointment)
                          ? appointment.payment?.method
                          : "N/A")}
                    </Text>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space direction="vertical" size="small">
                    <Text strong>Số tiền:</Text>
                    <Text>
                      {formatCurrency(
                        workProgress.paymentDetails?.paidAmount ||
                          (isAppointmentObject(appointment)
                            ? appointment.payment?.amount || 0
                            : 0)
                      )}
                    </Text>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space direction="vertical" size="small">
                    <Text strong>Trạng thái:</Text>
                    {(() => {
                      const wpPaid =
                        workProgress.paymentDetails?.paymentStatus === "paid";
                      const apptPaid =
                        isAppointmentObject(appointment) &&
                        appointment.payment?.status === "paid";
                      const isPaid = wpPaid || apptPaid;
                      return (
                        <Tag color={isPaid ? "green" : "orange"}>
                          {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                        </Tag>
                      );
                    })()}
                  </Space>
                </Col>
              </Row>
            </Card>
          )}

          {/* Notes */}
          {workProgress.notes && (
            <Card
              size="small"
              title={
                <>
                  <FileTextOutlined className="mr-2" />
                  Ghi chú
                </>
              }>
              <Text>{workProgress.notes}</Text>
            </Card>
          )}

          {/* Completion Details */}
          {isAppointmentObject(appointment) &&
            appointment.completion &&
            appointment.completion.isCompleted && (
              <Card
                size="small"
                title={
                  <>
                    <CheckCircleOutlined className="mr-2" />
                    Hoàn thành
                  </>
                }>
                <Space direction="vertical" size="small" className="w-full">
                  {appointment.completion.workDone && (
                    <div>
                      <Text strong>Công việc đã thực hiện:</Text>
                      <br />
                      <Text>{appointment.completion.workDone}</Text>
                    </div>
                  )}
                  {appointment.completion.recommendations && (
                    <div>
                      <Text strong>Khuyến nghị:</Text>
                      <br />
                      <Text>{appointment.completion.recommendations}</Text>
                    </div>
                  )}
                  {appointment.completion.completedAt && (
                    <div>
                      <Text strong>Hoàn thành lúc:</Text>
                      <br />
                      <Text>
                        {formatDateTime(appointment.completion.completedAt)}
                      </Text>
                    </div>
                  )}
                </Space>
              </Card>
            )}

          {/* Created At */}
          <Card size="small">
            <Text type="secondary">
              Tạo lúc:{" "}
              {workProgress.createdAt
                ? formatDateTime(workProgress.createdAt)
                : "N/A"}
            </Text>
          </Card>
        </div>
      )}
    </Modal>
  );
};

export default WorkProgressDetailModal;
