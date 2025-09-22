import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Alert, QRCode, message } from 'antd';
import {
  CreditCard,
  Smartphone,
  Copy,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../services/store/store';
import { cancelPayOSPayment, getPaymentStatus, pollPaymentStatus, clearCurrentPayment } from '../../services/features/payment/paymentSlice';
import { formatPaymentAmount } from '../../lib/paymentUtils';

interface PaymentModalProps {
  visible: boolean;
  onCancel: () => void;
  paymentData: {
    paymentId: string;
    orderCode: number;
    paymentLink: string;
    qrCode: string;
    checkoutUrl: string;
    amount: number;
    expiresAt: string;
  };
  description: string;
  onPaymentSuccess?: (paymentData: any) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onCancel,
  paymentData: initialPaymentData,
  description,
  onPaymentSuccess
}) => {
  const dispatch = useAppDispatch();
  const { currentPayment } = useAppSelector((state) => state.payment);
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [paymentSuccessHandled, setPaymentSuccessHandled] = useState(false);

  useEffect(() => {
    if (visible && initialPaymentData) {
      // Calculate time left until expiration
      const expiresAt = new Date(initialPaymentData.expiresAt);
      const now = new Date();
      const diffMs = expiresAt.getTime() - now.getTime();

      if (diffMs > 0) {
        setTimeLeft(Math.floor(diffMs / 1000));

        const timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } else {
        setTimeLeft(0);
      }
    }
  }, [visible, initialPaymentData]);

  // Start polling for payment status when modal opens
  useEffect(() => {
    if (visible && initialPaymentData?.paymentId) {
      // Reset payment success handled flag when modal opens
      setPaymentSuccessHandled(false);
      // Use status API with paymentId
      dispatch(getPaymentStatus(initialPaymentData.paymentId));
    } else if (!visible) {
      // Clear current payment when modal closes
      dispatch(clearCurrentPayment());
    }
  }, [visible, initialPaymentData?.paymentId, dispatch]);

  // Polling logic with proper cleanup
  useEffect(() => {
    if (!visible || !initialPaymentData?.paymentId) return;

    // Only poll if we don't have currentPayment yet or payment is still pending
    // Also stop polling if payment success has been handled
    if ((!currentPayment || (currentPayment.status === 'pending' && !currentPayment.isExpired)) && !paymentSuccessHandled) {
      const interval = setInterval(() => {
        // Use status API with paymentId for polling
        dispatch(pollPaymentStatus(initialPaymentData.paymentId));
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [visible, initialPaymentData?.paymentId, currentPayment?.status, currentPayment?.isExpired, paymentSuccessHandled, dispatch]);

  // Handle payment success
  useEffect(() => {
    if (currentPayment?.status === 'paid' && onPaymentSuccess && !paymentSuccessHandled) {
      setPaymentSuccessHandled(true);
      onPaymentSuccess(currentPayment);
    }
  }, [currentPayment?.status, onPaymentSuccess, paymentSuccessHandled]);

  const handleCopyLink = async () => {
    if (initialPaymentData?.checkoutUrl) {
      try {
        await navigator.clipboard.writeText(initialPaymentData.checkoutUrl);
        setCopied(true);
        message.success('Đã sao chép link thanh toán');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        message.error('Không thể sao chép link');
      }
    }
  };

  const handleOpenPayment = () => {
    if (initialPaymentData?.checkoutUrl) {
      window.open(initialPaymentData.checkoutUrl, '_blank');
    }
  };

  const handleCancelPayment = async () => {
    if (initialPaymentData?.orderCode) {
      try {
        await dispatch(cancelPayOSPayment(initialPaymentData.orderCode.toString())).unwrap();
        message.success('Đã hủy thanh toán');
        onCancel();
        navigate('/payment/cancel');
      } catch (error) {
        message.error('Không thể hủy thanh toán');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderPaymentContent = () => {
    // Only show payment status if we have currentPayment data from API
    if (currentPayment) {
      // Check if payment was successful
      if (currentPayment.status === 'paid') {
        return (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Thanh toán thành công!
            </h3>
            <p className="text-gray-600 mb-4">
              Đặt lịch của bạn đã được xác nhận
            </p>
            <Button onClick={onCancel} type="primary">
              Đóng
            </Button>
          </div>
        );
      }

      // Show error if payment failed
      if (currentPayment.status === 'failed' || currentPayment.status === 'cancelled' || currentPayment.status === 'expired') {
        return (
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Thanh toán thất bại
            </h3>
            <p className="text-gray-600 mb-4">
              {currentPayment.status === 'failed' && 'Thanh toán thất bại do lỗi kỹ thuật'}
              {currentPayment.status === 'cancelled' && 'Thanh toán đã bị hủy'}
              {currentPayment.status === 'expired' && 'Link thanh toán đã hết hạn'}
            </p>
            <Button onClick={onCancel} type="primary">
              Đóng
            </Button>
          </div>
        );
      }
    }

    // Default payment interface (when no currentPayment or status is pending)
    return (
      <div className="space-y-6">
        {/* Payment Info */}
        <Card className="border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-800">
              Thông tin thanh toán
            </h3>
            <div className="text-right">
              <p className="text-sm text-blue-600">Số tiền</p>
              <p className="text-xl font-bold text-blue-800">
                {formatPaymentAmount(initialPaymentData.amount)} VND
              </p>
            </div>
          </div>
          <p className="text-blue-700">{description}</p>
        </Card>

        {/* Timer */}
        {timeLeft > 0 && (
          <Alert
            message={`Link thanh toán hết hạn sau: ${formatTime(timeLeft)}`}
            type="warning"
            icon={<Clock className="w-4 h-4" />}
          />
        )}

        {timeLeft === 0 && (
          <Alert
            message="Link thanh toán đã hết hạn"
            type="error"
            icon={<AlertCircle className="w-4 h-4" />}
            action={
              <Button size="small" onClick={onCancel}>
                Đóng
              </Button>
            }
          />
        )}

        {/* Payment Methods */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Phương thức thanh toán</h4>

          {/* QR Code */}
          {initialPaymentData?.qrCode && (
            <Card className="text-center">
              <h5 className="font-medium mb-3">Quét mã QR</h5>
              <div className="flex justify-center mb-3">
                <QRCode
                  value={initialPaymentData.qrCode}
                  size={200}
                  errorLevel="M"
                />
              </div>
              <p className="text-sm text-gray-600">
                Sử dụng ứng dụng ngân hàng để quét mã QR
              </p>
            </Card>
          )}

          {/* Payment Link */}
          <Card>
            <h5 className="font-medium mb-3">Thanh toán online</h5>
            <div className="flex gap-2 mb-3">
              <Button
                icon={<ExternalLink className="w-4 h-4" />}
                onClick={handleOpenPayment}
                className="flex-1"
                type="primary"
              >
                Mở trang thanh toán
              </Button>
              <Button
                icon={<Copy className="w-4 h-4" />}
                onClick={handleCopyLink}
                className={copied ? 'bg-green-500 border-green-500' : ''}
              >
                {copied ? 'Đã sao chép' : 'Sao chép link'}
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Click để mở trang thanh toán PayOS
            </p>
          </Card>

          {/* Mobile App */}
          <Card>
            <h5 className="font-medium mb-3 flex items-center">
              <Smartphone className="w-4 h-4 mr-2" />
              Ứng dụng di động
            </h5>
            {initialPaymentData?.paymentLink && (
              <Button
                onClick={() => window.open(initialPaymentData.paymentLink, '_blank')}
                className="w-full"
                icon={<Smartphone className="w-4 h-4" />}
              >
                Mở trong app ngân hàng
              </Button>
            )}
          </Card>
        </div>

        {/* Payment Instructions */}
        <Card className="border-gray-200 bg-gray-50">
          <h5 className="font-medium mb-3">Hướng dẫn thanh toán</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Chọn một trong các phương thức thanh toán trên</li>
            <li>• Thanh toán bằng thẻ ngân hàng hoặc ví điện tử</li>
            <li>• Sau khi thanh toán thành công, lịch hẹn sẽ được xác nhận tự động</li>
            <li>• Bạn sẽ nhận được email xác nhận trong vòng 5 phút</li>
          </ul>
        </Card>
      </div>
    );
  };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
          <span>Thanh toán đặt lịch</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={
        !currentPayment || (currentPayment.status !== 'paid' && currentPayment.status !== 'failed' && currentPayment.status !== 'cancelled' && currentPayment.status !== 'expired') ? (
          <div className="flex justify-between">
            <Button onClick={handleCancelPayment} danger>
              Hủy thanh toán
            </Button>
            <Button onClick={onCancel}>
              Đóng
            </Button>
          </div>
        ) : null
      }
      width={600}
      className="payment-modal"
      centered
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPayment?.status || 'payment'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderPaymentContent()}
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
};

export default PaymentModal;
