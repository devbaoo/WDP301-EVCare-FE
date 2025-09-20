import React, { useState, useEffect } from 'react';
import { Card, Button, message, Alert } from 'antd';
import { XCircle, RefreshCw, Home, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  parsePaymentCallbackParams, 
  getPaymentResult, 
  getPaymentFailureSolutions,
  generateSupportEmail,
  canRetryPayment
} from '../../lib/paymentUtils';

interface PaymentFailureData {
  orderCode: string;
  paymentId: string;
  amount: number;
  reason?: string;
  bookingId?: string;
}

const PaymentFailurePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [failureData, setFailureData] = useState<PaymentFailureData | null>(null);

  useEffect(() => {
    // Parse URL parameters to get failure information
    const params = parsePaymentCallbackParams(searchParams);
    const paymentResult = getPaymentResult(params);
    
    const mockFailureData: PaymentFailureData = {
      orderCode: paymentResult.orderCode || 'N/A',
      paymentId: paymentResult.paymentId || 'N/A',
      amount: 2000, // This should come from the booking data
      reason: paymentResult.reason,
      bookingId: paymentResult.paymentId || undefined
    };

    setFailureData(mockFailureData);
  }, [searchParams]);

  const handleRetryPayment = async () => {
    if (!failureData?.bookingId) {
      message.error('Không thể tìm thấy thông tin đặt lịch');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement retry payment logic
      // This should redirect to the payment link again or regenerate a new one
      message.info('Đang chuyển hướng đến trang thanh toán...');
      
      // For now, redirect to booking page
      setTimeout(() => {
        navigate('/booking');
      }, 2000);
      
    } catch (error) {
      message.error('Có lỗi xảy ra khi thử thanh toán lại');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewBooking = () => {
    navigate('/booking');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    if (failureData?.orderCode) {
      window.open(generateSupportEmail(failureData.orderCode));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Failure Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4"
            >
              <XCircle className="w-12 h-12 text-red-600" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thanh toán thất bại
            </h1>
            <p className="text-gray-600 text-lg">
              Rất tiếc, giao dịch của bạn không thể hoàn thành
            </p>
          </div>

          {/* Failure Alert */}
          <Alert
            message="Giao dịch không thành công"
            description={failureData?.reason || 'Có lỗi xảy ra trong quá trình thanh toán'}
            type="error"
            showIcon
            icon={<AlertTriangle />}
            className="mb-6"
          />

          {/* Payment Details */}
          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Chi tiết giao dịch
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
                <p className="font-medium text-gray-900">{failureData?.orderCode}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Mã giao dịch</p>
                <p className="font-medium text-gray-900 font-mono text-sm">{failureData?.paymentId}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Số tiền</p>
                <p className="font-medium text-gray-900">
                  {failureData?.amount?.toLocaleString('vi-VN')} VND
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <XCircle className="w-4 h-4 mr-1" />
                  Thất bại
                </span>
              </div>
            </div>
          </Card>

          {/* Common Issues & Solutions */}
          <Card className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔧 Các nguyên nhân thường gặp
            </h3>
            
            <div className="space-y-4">
              {failureData?.reason && getPaymentFailureSolutions(failureData.reason).map((solution, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-gray-900">{solution.title}</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {solution.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Help Section */}
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              🆘 Cần hỗ trợ?
            </h3>
            <div className="text-blue-700 space-y-2">
              <p>• Hotline hỗ trợ: <strong>1900 1234</strong> (24/7)</p>
              <p>• Email: <strong>support@evcare.vn</strong></p>
              <p>• Chat trực tuyến: Truy cập trang chủ và click vào icon chat</p>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {failureData?.reason && canRetryPayment(failureData.reason) && (
              <Button
                type="primary"
                size="large"
                icon={<RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />}
                onClick={handleRetryPayment}
                loading={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Thử thanh toán lại
              </Button>
            )}
            
            <Button
              size="large"
              icon={<ArrowLeft className="w-5 h-5" />}
              onClick={handleCreateNewBooking}
              className="border-gray-300 hover:border-blue-500"
            >
              Tạo đặt lịch mới
            </Button>
            
            <Button
              size="large"
              icon={<Home className="w-5 h-5" />}
              onClick={handleGoHome}
              className="border-gray-300 hover:border-gray-500"
            >
              Về trang chủ
            </Button>
          </div>

          {/* Contact Support Button */}
          <div className="text-center mt-6">
            <Button
              type="link"
              onClick={handleContactSupport}
              className="text-blue-600 hover:text-blue-800"
            >
              Liên hệ hỗ trợ trực tiếp
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;
