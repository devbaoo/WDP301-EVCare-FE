import React, { useState, useEffect } from 'react';
import { Card, Button, Spin, message, Alert } from 'antd';
import { CheckCircle, Calendar, MapPin, Phone, Car, Clock, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { parsePaymentCallbackParams, validatePaymentCallback, getPaymentResult } from '../../lib/paymentUtils';

interface PaymentSuccessData {
  bookingId: string;
  orderCode: string;
  paymentId: string;
  amount: number;
  appointmentDate: string;
  appointmentTime: string;
  serviceCenter: {
    name: string;
    address: string;
    phone: string;
  };
  vehicle: {
    brand: string;
    model: string;
    licensePlate: string;
  };
  service: {
    name: string;
    estimatedCost: number;
  };
}

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<PaymentSuccessData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Parameters are now extracted and processed in useEffect using utility functions

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setLoading(true);
        
        // Parse and validate payment callback parameters
        const params = parsePaymentCallbackParams(searchParams);
        const validation = validatePaymentCallback(params);
        
        if (!validation.isValid) {
          throw new Error(validation.error || 'Thông tin thanh toán không hợp lệ');
        }

        const paymentResult = getPaymentResult(params);
        
        if (!paymentResult.isSuccess) {
          throw new Error(paymentResult.reason || 'Thanh toán không thành công');
        }

        // TODO: Replace with actual API call to get booking details
        // For now, we'll use the payment ID to get booking information
        // const response = await axiosInstance.get(`/api/booking/payment-confirm/${paymentResult.paymentId}`);
        
        // Mock data for now - replace with actual API response
        // In a real implementation, you would fetch this data from the API
        const mockBookingData: PaymentSuccessData = {
          bookingId: paymentResult.paymentId || '',
          orderCode: paymentResult.orderCode || '',
          paymentId: paymentResult.paymentId || '',
          amount: 2000, // This should come from the actual payment data
          appointmentDate: '2025-09-20', // This should come from the booking data
          appointmentTime: '09:00 - 12:00', // This should come from the booking data
          serviceCenter: {
            name: 'EVCare Đồng Nai Phước Tân', // This should come from the booking data
            address: '45 Quốc lộ 51, Phước Tân, Biên Hòa, Đồng Nai',
            phone: '02513891234'
          },
          vehicle: {
            brand: 'VinFast', // This should come from the booking data
            model: 'VF e34',
            licensePlate: '36T-12345'
          },
          service: {
            name: 'EV Battery Replacement', // This should come from the booking data
            estimatedCost: 10000
          }
        };

        setBookingData(mockBookingData);
        setShowSuccessMessage(true);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xác nhận thanh toán';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [searchParams]);

  // Show success message when booking data is loaded
  useEffect(() => {
    if (showSuccessMessage && bookingData) {
      message.success('Thanh toán thành công! Đặt lịch đã được xác nhận.');
      setShowSuccessMessage(false);
    }
  }, [showSuccessMessage, bookingData]);

  const handleViewBookingHistory = () => {
    navigate('/customer/bookings');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleBookAnother = () => {
    navigate('/booking');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Đang xác nhận thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Alert
            message="Lỗi thanh toán"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={() => navigate('/booking')}>
                Thử lại
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-600 text-lg">
              Đặt lịch bảo dưỡng của bạn đã được xác nhận
            </p>
          </div>

          {/* Payment Summary */}
          <Card className="mb-6 border-green-200 bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-1">
                  Mã đơn hàng: {bookingData?.orderCode}
                </h3>
                <p className="text-green-700">
                  Số tiền đã thanh toán: {bookingData?.amount?.toLocaleString('vi-VN')} VND
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600">Trạng thái</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Đã thanh toán
                </span>
              </div>
            </div>
          </Card>

          {/* Booking Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Appointment Info */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Thông tin lịch hẹn
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {dayjs(bookingData?.appointmentDate).format('dddd, DD/MM/YYYY')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {bookingData?.appointmentTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-gray-500 mr-3 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {bookingData?.serviceCenter.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {bookingData?.serviceCenter.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-500 mr-3" />
                  <span className="text-gray-900">{bookingData?.serviceCenter.phone}</span>
                </div>
              </div>
            </Card>

            {/* Vehicle & Service Info */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Car className="w-5 h-5 mr-2 text-blue-600" />
                Thông tin dịch vụ
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Xe</p>
                  <p className="font-medium text-gray-900">
                    {bookingData?.vehicle.brand} {bookingData?.vehicle.model}
                  </p>
                  <p className="text-sm text-gray-600">
                    Biển số: {bookingData?.vehicle.licensePlate}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Dịch vụ</p>
                  <p className="font-medium text-gray-900">
                    {bookingData?.service.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Ước tính: {bookingData?.service.estimatedCost?.toLocaleString('vi-VN')} VND
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Important Notes */}
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              📋 Thông tin quan trọng
            </h3>
            <ul className="text-blue-700 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Bạn sẽ nhận được email xác nhận trong vòng 5 phút</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Vui lòng đến đúng giờ hẹn. Nếu muốn hủy hoặc đổi lịch, vui lòng liên hệ trước 24h</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Mang theo giấy tờ xe và CMND/CCCD khi đến</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Liên hệ hotline 1900 1234 nếu cần hỗ trợ</span>
              </li>
            </ul>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              type="primary"
              size="large"
              icon={<ArrowRight className="w-5 h-5" />}
              onClick={handleViewBookingHistory}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Xem lịch sử đặt lịch
            </Button>
            
            <Button
              size="large"
              onClick={handleBookAnother}
              className="border-gray-300 hover:border-blue-500"
            >
              Đặt lịch khác
            </Button>
            
            <Button
              size="large"
              onClick={handleGoHome}
              className="border-gray-300 hover:border-gray-500"
            >
              Về trang chủ
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
