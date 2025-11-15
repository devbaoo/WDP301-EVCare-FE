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
  HistoryOutlined,
  StarOutlined,
  MessageOutlined,
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
  Input as AntInput,
  Alert,
} from "antd";
import axiosInstance from "../../services/constant/axiosInstance";
import {
  BOOKING_DETAILS_ENDPOINT,
  BOOKING_TIME_SLOTS_ENDPOINT,
  APPOINTMENT_PROGRESS_ENDPOINT,
  APPOINTMENT_VIEW_QUOTE_ENDPOINT,
} from "../../services/constant/apiConfig";
import { respondAppointmentQuote } from "../../services/features/booking/bookingSlice";
import { Booking } from "../../interfaces/booking";
import {
  cancelBooking,
  rescheduleBooking,
  fetchMyBookings,
  submitCustomerFeedback,
  updateBookingFeedback,
  getCustomerFeedback,
} from "../../services/features/booking/bookingSlice";
import { useAppDispatch, useAppSelector } from "../../services/store/store";
import StarRating from "../../components/StarRating";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = AntInput;

function BookingHistory() {
  const dispatch = useAppDispatch();
  const { myBookings, loading, error } = useAppSelector(
    (state) => state.booking
  );
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressData, setProgressData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [currentAppointmentId, setCurrentAppointmentId] = useState<
    string | null
  >(null);
  const [quoteResponseNotes, setQuoteResponseNotes] = useState("");
  // Quote modal state (view quote without progress)
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteData, setQuoteData] = useState<Record<string, unknown> | null>(
    null
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);

  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [availableSlots, setAvailableSlots] = useState<
    { startTime: string; endTime: string }[]
  >([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Feedback modal state
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isViewingFeedback, setIsViewingFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    overall: 5,
    service: 5,
    technician: 5,
    facility: 5,
    comment: "",
  });

  const fetchBookings = React.useCallback(async () => {
    const params: Record<string, string | number> = {
      page: currentPage,
      limit: pageSize,
    };

    // Chỉ thêm sortBy và sortOrder nếu có giá trị
    if (sortBy && sortOrder) {
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;
    }

    if (statusFilter !== "all") {
      params.status = statusFilter;
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      params.startDate = dateRange[0].format("YYYY-MM-DD");
      params.endDate = dateRange[1].format("YYYY-MM-DD");
    }

    const result = await dispatch(fetchMyBookings(params) as any);

    // DEBUG: Log booking data
    if (result.type.endsWith("/fulfilled") && result.payload?.appointments) {
      console.log(
        "📋 Customer Bookings Data:",
        result.payload.appointments.map((b: Booking) => ({
          id: b._id,
          status: b.status,
          paymentStatus: b.payment?.status,
          hasPaymentDetails: !!b.payment,
        }))
      );
    }

    // Sau khi fetch bookings, fetch feedback cho các booking completed
    if (result.type.endsWith("/fulfilled") && result.payload?.appointments) {
      const completedBookings = result.payload.appointments.filter(
        (booking: Booking) =>
          booking.status === "completed" &&
          (!booking.feedback || !booking.feedback.overall)
      );

      // Fetch feedback cho từng booking completed chưa có feedback
      for (const booking of completedBookings) {
        try {
          await dispatch(getCustomerFeedback(booking._id) as any);
        } catch (error) {
          // Ignore errors for individual feedback fetches
          console.log(
            `Failed to fetch feedback for booking ${booking._id}:`,
            error
          );
        }
      }
    }
  }, [
    currentPage,
    pageSize,
    statusFilter,
    sortBy,
    sortOrder,
    dateRange,
    dispatch,
  ]);

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
    if (value === "none") {
      setSortBy("");
      setSortOrder("");
    } else {
      const [newSortBy, newSortOrder] = value.split("-");
      setSortBy(newSortBy);
      setSortOrder(newSortOrder as "asc" | "desc");
    }
    setCurrentPage(1);
  };

  const handleDateRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => {
    setDateRange(dates);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setDateRange(null);
    setSortBy("");
    setSortOrder("");
    setCurrentPage(1);
  };

  // Calculate statistics - ensure myBookings is an array
  const bookingsArray = Array.isArray(myBookings) ? myBookings : [];
  const stats = {
    total: bookingsArray.length,
    confirmed: bookingsArray.filter((b) => b.status === "confirmed").length,
    inProgress: bookingsArray.filter((b) =>
      ["in_progress", "maintenance_in_progress"].includes(b.status)
    ).length,
    completed: bookingsArray.filter((b) => b.status === "completed").length,
    cancelled: bookingsArray.filter((b) => b.status === "cancelled").length,
  };

  const fetchBookingDetails = async (bookingId: string) => {
    try {
      const response = await axiosInstance.get(
        BOOKING_DETAILS_ENDPOINT(bookingId)
      );
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
    setCurrentAppointmentId(appointmentId);
    try {
      const res = await axiosInstance.get(
        APPOINTMENT_PROGRESS_ENDPOINT(appointmentId)
      );
      const data = res.data;
      if (data?.success) {
        setProgressData(data.data);
      } else {
        setProgressData({
          notFound: true,
          message:
            data?.message || "Chưa có tiến độ",
        });
      }
    } catch (e) {
      setProgressData({
        notFound: true,
        message: "Chưa có tiến độ",
      });
    } finally {
      setProgressLoading(false);
    }
  };

  const closeProgressModal = () => {
    setProgressModalOpen(false);
    setProgressData(null);
    setQuoteResponseNotes("");
  };

  const openQuoteModal = async (appointmentId: string) => {
    setCurrentAppointmentId(appointmentId);
    setQuoteModalOpen(true);
    setQuoteLoading(true);
    setQuoteData(null);
    try {
      const res = await axiosInstance.get(
        APPOINTMENT_VIEW_QUOTE_ENDPOINT(appointmentId)
      );
      const data = res.data;
      if (data?.success) {
        setQuoteData(data.data);
      } else {
        setQuoteData({
          notFound: true,
          message: data?.message || "Quote not found for this appointment",
        });
      }
    } catch {
      setQuoteData({
        notFound: true,
        message: "Quote not found for this appointment",
      });
    } finally {
      setQuoteLoading(false);
    }
  };

  const closeQuoteModal = () => {
    setQuoteModalOpen(false);
    setQuoteData(null);
    setQuoteResponseNotes("");
  };

  const submitQuoteResponse = async (status: "approved" | "rejected") => {
    if (!currentAppointmentId) return;
    try {
      setProgressLoading(true);
      const action = await dispatch(
        respondAppointmentQuote({
          appointmentId: currentAppointmentId,
          status,
          notes: quoteResponseNotes,
        }) as any
      );
      if (action.type.endsWith("/fulfilled")) {
        // Refresh progress from server to reflect latest
        const res = await axiosInstance.get(
          APPOINTMENT_PROGRESS_ENDPOINT(currentAppointmentId)
        );
        setProgressData(res.data?.data || null);
        // reload bookings to reflect status change if server updates appointment status
        await fetchBookings();
        message.success(
          status === "approved"
            ? "Approved quote successfully"
            : "Rejected quote successfully"
        );
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
      const detailRes = await axiosInstance.get(
        BOOKING_DETAILS_ENDPOINT(booking._id)
      );
      const detail = detailRes.data?.data || booking;
      setSelectedBooking(detail);
      const initialDate = (
        detail.appointmentTime?.date ||
        booking.appointmentTime.date ||
        ""
      ).substring(0, 10);
      setNewDate(initialDate);
      setSelectedSlot("");
      setIsRescheduleOpen(true);
    } catch (err) {
      const error = err as any;
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load appointment details"
      );
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
      await dispatch(
        rescheduleBooking({
          bookingId: selectedBooking._id,
          appointmentDate: newDate,
          appointmentTime: selectedSlot,
        }) as any
      );
      await fetchBookings();
      closeReschedule();
    } catch (err) {
      const error = err as any;
      message.error(
        error.response?.data?.message || error.message || "Rescheduling failed"
      );
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
      await dispatch(
        cancelBooking({
          bookingId: selectedBooking._id,
          reason: cancelReason,
        }) as any
      );
      await fetchBookings();
      closeCancel();
    } catch (err) {
      const error = err as any;
      message.error(
        error.response?.data?.message || error.message || "Cancellation failed"
      );
    }
  };

  const openFeedback = async (booking: Booking) => {
    setSelectedBooking(booking);

    // Kiểm tra xem có feedback không
    const hasExistingFeedback = !!(
      booking.feedback && booking.feedback.overall
    );

    if (hasExistingFeedback) {
      // Đã có feedback, hiển thị để xem
      setIsViewingFeedback(true);
      setFeedbackData({
        overall: booking.feedback?.overall || 0,
        service: booking.feedback?.service || 0,
        technician: booking.feedback?.technician || 0,
        facility: booking.feedback?.facility || 0,
        comment: booking.feedback?.comment || "",
      });
    } else {
      // Chưa có feedback, hiển thị form tạo mới
      setIsViewingFeedback(false);
      setFeedbackData({
        overall: 5,
        service: 5,
        technician: 5,
        facility: 5,
        comment: "",
      });
    }

    setIsFeedbackOpen(true);
  };

  const closeFeedback = () => {
    setIsFeedbackOpen(false);
    setIsViewingFeedback(false);
    setSelectedBooking(null);
    setFeedbackData({
      overall: 5,
      service: 5,
      technician: 5,
      facility: 5,
      comment: "",
    });
  };

  const submitFeedback = async () => {
    if (!selectedBooking) return;

    // Validation
    if (feedbackData.overall < 1 || feedbackData.overall > 5) {
      message.error("Vui lòng đánh giá tổng thể từ 1-5 sao");
      return;
    }

    try {
      const result = await dispatch(
        submitCustomerFeedback({
          appointmentId: selectedBooking._id,
          feedback: feedbackData,
        }) as any
      );

      if (result.type.endsWith("/fulfilled")) {
        message.success("Cảm ơn bạn đã đánh giá dịch vụ!");

        // Cập nhật selectedBooking với feedback mới
        const updatedBooking = {
          ...selectedBooking,
          feedback: {
            ...feedbackData,
            submittedAt: new Date().toISOString(),
          },
        };
        setSelectedBooking(updatedBooking);

        // Cập nhật state trực tiếp
        dispatch(
          updateBookingFeedback({
            bookingId: selectedBooking._id,
            feedback: {
              ...feedbackData,
              submittedAt: new Date().toISOString(),
            },
          })
        );

        closeFeedback();
      } else {
        message.error("Gửi đánh giá thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      const error = err as any;
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Gửi đánh giá thất bại"
      );
    }
  };

  useEffect(() => {
    const loadSlots = async () => {
      try {
        if (!isRescheduleOpen || !newDate || !selectedBooking) return;
        const serviceCenterId =
          (selectedBooking as any)?.serviceCenter?._id ||
          (selectedBooking as any)?.serviceCenterId;
        if (!serviceCenterId) return;
        setLoadingSlots(true);
        const res = await axiosInstance.get(
          BOOKING_TIME_SLOTS_ENDPOINT(serviceCenterId, newDate)
        );
        const slots = res.data?.data?.availableSlots || [];
        setAvailableSlots(slots);
        setSelectedSlot("");
      } catch (err) {
        const error = err as any;
        message.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to load available time slots"
        );
      } finally {
        setLoadingSlots(false);
      }
    };
    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newDate, isRescheduleOpen]);

  // Centralized status config for consistent, readable display
  const STATUS_CONFIG: Record<
    string,
    { color: string; icon: React.ReactNode; label: string }
  > = {
    pending_confirmation: {
      color: "orange",
      icon: <ClockCircleOutlined />,
      label: "Chờ xác nhận",
    },
    confirmed: {
      color: "blue",
      icon: <CheckCircleOutlined />,
      label: "Đã xác nhận",
    },
    in_progress: {
      color: "processing",
      icon: <ClockCircleOutlined />,
      label: "Đang thực hiện",
    },
    inspection_completed: {
      color: "purple",
      icon: <InfoCircleOutlined />,
      label: "Hoàn thành kiểm tra",
    },
    quote_provided: {
      color: "cyan",
      icon: <TagOutlined />,
      label: "Đã báo giá",
    },
    quote_approved: {
      color: "green",
      icon: <CheckCircleOutlined />,
      label: "Đã duyệt giá",
    },
    quote_rejected: {
      color: "red",
      icon: <CloseOutlined />,
      label: "Từ chối giá",
    },
    maintenance_in_progress: {
      color: "blue",
      icon: <ClockCircleOutlined />,
      label: "Đang bảo trì",
    },
    maintenance_completed: {
      color: "green",
      icon: <CheckCircleOutlined />,
      label: "Hoàn thành bảo trì",
    },
    payment_pending: {
      color: "orange",
      icon: <ClockCircleOutlined />,
      label: "Chờ thanh toán",
    },
    completed: {
      color: "success",
      icon: <CheckCircleOutlined />,
      label: "Hoàn thành",
    },
    cancelled: { color: "error", icon: <CloseOutlined />, label: "Đã hủy" },
    rescheduled: {
      color: "warning",
      icon: <EditOutlined />,
      label: "Đã đổi lịch",
    },
    no_show: {
      color: "default",
      icon: <ExclamationCircleOutlined />,
      label: "Không đến",
    },
  };

  const getStatusTag = (status: string) => {
    const cfg = STATUS_CONFIG[status] || {
      color: "default",
      icon: <InfoCircleOutlined />,
      label: status.replace(/_/g, " "),
    };
    return (
      <Tag color={cfg.color} icon={cfg.icon}>
        {cfg.label}
      </Tag>
    );
  };

  const getAverageDetailedRating = (feedback: any) => {
    if (!feedback) return 0;
    const parts = [
      feedback.service,
      feedback.technician,
      feedback.facility,
    ].filter((n: any) => typeof n === "number" && n > 0);
    if (parts.length > 0) {
      const avg =
        parts.reduce((a: number, b: number) => a + Number(b || 0), 0) /
        parts.length;
      return Number(avg.toFixed(1));
    }
    // Fallback to overall if detailed parts are not available
    return typeof feedback.overall === "number"
      ? Number(Number(feedback.overall).toFixed(1))
      : 0;
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
  };

  // Table columns definition
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (
        _: Record<string, any>,
        __: Record<string, any>,
        index: number
      ) => (
        <div className="text-center font-medium text-gray-600">
          {(currentPage - 1) * pageSize + index + 1}
        </div>
      ),
    },
    {
      title: "Ngày hẹn",
      dataIndex: ["appointmentTime", "date"],
      key: "date",
      width: 120,
      sorter: true,
      render: (date: string) => (
        <div>
          <div className="font-medium text-gray-900">
            {dayjs(date).format("DD/MM/YYYY")}
          </div>
          <div className="text-xs text-gray-500">
            {dayjs(date).format("ddd")}
          </div>
        </div>
      ),
    },
    {
      title: "Dịch vụ",
      key: "service",
      width: 150,
      render: (record: Booking) => {
        const serviceName = record.serviceDetails?.isInspectionOnly
          ? "Mang xe tới kiểm tra"
          : record.serviceType?.name || "N/A";

        return (
          <div>
            <div className="font-medium text-gray-900">{serviceName}</div>
            <div className="text-xs text-gray-500 flex items-center">
              <EnvironmentOutlined className="mr-1" />
              {record.serviceCenter?.name || "N/A"}
            </div>
          </div>
        );
      },
    },
    {
      title: "Thời gian",
      key: "time",
      width: 120,
      render: (record: Booking) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {record.appointmentTime?.startTime &&
            record.appointmentTime?.endTime
              ? `${formatTime(record.appointmentTime.startTime)} - ${formatTime(
                  record.appointmentTime.endTime
                )}`
              : "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 200,
      fixed: "right" as const,
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
          {/* View Quote button (available when quote exists) */}
          {(() => {
            const qs = record?.inspectionAndQuote?.quoteStatus as
              | string
              | undefined;
            const canView = Boolean(qs);
            return canView ? (
              <Tooltip title="Xem báo giá">
                <Button
                  type="text"
                  size="small"
                  icon={<TagOutlined />}
                  onClick={() => openQuoteModal(record._id)}
                />
              </Tooltip>
            ) : null;
          })()}
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
    {
      title: "Đánh giá",
      key: "feedback",
      width: 120,
      render: (record: Booking) => {
        if (record.status === "completed") {
          if (
            record.feedback &&
            (record.feedback.service ||
              record.feedback.technician ||
              record.feedback.facility ||
              record.feedback.overall)
          ) {
            const avg = getAverageDetailedRating(record.feedback);
            return (
              <div
                className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                onClick={() => openFeedback(record)}
                title="Bấm để xem chi tiết đánh giá">
                <StarRating
                  rating={avg}
                  size="small"
                  showNumber={true}
                  tooltip={`Đã đánh giá: ${avg}/5 sao - Bấm để xem chi tiết`}
                />
              </div>
            );
          } else {
            return (
              <Button
                type="primary"
                size="small"
                icon={<StarOutlined />}
                onClick={() => openFeedback(record)}
                className="bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600">
                Đánh giá
              </Button>
            );
          }
        }
        return <span className="text-gray-400">-</span>;
      },
    },
  ];

  const canCancelBooking = (status: string) => {
    // Chỉ cho phép cancel khi booking chưa được confirm và chưa bắt đầu maintenance
    const allowedStatuses = [
      "pending_confirmation",
      "in_progress",
      "inspection_completed",
      "quote_provided",
      "quote_rejected",
      "payment_pending",
    ];
    return allowedStatuses.includes(status);
  };

  const canRescheduleBooking = (status: string) => {
    // Chỉ cho phép reschedule khi booking ở trạng thái pending hoặc confirmed
    const allowedStatuses = ["pending_confirmation", "confirmed"];
    return allowedStatuses.includes(status);
  };

  const getStatusColor = (status: string) => {
    // Accept inputs with or without underscore/space
    const normalized = status.toLowerCase().replace(/ /g, "_");
    const cfg = STATUS_CONFIG[normalized];
    if (!cfg) return "#8c8c8c";
    // Map Ant Tag color tokens to hex approximations for Statistic color
    const colorMap: Record<string, string> = {
      processing: "#1677ff",
      orange: "#faad14",
      blue: "#1890ff",
      purple: "#722ed1",
      cyan: "#13c2c2",
      green: "#52c41a",
      success: "#52c41a",
      red: "#ff4d4f",
      error: "#ff4d4f",
      warning: "#faad14",
      default: "#8c8c8c",
    };
    return colorMap[cfg.color] || cfg.color || "#8c8c8c";
  };

  const QUOTE_STATUS_CONFIG: Record<string, { color: string; label: string }> =
    {
      pending: { color: "#faad14", label: "Đang chờ" },
      approved: { color: "#52c41a", label: "Đã duyệt" },
      rejected: { color: "#ff4d4f", label: "Từ chối" },
    };

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <Card
        className="mb-6"
        style={{
          background: "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)",
          color: "white",
          border: "none",
        }}>
        <div className="flex items-center justify-between">
          <div>
            <Title
              level={2}
              style={{
                color: "white",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}>
              <HistoryOutlined style={{ fontSize: "32px" }} />
              Lịch sử đặt lịch
            </Title>
            <Text
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: "16px",
                marginTop: "8px",
              }}>
              Xem và quản lý lịch sử đặt lịch của bạn
            </Text>
          </div>
          <Button
            type="primary"
            ghost
            icon={<ReloadOutlined />}
            onClick={fetchBookings}
            loading={loading}
            size="large">
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
              prefix={<CalendarOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Đã xác nhận"
              value={stats.confirmed}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Đang thực hiện"
              value={stats.inProgress}
              prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={stats.completed}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Đã hủy"
              value={stats.cancelled}
              prefix={<CloseOutlined style={{ color: "#ff4d4f" }} />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <div className="flex items-center gap-2 mb-2">
              <FilterOutlined style={{ color: "#8c8c8c" }} />
              <Text strong>Bộ lọc:</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              style={{ width: "100%" }}
              allowClear>
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
              style={{ width: "100%" }}
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Sắp xếp"
              value={sortBy && sortOrder ? `${sortBy}-${sortOrder}` : "none"}
              onChange={handleSortChange}
              style={{ width: "100%" }}>
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
        <Card className="mb-6" style={{ borderLeft: "4px solid #ff4d4f" }}>
          <div className="flex items-center">
            <ExclamationCircleOutlined
              style={{
                color: "#ff4d4f",
                fontSize: "20px",
                marginRight: "12px",
              }}
            />
            <div>
              <Text strong style={{ color: "#ff4d4f" }}>
                Lỗi tải dữ liệu
              </Text>
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
          dataSource={bookingsArray}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1000 }}
          pagination={{
            current: currentPage,
            total: bookingsArray.length,
            pageSize: pageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} kết quả`,
            onChange: handlePageChange,
            onShowSizeChange: handlePageChange,
            pageSizeOptions: ["10", "20", "50", "100"],
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
          </Button>,
        ]}
        width={600}>
        {selectedBooking && (
          <div className="space-y-4">
            {[
              {
                icon: <CalendarOutlined />,
                label: "Ngày hẹn",
                value: formatDate(selectedBooking.appointmentTime.date),
              },
              {
                icon: <ClockCircleOutlined />,
                label: "Thời gian",
                value:
                  selectedBooking.appointmentTime?.startTime &&
                  selectedBooking.appointmentTime?.endTime
                    ? `${formatTime(
                        selectedBooking.appointmentTime.startTime
                      )} - ${formatTime(
                        selectedBooking.appointmentTime.endTime
                      )}`
                    : "N/A",
              },
              {
                icon: <InfoCircleOutlined />,
                label: "Dịch vụ",
                value: selectedBooking.serviceDetails?.isInspectionOnly
                  ? "Mang xe tới kiểm tra"
                  : selectedBooking.serviceType?.name || "N/A",
              },
              {
                icon: <EnvironmentOutlined />,
                label: "Trung tâm",
                value: selectedBooking.serviceCenter?.name || "N/A",
              },
              {
                icon: <CheckCircleOutlined />,
                label: "Trạng thái",
                value: getStatusTag(selectedBooking.status),
                status: true,
              },
              {
                icon: <EditOutlined />,
                label: "Mô tả",
                value: selectedBooking.serviceDetails?.description || "N/A",
              },
              ...(selectedBooking.feedback
                ? [
                    {
                      icon: <StarOutlined />,
                      label: "Đánh giá trung bình",
                      value: (() => {
                        const avg = getAverageDetailedRating(
                          selectedBooking.feedback || {}
                        );
                        return (
                          <div
                            className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                            onClick={() => openFeedback(selectedBooking)}
                            title="Bấm để xem chi tiết đánh giá">
                            <StarRating
                              rating={avg}
                              size="small"
                              showNumber={true}
                            />
                          </div>
                        );
                      })(),
                      status: true,
                    },
                    {
                      icon: <MessageOutlined />,
                      label: "Nhận xét",
                      value:
                        selectedBooking.feedback.comment || "Không có nhận xét",
                    },
                  ]
                : []),
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="text-blue-600 mt-1">{item.icon}</div>
                <div className="flex-1">
                  <Text type="secondary" className="block text-sm">
                    {item.label}
                  </Text>
                  {item.status ? (
                    item.value
                  ) : (
                    <Text strong className="block">
                      {item.value}
                    </Text>
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
        width={800}>
        {progressLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Spin size="large" />
            <Text className="mt-4">Đang tải dữ liệu...</Text>
          </div>
        ) : progressData?.notFound ? (
          <Alert
            message="Chưa có tiến độ"
            description="Booking này chưa có tiến độ làm việc. Vui lòng chờ kỹ thuật viên bắt đầu công việc."
            type="info"
            showIcon
            className="mb-4"
          />
        ) : (
          <div className="space-y-4">
            {(() => {
              const iq =
                (progressData?.appointmentId as any)?.inspectionAndQuote ||
                (progressData as any)?.inspectionAndQuote ||
                (progressData as any)?.quote ||
                {};
              const formatCurrency = (v: number) =>
                new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(v || 0));
              return (
                <Card title="Thông tin kiểm tra & báo giá" className="mb-4">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Text type="secondary" className="block text-xs">
                        Ghi chú kiểm tra
                      </Text>
                      <Text className="block">{iq.inspectionNotes || "-"}</Text>
                    </Col>
                    <Col xs={24} md={12}>
                      <Text type="secondary" className="block text-xs">
                        Hoàn thành kiểm tra lúc
                      </Text>
                      <Text className="block">
                        {iq.inspectionCompletedAt
                          ? new Date(iq.inspectionCompletedAt).toLocaleString()
                          : "-"}
                      </Text>
                    </Col>
                    <Col xs={24} md={12}>
                      <Text type="secondary" className="block text-xs">
                        Tình trạng xe
                      </Text>
                      <Text className="block">
                        {iq.vehicleCondition || "-"}
                      </Text>
                    </Col>
                    <Col xs={24} md={12}>
                      <Text type="secondary" className="block text-xs">
                        Chi tiết chẩn đoán
                      </Text>
                      <Text className="block">
                        {iq.diagnosisDetails || "-"}
                      </Text>
                    </Col>
                    <Col xs={24} md={12}>
                      <Text type="secondary" className="block text-xs">
                        Trạng thái báo giá
                      </Text>
                      {(() => {
                        const qs = String(
                          iq.quoteStatus || "pending"
                        ).toLowerCase();
                        const qc = QUOTE_STATUS_CONFIG[qs] || {
                          color: "#8c8c8c",
                          label: qs,
                        };
                        return (
                          <Tag
                            style={{ borderColor: qc.color, color: qc.color }}>
                            {qc.label}
                          </Tag>
                        );
                      })()}
                    </Col>
                  </Row>
                  <Divider />
                  <div>
                    <Text strong className="block mb-2">
                      Chi tiết báo giá
                    </Text>
                    {(() => {
                      const qd: any = iq.quoteDetails;
                      if (!qd) {
                        return <Text className="block">-</Text>;
                      }
                      if (typeof qd === "string") {
                        return (
                          <div className="space-y-3">
                            <Text className="block">{qd}</Text>
                            {Boolean(iq.quoteAmount) && (
                              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                                <Text strong className="text-blue-700">
                                  Tổng cộng
                                </Text>
                                <Text
                                  strong
                                  className="text-blue-700"
                                  style={{ fontSize: 20 }}>
                                  {formatCurrency(Number(iq.quoteAmount || 0))}
                                </Text>
                              </div>
                            )}
                          </div>
                        );
                      }
                      const items = Array.isArray(qd.items) ? qd.items : [];
                      const labor = qd.labor || {};
                      const laborMinutes = Number(labor.minutes || 0);
                      const laborRate = Number(labor.rate || 0);
                      const laborCost = laborMinutes * laborRate;
                      const itemsTotal = items.reduce(
                        (sum: number, it: any) =>
                          sum +
                          Number(it.quantity || 0) * Number(it.unitPrice || 0),
                        0
                      );
                      const grandTotal = Number(itemsTotal + laborCost);

                      return (
                        <div className="space-y-3">
                          {items.length > 0 && (
                            <div>
                              <Text type="secondary" className="block text-xs">
                                Linh kiện
                              </Text>
                              <ul className="list-disc list-inside space-y-1">
                                {items.map((it: any, idx: number) => {
                                  const qty = Number(it.quantity || 0);
                                  const unit = Number(it.unitPrice || 0);
                                  const lineTotal = qty * unit;
                                  return (
                                    <li
                                      key={`${
                                        it.partId || it.name || idx
                                      }-${idx}`}>
                                      <Text>
                                        {it.name || it.partId || "Linh kiện"} x
                                        {qty > 0 ? qty : 1} —{" "}
                                        {formatCurrency(unit)} / cái
                                        {lineTotal > 0 && (
                                          <span>
                                            {" "}
                                            (Tổng: {formatCurrency(lineTotal)})
                                          </span>
                                        )}
                                      </Text>
                                    </li>
                                  );
                                })}
                              </ul>
                              <div className="flex items-center justify-end mt-1">
                                <Text type="secondary">
                                  Tạm tính linh kiện:&nbsp;
                                </Text>
                                <Text strong>{formatCurrency(itemsTotal)}</Text>
                              </div>
                            </div>
                          )}
                          {(laborMinutes > 0 || laborRate > 0) && (
                            <div>
                              <Text type="secondary" className="block text-xs">
                                Công thợ
                              </Text>
                              <Text>
                                {laborMinutes} phút x{" "}
                                {formatCurrency(laborRate)} ={" "}
                                {formatCurrency(laborCost)}
                              </Text>
                            </div>
                          )}
                          {items.length === 0 &&
                            !(laborMinutes > 0 || laborRate > 0) && (
                              <Text className="block">-</Text>
                            )}
                          <Divider className="my-2" />
                          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                            <Text strong className="text-blue-700">
                              Tổng cộng
                            </Text>
                            <Text
                              strong
                              className="text-blue-700"
                              style={{ fontSize: 22 }}>
                              {formatCurrency(
                                grandTotal > 0
                                  ? grandTotal
                                  : Number(iq.quoteAmount || 0)
                              )}
                            </Text>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </Card>
              );
            })()}

            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} md={12}>
                <Card size="small">
                  <Text type="secondary" className="block text-xs mb-1">
                    Trạng thái hiện tại
                  </Text>
                  {(() => {
                    const st = String(
                      (progressData as any)?.currentStatus || ""
                    ).toLowerCase();
                    const cfg = STATUS_CONFIG[st] || {
                      color: "default",
                      icon: <InfoCircleOutlined />,
                      label: st.split("_").join(" "),
                    };
                    // Compute hex from the status key, not the localized label, to avoid default gray
                    const hex = getStatusColor(st.split("_").join(" "));
                    return (
                      <Tag
                        icon={cfg.icon}
                        style={{ borderColor: hex, color: hex }}>
                        {cfg.label}
                      </Tag>
                    );
                  })()}
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small">
                  <Text type="secondary" className="block text-xs mb-1">
                    Trạng thái báo giá
                  </Text>
                  {(() => {
                    const qs = String(
                      (progressData as any)?.appointmentId?.inspectionAndQuote
                        ?.quoteStatus ||
                        (progressData as any)?.quote?.quoteStatus ||
                        "pending"
                    ).toLowerCase();
                    const qc = QUOTE_STATUS_CONFIG[qs] || {
                      color: "#8c8c8c",
                      label: qs,
                    };
                    return (
                      <Tag style={{ borderColor: qc.color, color: qc.color }}>
                        {qc.label}
                      </Tag>
                    );
                  })()}
                </Card>
              </Col>
            </Row>

            {Array.isArray(progressData?.milestones) &&
              progressData.milestones.length > 0 && (
                <Card title="Các mốc tiến độ" className="mb-4">
                  <div className="space-y-3">
                    {progressData.milestones.map(
                      (m: Record<string, any>, idx: number) => (
                        <div
                          key={m._id || `${m.name}-${idx}`}
                          className="relative pl-6 border-l border-gray-200">
                          <span className="absolute -left-1.5 top-2 w-3 h-3 rounded-full bg-blue-500" />
                          <div>
                            <Text strong className="block">
                              {m.name}
                            </Text>
                            <Text type="secondary" className="block">
                              {m.description || "-"}
                            </Text>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </Card>
              )}

            {(() => {
              const currentStatus = String(
                (progressData as any)?.currentStatus || ""
              ).toLowerCase();
              const quoteStatus = String(
                (progressData as any)?.appointmentId?.inspectionAndQuote
                  ?.quoteStatus ||
                  (progressData as any)?.quote?.quoteStatus ||
                  "pending"
              ).toLowerCase();
              const canRespond =
                currentStatus !== "completed" && quoteStatus === "pending";
              return canRespond;
            })() && (
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
                    loading={progressLoading}>
                    Chấp nhận
                  </Button>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => submitQuoteResponse("rejected")}
                    loading={progressLoading}>
                    Từ chối
                  </Button>
                </Space>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Quote Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <TagOutlined />
            Báo giá
          </div>
        }
        open={quoteModalOpen}
        onCancel={closeQuoteModal}
        footer={null}
        width={760}>
        {quoteLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Spin size="large" />
            <Text className="mt-4">Đang tải báo giá...</Text>
          </div>
        ) : quoteData?.notFound ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <Text className="text-yellow-800">
              {String(
                quoteData?.message || "Không tìm thấy báo giá cho lịch hẹn này"
              )}
            </Text>
          </div>
        ) : (
          <div className="space-y-4">
            {(() => {
              const qwrap = quoteData || {};
              const quote: any = (qwrap as any).quote || qwrap;
              const quoteStatus = String(quote?.quoteStatus || "pending").toLowerCase();
              const quoteDetails: any = quote?.quoteDetails;
              const hasQuoteItems = quoteDetails && 
                Array.isArray(quoteDetails.items) && 
                quoteDetails.items.length > 0;
              
              // Check if quote actually exists (has items)
              const hasQuote = hasQuoteItems || (quoteDetails && typeof quoteDetails === "string" && quoteDetails.trim() !== "");
              
              // If quoteStatus is pending and no quote items, show message
              if (quoteStatus === "pending" && !hasQuote) {
                return (
                  <Alert
                    message="Chưa có báo giá"
                    description="Booking này chưa có báo giá. Vui lòng chờ kỹ thuật viên gửi báo giá."
                    type="info"
                    showIcon
                    className="mb-4"
                  />
                );
              }
              
              const formatCurrency = (v: number) =>
                new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(v || 0));
              const qd: any = quote?.quoteDetails;
              const items = qd && Array.isArray(qd.items) ? qd.items : [];
              const itemsTotal = items.reduce(
                (sum: number, it: any) =>
                  sum +
                  Number(it.quantity || 0) * Number(it.unitPrice || 0),
                0
              );
              
              // Get booking info for invoice
              const currentBooking = currentAppointmentId 
                ? bookingsArray.find((b: Booking) => {
                    const appts = (b as any).appointments || [];
                    return appts.some((a: any) => a._id === currentAppointmentId);
                  })
                : null;
              const serviceCenter = currentBooking?.serviceCenter || (qwrap as any)?.serviceCenter;
              const customer = (qwrap as any)?.customer || (currentBooking as any)?.customer;
              
              return (
                <div className="bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
                  {/* Invoice Header */}
                  <div className="border-b-2 border-gray-300 pb-4 mb-6">
                    <Row gutter={24}>
                      <Col xs={24} md={12}>
                        <div>
                          <Text strong style={{ fontSize: 28, color: '#1890ff' }} className="block mb-2">
                            EV CARE
                          </Text>
                          <Text type="secondary" className="block text-sm">
                            {serviceCenter?.name || "Trung tâm dịch vụ"}
                          </Text>
                          {serviceCenter?.address && (
                            <>
                              <Text className="block text-sm">
                                {serviceCenter.address.street}
                              </Text>
                              <Text className="block text-sm">
                                {serviceCenter.address.ward}, {serviceCenter.address.district}
                              </Text>
                              <Text className="block text-sm">
                                {serviceCenter.address.city}
                              </Text>
                            </>
                          )}
                          {serviceCenter?.contact && (
                            <>
                              <Text className="block text-sm mt-2">
                                Điện thoại: {serviceCenter.contact.phone}
                              </Text>
                              <Text className="block text-sm">
                                Email: {serviceCenter.contact.email}
                              </Text>
                            </>
                          )}
                        </div>
                      </Col>
                      <Col xs={24} md={12} className="text-right">
                        <div>
                          <Text strong style={{ fontSize: 24 }} className="block mb-4">
                            BÁO GIÁ DỊCH VỤ
                          </Text>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <Text type="secondary">Số báo giá:</Text>
                              <Text strong>#{currentAppointmentId?.slice(-8) || "N/A"}</Text>
                            </div>
                            <div className="flex justify-between">
                              <Text type="secondary">Ngày báo giá:</Text>
                              <Text>
                                {quote?.quotedAt 
                                  ? new Date(quote.quotedAt).toLocaleDateString("vi-VN")
                                  : quote?.inspectionCompletedAt
                                  ? new Date(quote.inspectionCompletedAt).toLocaleDateString("vi-VN")
                                  : new Date().toLocaleDateString("vi-VN")}
                              </Text>
                            </div>
                            <div className="flex justify-between">
                              <Text type="secondary">Trạng thái:</Text>
                              {(() => {
                                const qs = String(quote?.quoteStatus || "pending").toLowerCase();
                                const qc = QUOTE_STATUS_CONFIG[qs] || { color: "#8c8c8c", label: qs };
                                return (
                                  <Tag style={{ borderColor: qc.color, color: qc.color }}>
                                    {qc.label}
                                  </Tag>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Customer & Vehicle Info */}
                  <div className="mb-6">
                    <Row gutter={24}>
                      <Col xs={24} md={12}>
                        <div className="bg-gray-50 p-4 rounded">
                          <Text strong className="block mb-2">Thông tin khách hàng</Text>
                          {typeof customer === 'object' && customer ? (
                            <>
                              <Text className="block text-sm">{customer.fullName || customer.email || "N/A"}</Text>
                              {customer.phone && <Text className="block text-sm">ĐT: {customer.phone}</Text>}
                              {customer.email && <Text className="block text-sm">Email: {customer.email}</Text>}
                            </>
                          ) : (
                            <Text className="block text-sm">Khách hàng</Text>
                          )}
                        </div>
                      </Col>
                      <Col xs={24} md={12}>
                        <div className="bg-gray-50 p-4 rounded">
                          <Text strong className="block mb-2">Thông tin xe</Text>
                          <Text className="block text-sm">
                            {quote?.vehicleCondition ? `Tình trạng: ${quote.vehicleCondition}` : "N/A"}
                          </Text>
                          {quote?.diagnosisDetails && (
                            <Text className="block text-sm mt-1">
                              Chẩn đoán: {quote.diagnosisDetails}
                            </Text>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Inspection Notes */}
                  {quote?.inspectionNotes && (
                    <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                      <Text strong className="block mb-2">Ghi chú kiểm tra</Text>
                      <Text className="text-sm">{quote.inspectionNotes}</Text>
                      {quote?.inspectionCompletedAt && (
                        <Text type="secondary" className="block text-xs mt-2">
                          Hoàn thành kiểm tra: {new Date(quote.inspectionCompletedAt).toLocaleString("vi-VN")}
                        </Text>
                      )}
                    </div>
                  )}

                  {/* Items Table */}
                  {items.length > 0 && (
                    <div className="mb-6">
                      <Text strong style={{ fontSize: 18 }} className="block mb-4">
                        Chi tiết báo giá
                      </Text>
                      <div className="border border-gray-300 rounded">
                        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 px-4 py-3 text-left">
                                <Text strong>STT</Text>
                              </th>
                              <th className="border border-gray-300 px-4 py-3 text-left">
                                <Text strong>Tên linh kiện</Text>
                              </th>
                              <th className="border border-gray-300 px-4 py-3 text-center">
                                <Text strong>Số lượng</Text>
                              </th>
                              <th className="border border-gray-300 px-4 py-3 text-right">
                                <Text strong>Đơn giá</Text>
                              </th>
                              <th className="border border-gray-300 px-4 py-3 text-right">
                                <Text strong>Thành tiền</Text>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((it: any, idx: number) => {
                              const qty = Number(it.quantity || 0);
                              const unit = Number(it.unitPrice || 0);
                              const lineTotal = qty * unit;
                              return (
                                <tr key={`${it.partId || it.name || idx}-${idx}`}>
                                  <td className="border border-gray-300 px-4 py-3">
                                    <Text>{idx + 1}</Text>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3">
                                    <Text strong>{it.name || it.partId || "Linh kiện"}</Text>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center">
                                    <Text>{qty > 0 ? qty : 1}</Text>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-right">
                                    <Text>{formatCurrency(unit)}</Text>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-right">
                                    <Text strong>{formatCurrency(lineTotal)}</Text>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Total Section */}
                  {items.length > 0 && (
                    <div className="mb-6">
                      <Row gutter={24}>
                        <Col xs={24} md={12}></Col>
                        <Col xs={24} md={12}>
                          <div className="border border-gray-300 rounded p-4 bg-gray-50">
                            <div className="flex justify-between items-center mb-2">
                              <Text strong style={{ fontSize: 16 }}>Tạm tính:</Text>
                              <Text style={{ fontSize: 16 }}>{formatCurrency(itemsTotal)}</Text>
                            </div>
                            <Divider className="my-2" />
                            <div className="flex justify-between items-center">
                              <Text strong style={{ fontSize: 20, color: '#1890ff' }}>TỔNG CỘNG:</Text>
                              <Text strong style={{ fontSize: 24, color: '#1890ff' }}>
                                {formatCurrency(Number(quote?.quoteAmount || itemsTotal))}
                              </Text>
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-300">
                              <Text type="secondary" className="text-xs">
                                (Bằng chữ: {(() => {
                                  const amount = Number(quote?.quoteAmount || itemsTotal);
                                  // Simple number to words conversion (basic)
                                  return `${amount.toLocaleString('vi-VN')} đồng`;
                                })()})
                              </Text>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="border-t-2 border-gray-300 pt-4 mt-6">
                    <Row gutter={24}>
                      <Col xs={24} md={12}>
                        <Text type="secondary" className="text-xs block">
                          <Text strong>Ghi chú:</Text> Báo giá này có hiệu lực trong vòng 7 ngày kể từ ngày phát hành.
                        </Text>
                      </Col>
                      <Col xs={24} md={12} className="text-right">
                        <div className="mt-4">
                          <Text type="secondary" className="block text-sm mb-2">
                            Người lập báo giá
                          </Text>
                          <div className="border-t border-gray-300 pt-2 inline-block" style={{ minWidth: 200 }}>
                            <Text className="text-sm">Kỹ thuật viên</Text>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              );
            })()}

            {(() => {
              const qwrap = quoteData || {};
              const quote: any = (qwrap as any).quote || qwrap;
              const status = String(
                quote?.quoteStatus || "pending"
              ).toLowerCase();
              const quoteDetails: any = quote?.quoteDetails;
              const hasQuoteItems = quoteDetails && 
                Array.isArray(quoteDetails.items) && 
                quoteDetails.items.length > 0;
              const hasQuote = hasQuoteItems || (quoteDetails && typeof quoteDetails === "string" && quoteDetails.trim() !== "");
              
              // Only show response section if quote exists and status is pending
              const canRespond = status === "pending" && hasQuote;
              return canRespond;
            })() && (
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
                    onClick={async () => {
                      if (!currentAppointmentId) return;
                      setQuoteLoading(true);
                      const action = await dispatch(
                        respondAppointmentQuote({
                          appointmentId: currentAppointmentId,
                          status: "approved",
                          notes: quoteResponseNotes,
                        }) as any
                      );
                      if (action.type.endsWith("/fulfilled")) {
                        await fetchBookings();
                        message.success("Chấp nhận báo giá thành công");
                        closeQuoteModal();
                      } else {
                        message.error("Cập nhật thất bại");
                      }
                      setQuoteLoading(false);
                    }}
                    loading={quoteLoading}>
                    Chấp nhận
                  </Button>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={async () => {
                      if (!currentAppointmentId) return;
                      setQuoteLoading(true);
                      const action = await dispatch(
                        respondAppointmentQuote({
                          appointmentId: currentAppointmentId,
                          status: "rejected",
                          notes: quoteResponseNotes,
                        }) as any
                      );
                      if (action.type.endsWith("/fulfilled")) {
                        await fetchBookings();
                        message.success("Từ chối báo giá thành công");
                        closeQuoteModal();
                      } else {
                        message.error("Cập nhật thất bại");
                      }
                      setQuoteLoading(false);
                    }}
                    loading={quoteLoading}>
                    Từ chối
                  </Button>
                </Space>
              </Card>
            )}
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
            loading={loading}>
            Xác nhận
          </Button>,
        ]}
        width={500}>
        <div className="space-y-4">
          <div>
            <Text strong className="block mb-2">
              <CalendarOutlined />
              Ngày mới
            </Text>
            <DatePicker
              style={{ width: "100%" }}
              value={newDate ? dayjs(newDate) : null}
              onChange={(date) =>
                setNewDate(date ? date.format("YYYY-MM-DD") : "")
              }
            />
          </div>

          <div>
            <Text strong className="block mb-2">
              <ClockCircleOutlined />
              Khung giờ mới
            </Text>
            <Select
              style={{ width: "100%" }}
              placeholder={
                loadingSlots ? "Đang tải khung giờ..." : "Chọn khung giờ"
              }
              value={selectedSlot}
              onChange={setSelectedSlot}
              loading={loadingSlots}>
              {availableSlots.map((slot, idx) => (
                <Option key={`${slot.startTime}-${idx}`} value={slot.startTime}>
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </Option>
              ))}
            </Select>
            {!loadingSlots && availableSlots.length === 0 && newDate && (
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
            loading={loading}>
            Xác nhận hủy
          </Button>,
        ]}
        width={500}>
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <ExclamationCircleOutlined className="text-red-500 text-xl" />
              <div>
                <Text strong className="text-red-800 block">
                  Cảnh báo
                </Text>
                <Text className="text-red-700">
                  Hành động này không thể hoàn tác. Lịch hẹn của bạn sẽ bị hủy.
                </Text>
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

      {/* Feedback Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <StarOutlined />
            {isViewingFeedback
              ? "Đánh giá của bạn (Đã hoàn thành)"
              : "Đánh giá dịch vụ"}
          </div>
        }
        open={isFeedbackOpen}
        onCancel={closeFeedback}
        footer={
          isViewingFeedback
            ? [
                <Button key="close" onClick={closeFeedback}>
                  Đóng
                </Button>,
              ]
            : [
                <Button key="cancel" onClick={closeFeedback}>
                  Hủy
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  icon={<StarOutlined />}
                  onClick={submitFeedback}
                  loading={loading}
                  disabled={!feedbackData.overall || feedbackData.overall < 1}>
                  Gửi đánh giá
                </Button>,
              ]
        }
        width={600}>
        {selectedBooking && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <InfoCircleOutlined className="text-blue-500 text-xl" />
                <div>
                  <Text strong className="text-blue-800 block">
                    Thông tin lịch hẹn
                  </Text>
                  <Text className="text-blue-700">
                    {selectedBooking.serviceType?.name ||
                      "Mang xe tới kiểm tra"}{" "}
                    - {selectedBooking.serviceCenter?.name}
                  </Text>
                  <Text className="text-blue-600 text-sm">
                    {formatDate(selectedBooking.appointmentTime.date)} -{" "}
                    {formatTime(
                      selectedBooking.appointmentTime.startTime || ""
                    )}
                  </Text>
                </div>
              </div>
            </div>

            {isViewingFeedback && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircleOutlined className="text-green-500 text-xl" />
                  <div>
                    <Text strong className="text-green-800 block">
                      Đánh giá đã hoàn thành
                    </Text>
                    <Text className="text-green-700">
                      Cảm ơn bạn đã đánh giá dịch vụ. Đánh giá này không thể
                      chỉnh sửa.
                    </Text>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Text strong className="block mb-2">
                  Đánh giá tổng thể{" "}
                  {!isViewingFeedback && (
                    <span className="text-red-500">*</span>
                  )}
                </Text>
                <StarRating
                  rating={feedbackData.overall}
                  size="large"
                  showNumber={true}
                  interactive={!isViewingFeedback}
                  onRatingChange={
                    !isViewingFeedback
                      ? (rating) =>
                          setFeedbackData((prev) => ({
                            ...prev,
                            overall: rating,
                          }))
                      : undefined
                  }
                />
                {!isViewingFeedback && feedbackData.overall < 1 && (
                  <Text type="danger" className="text-sm">
                    Vui lòng đánh giá tổng thể
                  </Text>
                )}
              </div>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div>
                    <Text strong className="block mb-2">
                      Chất lượng dịch vụ
                    </Text>
                    <StarRating
                      rating={feedbackData.service}
                      size="default"
                      showNumber={true}
                      interactive={!isViewingFeedback}
                      onRatingChange={
                        !isViewingFeedback
                          ? (rating) =>
                              setFeedbackData((prev) => ({
                                ...prev,
                                service: rating,
                              }))
                          : undefined
                      }
                    />
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div>
                    <Text strong className="block mb-2">
                      Thái độ kỹ thuật viên
                    </Text>
                    <StarRating
                      rating={feedbackData.technician}
                      size="default"
                      showNumber={true}
                      interactive={!isViewingFeedback}
                      onRatingChange={
                        !isViewingFeedback
                          ? (rating) =>
                              setFeedbackData((prev) => ({
                                ...prev,
                                technician: rating,
                              }))
                          : undefined
                      }
                    />
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div>
                    <Text strong className="block mb-2">
                      Cơ sở vật chất
                    </Text>
                    <StarRating
                      rating={feedbackData.facility}
                      size="default"
                      showNumber={true}
                      interactive={!isViewingFeedback}
                      onRatingChange={
                        !isViewingFeedback
                          ? (rating) =>
                              setFeedbackData((prev) => ({
                                ...prev,
                                facility: rating,
                              }))
                          : undefined
                      }
                    />
                  </div>
                </Col>
              </Row>

              <div>
                <Text strong className="block mb-2">
                  <MessageOutlined className="mr-2" />
                  Nhận xét của bạn
                </Text>
                {isViewingFeedback ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[100px]">
                    <Text className="text-gray-800">
                      {feedbackData.comment || "Không có nhận xét"}
                    </Text>
                  </div>
                ) : (
                  <TextArea
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ..."
                    value={feedbackData.comment}
                    onChange={(e) =>
                      setFeedbackData((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                  />
                )}
              </div>

              {isViewingFeedback && selectedBooking.feedback?.submittedAt && (
                <div className="text-right">
                  <Text type="secondary" className="text-sm">
                    Đánh giá lúc:{" "}
                    {new Date(
                      selectedBooking.feedback.submittedAt
                    ).toLocaleString("vi-VN")}
                  </Text>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default BookingHistory;

