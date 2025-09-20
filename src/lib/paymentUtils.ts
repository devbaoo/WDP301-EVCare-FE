/**
 * Payment utility functions for handling PayOS payment callbacks
 */

export interface PaymentCallbackParams {
  code: string | null;
  id: string | null;
  cancel: string | null;
  status: string | null;
  orderCode: string | null;
}

export interface PaymentResult {
  isSuccess: boolean;
  isCancelled: boolean;
  paymentId: string | null;
  orderCode: string | null;
  status: string | null;
  reason?: string;
}

/**
 * Parse URL search parameters for payment callback
 */
export const parsePaymentCallbackParams = (searchParams: URLSearchParams): PaymentCallbackParams => {
  return {
    code: searchParams.get('code'),
    id: searchParams.get('id'),
    cancel: searchParams.get('cancel'),
    status: searchParams.get('status'),
    orderCode: searchParams.get('orderCode')
  };
};

/**
 * Determine payment result from callback parameters
 */
export const getPaymentResult = (params: PaymentCallbackParams): PaymentResult => {
  const { id, cancel, status, orderCode } = params;

  // Check if payment was cancelled by user
  if (cancel === 'true') {
    return {
      isSuccess: false,
      isCancelled: true,
      paymentId: id,
      orderCode: orderCode,
      status: 'CANCELLED',
      reason: 'Bạn đã hủy thanh toán'
    };
  }

  // Check if payment was successful
  if (status === 'PAID' && cancel === 'false') {
    return {
      isSuccess: true,
      isCancelled: false,
      paymentId: id,
      orderCode: orderCode,
      status: 'PAID',
      reason: 'Thanh toán thành công'
    };
  }

  // Check for other failure states
  if (status === 'CANCELLED') {
    return {
      isSuccess: false,
      isCancelled: true,
      paymentId: id,
      orderCode: orderCode,
      status: 'CANCELLED',
      reason: 'Giao dịch đã bị hủy'
    };
  }

  if (status === 'EXPIRED') {
    return {
      isSuccess: false,
      isCancelled: false,
      paymentId: id,
      orderCode: orderCode,
      status: 'EXPIRED',
      reason: 'Giao dịch đã hết hạn'
    };
  }

  if (status === 'FAILED') {
    return {
      isSuccess: false,
      isCancelled: false,
      paymentId: id,
      orderCode: orderCode,
      status: 'FAILED',
      reason: 'Thanh toán thất bại do lỗi kỹ thuật'
    };
  }

  // Default failure case
  return {
    isSuccess: false,
    isCancelled: false,
    paymentId: id,
    orderCode: orderCode,
    status: status || 'UNKNOWN',
    reason: 'Thanh toán không thành công'
  };
};

/**
 * Validate payment callback parameters
 */
export const validatePaymentCallback = (params: PaymentCallbackParams): { isValid: boolean; error?: string } => {
  const { code, id, orderCode } = params;

  if (!code) {
    return { isValid: false, error: 'Thiếu mã giao dịch' };
  }

  if (!id) {
    return { isValid: false, error: 'Thiếu ID thanh toán' };
  }

  if (!orderCode) {
    return { isValid: false, error: 'Thiếu mã đơn hàng' };
  }

  return { isValid: true };
};

/**
 * Format Vietnamese currency
 */
export const formatCurrencyVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format payment amount for display (without currency symbol)
 */
export const formatPaymentAmount = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};

/**
 * Get payment status color for UI
 */
export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'PAID':
      return 'green';
    case 'CANCELLED':
      return 'red';
    case 'EXPIRED':
      return 'orange';
    case 'FAILED':
      return 'red';
    case 'PENDING':
      return 'blue';
    default:
      return 'gray';
  }
};

/**
 * Get payment status text in Vietnamese
 */
export const getPaymentStatusText = (status: string): string => {
  switch (status) {
    case 'PAID':
      return 'Đã thanh toán';
    case 'CANCELLED':
      return 'Đã hủy';
    case 'EXPIRED':
      return 'Hết hạn';
    case 'FAILED':
      return 'Thất bại';
    case 'PENDING':
      return 'Đang chờ';
    default:
      return 'Không xác định';
  }
};

/**
 * Check if payment is in a terminal state (success or failure)
 */
export const isPaymentTerminal = (status: string): boolean => {
  return ['PAID', 'CANCELLED', 'EXPIRED', 'FAILED'].includes(status);
};

/**
 * Check if payment can be retried
 */
export const canRetryPayment = (status: string): boolean => {
  return ['CANCELLED', 'EXPIRED', 'FAILED'].includes(status);
};

/**
 * Generate support email with payment context
 */
export const generateSupportEmail = (orderCode: string, issue: string = 'Hỗ trợ thanh toán'): string => {
  const subject = encodeURIComponent(`${issue} - Mã đơn hàng: ${orderCode}`);
  const body = encodeURIComponent(`
Mã đơn hàng: ${orderCode}
Vấn đề gặp phải: ${issue}
Thời gian: ${new Date().toLocaleString('vi-VN')}

Mô tả chi tiết:
  `);
  
  return `mailto:support@evcare.vn?subject=${subject}&body=${body}`;
};

/**
 * Get common payment failure reasons and solutions
 */
export const getPaymentFailureSolutions = (status: string): Array<{ title: string; description: string }> => {
  const commonSolutions = [
    {
      title: 'Thông tin thẻ không chính xác',
      description: 'Vui lòng kiểm tra lại số thẻ, ngày hết hạn và mã CVV'
    },
    {
      title: 'Số dư không đủ',
      description: 'Đảm bảo tài khoản có đủ số dư để thực hiện giao dịch'
    },
    {
      title: 'Kết nối mạng không ổn định',
      description: 'Kiểm tra kết nối internet và thử lại'
    }
  ];

  if (status === 'EXPIRED') {
    commonSolutions.unshift({
      title: 'Giao dịch hết hạn',
      description: 'Link thanh toán có thời hạn 15 phút, vui lòng tạo lại'
    });
  }

  return commonSolutions;
};
