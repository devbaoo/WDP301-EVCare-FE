import React, { useState } from 'react';
import { Button, message } from 'antd';
import { XCircle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { canRetryPayment } from '../../lib/paymentUtils';

interface PaymentFailureData {
  orderCode: string;
  paymentId: string;
  amount: number;
  reason?: string;
  bookingId?: string;
}

const PaymentFailurePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [failureData] = useState<PaymentFailureData | null>(null);
  // Display generic failure without relying on URL params

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

    } catch {
      message.error('Có lỗi xảy ra khi thử thanh toán lại');
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
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
            <p className="text-gray-600 text-lg">Giao dịch không thể hoàn thành</p>
          </div>

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
              icon={<Home className="w-5 h-5" />}
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

export default PaymentFailurePage;
