import React from 'react';
import { Tag, Progress, Tooltip } from 'antd';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  CreditCard
} from 'lucide-react';
import { PaymentStatus as PaymentStatusType } from '../../interfaces/payment';
import { getPaymentStatusColor, getPaymentStatusText } from '../../lib/paymentUtils';

interface PaymentStatusProps {
  status: PaymentStatusType;
  showIcon?: boolean;
  showProgress?: boolean;
  className?: string;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status,
  showIcon = true,
  showProgress = false,
  className = ''
}) => {
  const getStatusIcon = (status: PaymentStatusType) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      case 'refunded':
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getProgressPercent = (status: PaymentStatusType) => {
    switch (status) {
      case 'paid':
        return 100;
      case 'pending':
        return 50;
      case 'failed':
      case 'cancelled':
      case 'expired':
        return 0;
      case 'refunded':
        return 75;
      default:
        return 0;
    }
  };

  const getStatusDescription = (status: PaymentStatusType) => {
    switch (status) {
      case 'paid':
        return 'Thanh toán đã hoàn thành thành công';
      case 'pending':
        return 'Đang chờ thanh toán từ khách hàng';
      case 'failed':
        return 'Thanh toán thất bại do lỗi kỹ thuật';
      case 'cancelled':
        return 'Thanh toán đã bị hủy bởi khách hàng';
      case 'expired':
        return 'Link thanh toán đã hết hạn';
      case 'refunded':
        return 'Đã hoàn tiền cho khách hàng';
      default:
        return 'Trạng thái không xác định';
    }
  };

  const color = getPaymentStatusColor(status.toUpperCase());
  const text = getPaymentStatusText(status.toUpperCase());

  return (
    <div className={`payment-status ${className}`}>
      <Tooltip title={getStatusDescription(status)}>
        <Tag
          color={color}
          icon={showIcon ? getStatusIcon(status) : undefined}
          className="flex items-center gap-1"
        >
          {text}
        </Tag>
      </Tooltip>
      
      {showProgress && (
        <div className="mt-2">
          <Progress
            percent={getProgressPercent(status)}
            size="small"
            status={status === 'failed' || status === 'cancelled' || status === 'expired' ? 'exception' : 'normal'}
            showInfo={false}
          />
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;
