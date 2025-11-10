import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Modal,
  Form,
  InputNumber,
  Input,
  Button,
  message,
  Alert,
  Typography,
  Divider,
  Radio,
  Space,
  QRCode,
  Spin,
} from "antd";
import {
  DollarOutlined,
  InfoCircleOutlined,
  QrcodeOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import {
  processPayment,
  processOnlinePayment,
  clearOnlinePaymentLink,
  fetchWorkProgressDetail,
} from "@/services/features/technician/workProgressSlice";
import { getPaymentStatus } from "@/services/features/payment/paymentSlice";
import {
  ProcessPaymentPayload,
  ProcessOnlinePaymentPayload,
  WorkProgress,
} from "@/interfaces/workProgress";
import { PaymentStatus } from "@/interfaces/payment";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ProcessPaymentModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  workProgress: WorkProgress | null;
}

const ProcessPaymentModal: React.FC<ProcessPaymentModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  workProgress,
}) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const {
    processPaymentLoading,
    processOnlinePaymentLoading,
    onlinePaymentLink,
    error,
  } = useAppSelector((state) => state.workProgress);
  const { user } = useAppSelector((state) => state.auth);

  const [quoteAmount, setQuoteAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"offline" | "online">(
    "offline"
  );
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [isPolling, setIsPolling] = useState(false);
  const [hasShownSuccessMessage, setHasShownSuccessMessage] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (workProgress && visible) {
      // Get quote amount from work progress
      const amount =
        workProgress.quote?.quoteAmount ||
        (workProgress.appointmentId &&
        typeof workProgress.appointmentId === "object"
          ? workProgress.appointmentId.inspectionAndQuote?.quoteAmount
          : 0) ||
        0;

      setQuoteAmount(amount);

      // Set form initial values
      form.setFieldsValue({
        paidAmount: amount,
        notes: "",
        paymentMethod: "offline",
      });
      setPaymentMethod("offline");
    }
  }, [workProgress, visible, form]);

  useEffect(() => {
    // Clear payment link when modal closes
    if (!visible) {
      dispatch(clearOnlinePaymentLink());
      setPaymentMethod("offline");
      setPaymentStatus("pending");
      setIsPolling(false);
      setHasShownSuccessMessage(false); // Reset flag when modal closes
      // Clear polling interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [visible, dispatch]);

  // Function to check payment status
  const checkPaymentStatus = useCallback(
    async (paymentId: string) => {
      try {
        const result = await dispatch(getPaymentStatus(paymentId)).unwrap();

        if (result.success && result.data) {
          const status = result.data.status;
          setPaymentStatus(status);

          // Stop polling if payment is completed (success or failure)
          if (status === "paid") {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            setIsPolling(false);

            // Only show success message once
            if (!hasShownSuccessMessage) {
              message.success("✅ Thanh toán thành công!");
              setHasShownSuccessMessage(true);
            }

            // Backend webhook now updates everything synchronously:
            // - appointment.status = "completed"
            // - workProgress.paymentDetails
            // - free technician schedules
            // Just fetch once with a small delay for webhook processing
            if (workProgress) {
              console.log(
                "[ProcessPaymentModal] Payment successful, fetching updated data..."
              );

              // Small delay to ensure webhook has been processed
              await new Promise((resolve) => setTimeout(resolve, 1500));

              try {
                const updatedWorkProgress = await dispatch(
                  fetchWorkProgressDetail(workProgress._id)
                ).unwrap();

                const apptData = updatedWorkProgress.data?.appointmentId;
                const apptStatus =
                  typeof apptData === "object" ? apptData.status : null;

                console.log("[ProcessPaymentModal] Updated data:", {
                  appointmentStatus: apptStatus,
                  paymentDetails: updatedWorkProgress.data?.paymentDetails,
                });
              } catch (error) {
                console.error(
                  "[ProcessPaymentModal] Error fetching updated data:",
                  error
                );
              }
            }

            // Close modal and refresh list
            setTimeout(() => {
              form.resetFields();
              onSuccess?.(); // Refresh list to show updated status
              onCancel();
            }, 2000);
          } else if (
            status === "failed" ||
            status === "cancelled" ||
            status === "expired"
          ) {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            setIsPolling(false);

            if (status === "failed") {
              message.error("❌ Thanh toán thất bại!");
            } else if (status === "cancelled") {
              message.warning("⚠️ Thanh toán đã bị hủy!");
            } else if (status === "expired") {
              message.warning("⏰ Link thanh toán đã hết hạn!");
            }
          }
        }
      } catch (error) {
        // If backend says payment not found but we have link, stop polling gracefully
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err: any = error;
        const msg = err?.message || err?.toString?.();
        console.error("Error checking payment status:", msg);
        if (
          msg?.includes("Không tìm thấy thanh toán") &&
          pollingIntervalRef.current
        ) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          setIsPolling(false);
          message.warning(
            "Không tìm thấy thanh toán - dừng kiểm tra. Vui lòng tạo lại link nếu cần."
          );
        }
      }
    },
    [dispatch, form, onSuccess, onCancel, workProgress, hasShownSuccessMessage]
  );

  // Polling effect - check payment status every 3 seconds
  useEffect(() => {
    // Only poll if we have a payment link and modal is visible
    if (!onlinePaymentLink || !visible) {
      return;
    }

    const paymentId = onlinePaymentLink.payment._id;
    setIsPolling(true);

    // Initial check
    checkPaymentStatus(paymentId);

    // Start polling every 3 seconds
    pollingIntervalRef.current = setInterval(() => {
      checkPaymentStatus(paymentId);
    }, 3000);

    // Auto-stop after 15 minutes (900 seconds)
    const timeoutId = setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        setIsPolling(false);
        message.warning("Đã hết thời gian chờ thanh toán (15 phút)");
      }
    }, 15 * 60 * 1000);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      clearTimeout(timeoutId);
      setIsPolling(false);
    };
  }, [onlinePaymentLink, visible, checkPaymentStatus]);

  type FormValues = {
    paidAmount: number;
    notes?: string;
    paymentMethod: "offline" | "online";
  };
  const handleSubmit = async (values: FormValues) => {
    if (!workProgress || !user?.id) {
      message.error("Thiếu thông tin cần thiết");
      return;
    }

    if (values.paymentMethod === "online") {
      // Process online payment
      const payload: ProcessOnlinePaymentPayload = {
        staffId: user.id,
        amount: values.paidAmount,
        notes: values.notes,
      };

      try {
        const result = await dispatch(
          processOnlinePayment({
            workProgressId: workProgress._id,
            payload,
          })
        ).unwrap();

        if (result.success) {
          message.success("Tạo link thanh toán thành công!");
          // Don't close modal, show payment link
        }
      } catch {
        message.error("Tạo link thanh toán thất bại");
      }
    } else {
      // Process offline payment
      const payload: ProcessPaymentPayload = {
        staffId: user.id,
        paidAmount: values.paidAmount,
        notes: values.notes,
      };

      try {
        const result = await dispatch(
          processPayment({
            workProgressId: workProgress._id,
            payload,
          })
        ).unwrap();

        if (result.success) {
          message.success("Xử lý thanh toán thành công!");
          form.resetFields();
          onSuccess?.();
          onCancel();
        }
      } catch {
        message.error("Xử lý thanh toán thất bại");
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    dispatch(clearOnlinePaymentLink());
    setPaymentMethod("offline");
    onCancel();
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    message.success("Đã copy link thanh toán!");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (!workProgress) {
    return null;
  }

  return (
    <Modal
      title={
        <div className="flex items-center">
          <DollarOutlined className="mr-2 text-green-600" />
          <Title level={4} className="mb-0">
            Xử lý Thanh toán
          </Title>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnHidden>
      <div className="space-y-4">
        {/* Work Progress Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <Text strong>Thông tin công việc:</Text>
          <div className="mt-2 space-y-1">
            <Text>ID: {workProgress._id.slice(-8)}</Text>
            <br />
            <Text>
              Kỹ thuật viên:{" "}
              {typeof workProgress.technicianId === "object"
                ? workProgress.technicianId.email
                : workProgress.technicianId}
            </Text>
            <br />
            <Text>
              Ngày dịch vụ:{" "}
              {new Date(workProgress.serviceDate).toLocaleDateString("vi-VN")}
            </Text>
          </div>
        </div>

        {/* Quote Amount Display */}
        {quoteAmount > 0 && (
          <Alert
            message="Số tiền báo giá"
            description={
              <div>
                <Text strong className="text-lg text-green-600">
                  {formatCurrency(quoteAmount)}
                </Text>
              </div>
            }
            type="info"
            icon={<InfoCircleOutlined />}
            showIcon
          />
        )}

        {/* Error Alert */}
        {error && (
          <Alert message="Lỗi" description={error} type="error" showIcon />
        )}

        <Divider />

        {/* Payment Form */}
        {!onlinePaymentLink ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            disabled={processPaymentLoading || processOnlinePaymentLoading}>
            <Form.Item
              label={<Text strong>Phương thức thanh toán</Text>}
              name="paymentMethod"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn phương thức thanh toán",
                },
              ]}>
              <Radio.Group
                onChange={(e) => setPaymentMethod(e.target.value)}
                size="large">
                <Space direction="vertical">
                  <Radio value="offline">
                    <DollarOutlined className="mr-1" />
                    Thanh toán trực tiếp (Tiền mặt/Chuyển khoản)
                  </Radio>
                  <Radio value="online">
                    <QrcodeOutlined className="mr-1" />
                    Thanh toán online (PayOS - QR Code)
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label={
                <Text strong>
                  <DollarOutlined className="mr-1" />
                  Số tiền thanh toán
                </Text>
              }
              name="paidAmount"
              rules={[
                { required: true, message: "Vui lòng nhập số tiền thanh toán" },
                { type: "number", min: 0, message: "Số tiền phải lớn hơn 0" },
              ]}>
              <InputNumber
                className="w-full"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                placeholder="Số tiền thanh toán"
                addonAfter="VND"
                size="large"
                disabled
                style={{
                  color: "#000",
                  fontWeight: "bold",
                  cursor: "not-allowed",
                }}
              />
            </Form.Item>
            <Alert
              message="Lưu ý"
              description="Số tiền thanh toán được tính từ báo giá và không thể thay đổi"
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              className="mb-4"
            />

            <Form.Item label={<Text strong>Ghi chú</Text>} name="notes">
              <TextArea
                rows={3}
                placeholder={
                  paymentMethod === "offline"
                    ? "Nhập ghi chú về thanh toán (tùy chọn)"
                    : "Ghi chú cho khách hàng (tùy chọn)"
                }
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <div className="flex justify-end space-x-2">
                <Button onClick={handleCancel} size="large">
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={processPaymentLoading || processOnlinePaymentLoading}
                  size="large"
                  className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700">
                  <DollarOutlined className="mr-1" />
                  {paymentMethod === "online"
                    ? "Tạo Link Thanh toán"
                    : "Xử lý Thanh toán"}
                </Button>
              </div>
            </Form.Item>
          </Form>
        ) : (
          /* Payment Link Display */
          <div className="space-y-4">
            {/* Payment Status Indicator */}
            {paymentStatus === "pending" && isPolling && (
              <Alert
                message="Đang chờ thanh toán..."
                description={
                  <div className="flex items-center gap-2">
                    <Spin size="small" />
                    <span>
                      Hệ thống đang tự động kiểm tra trạng thái thanh toán
                    </span>
                  </div>
                }
                type="info"
                icon={<ClockCircleOutlined />}
                showIcon
              />
            )}

            {paymentStatus === "paid" && (
              <Alert
                message="✅ Thanh toán thành công!"
                description="Giao dịch đã được xác nhận. Cửa sổ sẽ tự động đóng..."
                type="success"
                icon={<CheckCircleOutlined />}
                showIcon
              />
            )}

            {(paymentStatus === "failed" ||
              paymentStatus === "cancelled" ||
              paymentStatus === "expired") && (
              <Alert
                message={
                  paymentStatus === "failed"
                    ? "❌ Thanh toán thất bại"
                    : paymentStatus === "cancelled"
                    ? "⚠️ Thanh toán đã bị hủy"
                    : "⏰ Link thanh toán đã hết hạn"
                }
                description="Vui lòng tạo link thanh toán mới hoặc chọn phương thức thanh toán offline"
                type="error"
                icon={<CloseCircleOutlined />}
                showIcon
              />
            )}

            {paymentStatus === "pending" && (
              <>
                <Alert
                  message="Link thanh toán đã được tạo thành công!"
                  description="Khách hàng có thể quét mã QR hoặc truy cập link để thanh toán"
                  type="success"
                  showIcon
                />

                {/* QR Code */}
                <div className="flex justify-center bg-gray-50 p-6 rounded-lg">
                  <QRCode
                    value={onlinePaymentLink.paymentLink.qrCode}
                    size={200}
                    errorLevel="H"
                  />
                </div>

                {/* Payment Details */}
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <div>
                    <Text strong>Mã đơn hàng: </Text>
                    <Text copyable>
                      {onlinePaymentLink.paymentLink.orderCode}
                    </Text>
                  </div>
                  <div>
                    <Text strong>Số tiền: </Text>
                    <Text className="text-lg text-green-600">
                      {formatCurrency(onlinePaymentLink.paymentLink.amount)}
                    </Text>
                  </div>
                  <div>
                    <Text strong>Hết hạn: </Text>
                    <Text>
                      {new Date(
                        onlinePaymentLink.paymentLink.expiresAt
                      ).toLocaleString("vi-VN")}
                    </Text>
                  </div>
                  <div>
                    <Text strong>Trạng thái: </Text>
                    <Text className="text-orange-600">
                      {isPolling
                        ? "🔄 Đang theo dõi..."
                        : "⏸️ Đã dừng theo dõi"}
                    </Text>
                  </div>
                </div>

                {/* Payment Links */}
                <div className="space-y-2">
                  <Button
                    type="primary"
                    icon={<LinkOutlined />}
                    onClick={() =>
                      handleCopyLink(onlinePaymentLink.paymentLink.checkoutUrl)
                    }
                    block
                    size="large">
                    Copy Link Thanh toán
                  </Button>
                  <Button
                    icon={<QrcodeOutlined />}
                    onClick={() =>
                      handleCopyLink(onlinePaymentLink.paymentLink.qrCode)
                    }
                    block
                    size="large">
                    Copy QR Code Link
                  </Button>
                </div>
              </>
            )}

            {/* Close Button */}
            <div className="flex justify-end pt-4">
              <Button onClick={handleCancel} size="large" type="default">
                Đóng
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProcessPaymentModal;
