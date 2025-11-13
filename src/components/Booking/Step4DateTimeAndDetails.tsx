import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  DatePicker,
  Radio,
  message,
  Spin,
  TimePicker,
} from "antd";
import {
  Calendar,
  Clock,
  FileText,
  ArrowLeft,
  CheckCircle,
  CreditCard,
  MapPin,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../services/store/store";
import {
  fetchAvailableTimeSlots,
  updateBookingData,
  createBooking,
  resetBooking,
} from "../../services/features/booking/bookingSlice";
import { clearCurrentPayment } from "../../services/features/payment/paymentSlice";
import PaymentModal from "../Payment/PaymentModal";
import { TimeSlot } from "../../interfaces/booking";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  getNextOpeningTime,
  isTimeSlotPassed,
  getCurrentDate,
} from "../../lib/timeUtils";

const { TextArea } = Input;

interface Step4DateTimeAndDetailsProps {
  onPrev: () => void;
}

const Step4DateTimeAndDetails: React.FC<Step4DateTimeAndDetailsProps> = ({
  onPrev,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    selectedService,
    selectedServicePackage,
    selectedVehicle,
    availableTimeSlots,
    loading,
    createBookingLoading,
    bookingData,
  } = useAppSelector((state) => state.booking);
  // Read selected service center from serviceCenter slice
  const selectedServiceCenter = useAppSelector(
    (state) => state.serviceCenter.selectedServiceCenter
  );
  const isInspectionOnlyFromState =
    useAppSelector((s) => s.booking.bookingData.isInspectionOnly) || false;

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [serviceDescription, setServiceDescription] = useState<string>("");
  const [paymentPreference, setPaymentPreference] = useState<
    "online" | "offline"
  >("offline");

  // Time slot filtering (deprecated, kept previously). Removed in favor of TimePicker

  // Payment modal state
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [bookingResponse, setBookingResponse] = useState<{
    success: boolean;
    message: string;
    data: {
      requiresPayment: boolean;
      payment?: {
        paymentId: string;
        orderCode: string | number;
        paymentLink: string;
        qrCode: string;
        checkoutUrl: string;
        amount: number | string;
        expiresAt: string;
      };
      appointment: {
        _id: string;
      };
    };
  } | null>(null);

  // Fetch available time slots when date changes
  useEffect(() => {
    if (selectedDate && selectedServiceCenter?._id) {
      dispatch(
        fetchAvailableTimeSlots({
          serviceCenterId: selectedServiceCenter._id,
          date: selectedDate,
        })
      );
    }
  }, [dispatch, selectedDate, selectedServiceCenter?._id]);

  // Update booking data when form changes - avoid infinite loops by checking if values actually changed
  useEffect(() => {
    const newBookingData = {
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      serviceDescription,
      paymentPreference,
    };

    // Only dispatch if any value has actually changed
    const hasChanges = Object.keys(newBookingData).some((key) => {
      const currentValue = newBookingData[key as keyof typeof newBookingData];
      const existingValue = bookingData[key as keyof typeof bookingData];
      return currentValue !== existingValue;
    });

    if (hasChanges) {
      dispatch(updateBookingData(newBookingData));
    }
  }, [
    dispatch,
    selectedDate,
    selectedTime,
    serviceDescription,
    paymentPreference,
    bookingData,
  ]);

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      // Convert to Vietnam timezone and format
      const formattedDate = date.tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");
      setSelectedDate(formattedDate);
      setSelectedTime(""); // Reset time when date changes
      // reset any previous slot state (deprecated)

      // Fetch available time slots when date changes
      if (selectedServiceCenter?._id) {
        dispatch(
          fetchAvailableTimeSlots({
            serviceCenterId: selectedServiceCenter._id,
            date: formattedDate,
          })
        );
      }
    } else {
      setSelectedDate("");
      setSelectedTime("");
      // reset any previous slot state (deprecated)
    }
  };

  // Deprecated: slot grid selection replaced by TimePicker
  // const handleTimeSelect = (timeSlot: string) => {
  //     setSelectedTime(timeSlot);
  //     const startTime = timeSlot.split('-')[0];
  //     dispatch(updateBookingData({ appointmentTime: startTime }));
  // };

  // Determine if a given slot is selectable (has technicians and not in the past)
  function isTimeSlotAvailable(slot: TimeSlot) {
    const hasTechnicians =
      slot.availableTechnicians && slot.availableTechnicians.length > 0;
    const timeSlotString = `${slot.startTime}-${slot.endTime}`;
    const isPassed = isTimeSlotPassed(timeSlotString, selectedDate);
    return hasTechnicians && !isPassed;
  }

  // Build allowed time set from available slots (only future and with technicians)
  const getAllowedTimes = () => {
    if (!selectedDate || !availableTimeSlots?.length) return new Set<string>();
    const allowed = new Set<string>();
    availableTimeSlots.forEach((slot) => {
      if (isTimeSlotAvailable(slot)) {
        allowed.add(slot.startTime);
      }
    });
    return allowed;
  };

  const allowedTimes = getAllowedTimes();

  const disabledHours = () => {
    const allowedHours = new Set<number>(
      [...allowedTimes].map((t) => parseInt(t.split(":")[0]))
    );
    const hours: number[] = [];
    for (let h = 0; h < 24; h++) {
      if (!allowedHours.has(h)) hours.push(h);
    }
    return hours;
  };

  const disabledMinutes = (selectedHour: number) => {
    const minutesAllowed = new Set<number>(
      [...allowedTimes]
        .filter((t) => parseInt(t.split(":")[0]) === selectedHour)
        .map((t) => parseInt(t.split(":")[1]))
    );
    const minutes: number[] = [];
    for (let m = 0; m < 60; m++) {
      if (!minutesAllowed.has(m)) minutes.push(m);
    }
    return minutes;
  };

  const disabledTime = (now: dayjs.Dayjs | null) => {
    return {
      disabledHours,
      disabledMinutes: (hour: number) =>
        disabledMinutes(hour ?? (now ? now.hour() : 0)),
    } as const;
  };

  const handleTimeChange = (time: dayjs.Dayjs | null) => {
    if (!time) {
      setSelectedTime("");
      return;
    }
    const start = time.format("HH:mm");
    setSelectedTime(start);
    dispatch(updateBookingData({ appointmentTime: start }));
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      message.error("Vui lòng chọn ngày và giờ");
      return;
    }

    if (!serviceDescription.trim()) {
      message.error("Vui lòng nhập mô tả dịch vụ");
      return;
    }

    if (
      !selectedVehicle ||
      !selectedServiceCenter ||
      (!selectedService &&
        !selectedServicePackage &&
        !isInspectionOnlyFromState)
    ) {
      message.error("Thiếu thông tin cần thiết");
      return;
    }

    const finalBookingData = {
      customerId: selectedVehicle.owner,
      vehicleId: selectedVehicle._id,
      serviceCenterId: selectedServiceCenter._id,
      serviceTypeId: selectedService?._id,
      servicePackageId: selectedServicePackage?._id,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime, // Use selected start time
      serviceDescription: serviceDescription.trim(),
      paymentPreference,
      isInspectionOnly: isInspectionOnlyFromState,
    };

    try {
      const response = await dispatch(createBooking(finalBookingData)).unwrap();

      // Check if payment is required
      if (response.data.requiresPayment && response.data.payment) {
        // Store booking response for payment modal
        setBookingResponse(response);
        setPaymentModalVisible(true);
        message.info("Vui lòng thanh toán để xác nhận đặt lịch");
      } else if (paymentPreference === "online") {
        // If user selected online payment but no payment required, show error
        message.error("Không thể tạo thanh toán trực tuyến. Vui lòng thử lại.");
      } else {
        // No payment required, booking is complete
        message.success("Đặt lịch thành công!");
        dispatch(resetBooking());
        navigate("/customer/bookings");
      }
    } catch (error: unknown) {
      message.error((error as string) || "Có lỗi xảy ra khi đặt lịch");
    }
  };

  const handlePaymentSuccess = () => {
    message.success("Thanh toán thành công! Đặt lịch đã được xác nhận.");
    setPaymentModalVisible(false);
    dispatch(clearCurrentPayment()); // Clear payment state
    dispatch(resetBooking());
    navigate("/payment/success");
  };

  const handlePaymentModalCancel = () => {
    setPaymentModalVisible(false);
    // Optionally redirect to booking history or home
    navigate("/customer/bookings");
  };

  const isDateDisabled = (current: dayjs.Dayjs) => {
    // Disable past dates using Vietnam timezone
    const currentDate = getCurrentDate();
    const selectedDateStr = current.format("YYYY-MM-DD");
    return current && selectedDateStr < currentDate;
  };

  // (moved above getAllowedTimes)

  // Deprecated: tooltip reason for disabled time slot
  // const getTimeSlotReason = (slot: TimeSlot) => { ... };

  // Check if service center is open on selected date
  const isServiceCenterOpenOnDate = (date: string) => {
    if (!selectedServiceCenter?.operatingHours || !date) {
      return false;
    }

    // Use Vietnam timezone for day calculation
    const selectedDay = dayjs.tz(date, "Asia/Ho_Chi_Minh").day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dayMap = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayName = dayMap[
      selectedDay
    ] as keyof typeof selectedServiceCenter.operatingHours;
    const dayHours = selectedServiceCenter.operatingHours[dayName];

    return dayHours && dayHours.isOpen;
  };

  // Get next opening time for selected date
  const getNextOpeningForDate = (date: string) => {
    if (!selectedServiceCenter?.operatingHours || !date) {
      return null;
    }

    // Use Vietnam timezone for day calculation
    const selectedDay = dayjs.tz(date, "Asia/Ho_Chi_Minh").day();
    const dayMap = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayName = dayMap[
      selectedDay
    ] as keyof typeof selectedServiceCenter.operatingHours;
    const dayHours = selectedServiceCenter.operatingHours[dayName];

    if (dayHours && dayHours.isOpen) {
      return `Mở cửa từ ${dayHours.open} - ${dayHours.close}`;
    }

    // Find next opening day
    return getNextOpeningTime(selectedServiceCenter.operatingHours);
  };

  // Filter time slots by period
  // Deprecated: slot filtering replaced by TimePicker
  // const getFilteredTimeSlots = () => { ... };

  // Deprecated: filter labels for slot pills
  // const getTimeFilterLabel = (filter: string) => { ... };

  // Deprecated: filter counts for slot pills
  // const getTimeFilterCount = (filter: string) => { ... };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Thông tin cuối cùng
        </h2>
        <p className="text-gray-600">
          Chọn ngày giờ và cung cấp thông tin bổ sung
        </p>
      </div>

      {/* Payment Info Banner removed: only pay at center is allowed */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Date & Time Selection */}
        <div className="space-y-6">
          {/* Date Selection */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span>Chọn ngày</span>
            </h3>
            <DatePicker
              placeholder="Chọn ngày hẹn"
              value={
                selectedDate ? dayjs.tz(selectedDate, "Asia/Ho_Chi_Minh") : null
              }
              onChange={handleDateChange}
              disabledDate={isDateDisabled}
              className="w-full h-12"
              format="DD/MM/YYYY"
            />
          </Card>

          {/* Time Selection */}
          {selectedDate && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-500" />
                <span>Chọn giờ</span>
              </h3>

              {/* Check if service center is open on selected date */}
              {!isServiceCenterOpenOnDate(selectedDate) ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-red-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Trung tâm không hoạt động
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Trung tâm đóng cửa vào ngày{" "}
                    {dayjs
                      .tz(selectedDate, "Asia/Ho_Chi_Minh")
                      .format("DD/MM/YYYY")}
                  </p>
                  {getNextOpeningForDate(selectedDate) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 font-medium">
                        {getNextOpeningForDate(selectedDate)}
                      </p>
                    </div>
                  )}
                </div>
              ) : loading ? (
                <div className="flex justify-center py-8">
                  <Spin />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Time Picker (Clock) */}
                  <div className="max-w-sm">
                    <TimePicker
                      placeholder="Chọn giờ hẹn"
                      value={
                        selectedTime
                          ? dayjs.tz(
                              `${selectedDate} ${selectedTime}`,
                              "Asia/Ho_Chi_Minh"
                            )
                          : null
                      }
                      format="HH:mm"
                      onChange={handleTimeChange}
                      disabledTime={disabledTime}
                      className="w-full h-12"
                    />
                  </div>

                  {/* Selected Time Summary */}
                  {selectedTime && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-900">
                            Đã chọn: {selectedTime}
                          </span>
                        </div>
                        <Button
                          size="small"
                          type="link"
                          onClick={() => setSelectedTime("")}
                          className="text-blue-600 hover:text-blue-800">
                          Hủy
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Show message when no time slots available but center is open */}
              {isServiceCenterOpenOnDate(selectedDate) &&
                availableTimeSlots.length === 0 &&
                !loading && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Không có khung giờ trống trong ngày này</p>
                  </div>
                )}
            </Card>
          )}
        </div>

        {/* Right Column - Additional Information */}
        <div className="space-y-6">
          {/* Service Description */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-500" />
              <span>Mô tả dịch vụ</span>
            </h3>
            <TextArea
              placeholder="Mô tả chi tiết về vấn đề cần sửa chữa hoặc dịch vụ cần thực hiện..."
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              rows={4}
              maxLength={500}
              showCount
            />
          </Card>

          {/* No inspection-only UI here as requested */}

          {/* Payment Preference */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-indigo-500" />
              <span>Hình thức thanh toán</span>
            </h3>
            <Radio.Group
              value={paymentPreference}
              onChange={(e) => setPaymentPreference(e.target.value)}
              className="w-full">
              <div className="space-y-3">
                <Radio value="offline" className="w-full">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium">Tại trung tâm</div>
                      <div className="text-sm text-gray-500">
                        Thanh toán khi hoàn thành dịch vụ
                      </div>
                    </div>
                  </div>
                </Radio>
              </div>
            </Radio.Group>
          </Card>
        </div>
      </div>

      {/* Summary */}
      <Card className="bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tóm tắt đặt lịch
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Xe:</span>
            <span className="font-medium ml-2">
              {selectedVehicle?.vehicleInfo.vehicleModel.brand}{" "}
              {selectedVehicle?.vehicleInfo.vehicleModel.modelName}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Trung tâm:</span>
            <span className="font-medium ml-2">
              {selectedServiceCenter?.name}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Dịch vụ:</span>
            <span className="font-medium ml-2">{selectedService?.name}</span>
          </div>
          <div>
            <span className="text-gray-600">Gói/Dịch vụ:</span>
            <span className="font-medium ml-2">
              {selectedServicePackage
                ? selectedServicePackage.packageName
                : selectedService?.name}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Ngày giờ:</span>
            <span className="font-medium ml-2">
              {selectedDate && selectedTime
                ? `${dayjs
                    .tz(selectedDate, "Asia/Ho_Chi_Minh")
                    .format("DD/MM/YYYY")} lúc ${selectedTime}`
                : "Chưa chọn"}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Thanh toán:</span>
            <span className="font-medium ml-2">
              {paymentPreference === "online" ? "Trực tuyến" : "Tại trung tâm"}
            </span>
          </div>
          {/* Deposit is only for online payment, but online option is disabled; hide deposit */}
          {!isInspectionOnlyFromState &&
            paymentPreference === "online" &&
            (selectedService || selectedServicePackage) && (
              <div>
                <span className="text-gray-600">Tiền cọc dịch vụ:</span>
                <span className="font-medium ml-2 text-blue-600">
                  {(() => {
                    const basePrice = selectedServicePackage
                      ? selectedServicePackage.price
                      : selectedService?.pricing.basePrice || 0;
                    const deposit = Number(basePrice || 0) * 0.2; // 20% deposit
                    return new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(deposit);
                  })()}
                </span>
              </div>
            )}
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          size="large"
          icon={<ArrowLeft className="w-5 h-5" />}
          onClick={onPrev}>
          Quay lại
        </Button>
        <Button
          type="primary"
          size="large"
          icon={<CheckCircle className="w-5 h-5" />}
          onClick={handleSubmit}
          loading={createBookingLoading}
          disabled={
            !selectedDate ||
            !selectedTime ||
            !serviceDescription.trim() ||
            (selectedDate ? !isServiceCenterOpenOnDate(selectedDate) : false)
          }
          className="bg-green-600 hover:bg-green-700">
          Hoàn thành đặt lịch
        </Button>
      </div>

      {/* Payment Modal */}
      {bookingResponse?.data?.payment && (
        <PaymentModal
          visible={paymentModalVisible}
          onCancel={handlePaymentModalCancel}
          paymentData={{
            paymentId: bookingResponse.data.payment.paymentId,
            orderCode:
              typeof bookingResponse.data.payment.orderCode === "string"
                ? parseInt(bookingResponse.data.payment.orderCode)
                : bookingResponse.data.payment.orderCode,
            paymentLink: bookingResponse.data.payment.paymentLink,
            qrCode: bookingResponse.data.payment.qrCode,
            checkoutUrl: bookingResponse.data.payment.checkoutUrl,
            amount:
              typeof bookingResponse.data.payment.amount === "string"
                ? parseFloat(bookingResponse.data.payment.amount)
                : bookingResponse.data.payment.amount,
            expiresAt: bookingResponse.data.payment.expiresAt,
          }}
          description={`Thanh toán booking #${
            bookingResponse.data.appointment._id
          } - ${
            selectedService?.name ||
            selectedServicePackage?.packageName ||
            "Kiểm tra xe"
          }`}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Step4DateTimeAndDetails;
