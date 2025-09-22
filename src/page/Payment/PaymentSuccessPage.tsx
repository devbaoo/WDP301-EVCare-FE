import React, { useState, useEffect } from 'react';
import { Button, Spin } from 'antd';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// No detailed data needed per requirement

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Suppress duplicate toasts; showSuccessMessage no longer used

  // Parameters are now extracted and processed in useEffect using utility functions

  useEffect(() => {
    // Assume we navigate here only after confirmed success via realtime/webhook
    setLoading(false);
    setError(null);
  }, []);

  // No toast here to avoid duplicate notifications from previous flow

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
        <div className="text-center">
          <p className="mt-4 text-gray-600">{error}</p>
          <Button className="mt-4" onClick={() => navigate('/booking')}>Thử lại</Button>
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
              Giao dịch đã hoàn tất
            </p>
          </div>

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
              Tiếp tục đặt lịch
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
