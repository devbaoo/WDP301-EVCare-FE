/**
 * Payment interfaces for PayOS integration
 */

export interface PaymentInfo {
  amount: number;
  currency: string;
  description: string;
  orderCode: number;
}

export interface PayOSInfo {
  orderCode: number;
  paymentLinkId: string;
  paymentLink: string;
  qrCode: string;
  checkoutUrl: string;
  deepLink: string;
}

export interface PaymentTransaction {
  transactionId: string;
  transactionTime: string;
  amount: number;
  fee: number;
  netAmount: number;
}

export interface PaymentWebhook {
  received: boolean;
  receivedAt: string;
  data: any;
}

export interface Payment {
  _id: string;
  appointment: string | AppointmentInfo | null;
  customer: string | CustomerInfo;
  paymentInfo: PaymentInfo;
  payosInfo: PayOSInfo;
  status: PaymentStatus;
  paymentMethod: string;
  transaction?: PaymentTransaction;
  refund?: {
    isRefunded: boolean;
    refundAmount: number;
  };
  expiresAt: string;
  isExpired?: boolean;
  statusDisplay?: string;
  webhook?: PaymentWebhook;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentInfo {
  _id: string;
  serviceType?:
    | string
    | {
        name: string;
      };
  serviceCenter?:
    | string
    | {
        name: string;
      };
  appointmentTime: {
    date: string;
    startTime: string;
    endTime?: string;
    duration?: number;
  };
}

export interface CustomerInfo {
  _id: string;
  username: string;
  email: string;
  fullName: string;
}

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded";

export interface CreatePaymentResponse {
  success: boolean;
  message: string;
  data: {
    paymentId: string;
    orderCode: number;
    paymentLink: string;
    qrCode: string;
    checkoutUrl: string;
    deepLink: string;
    amount: number;
    expiresAt: string;
  };
}

export interface PaymentStatusResponse {
  success: boolean;
  message: string;
  data: Payment;
}

export interface MyPaymentsResponse {
  success: boolean;
  message: string;
  data: {
    payments: Payment[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface PaymentCancelResponse {
  success: boolean;
  message: string;
}

export interface PayOSPaymentInfo {
  orderCode: number;
  amount: number;
  description: string;
  status: string;
  transactionTime: string;
}

export interface PayOSPaymentInfoResponse {
  success: boolean;
  message: string;
  data: PayOSPaymentInfo;
}

export interface PaymentWebhookData {
  orderCode: number;
  status: string;
  transactionTime: string;
  amount: number;
  fee: number;
  netAmount: number;
  transactionId: string;
}

export interface PaymentWebhookResponse {
  success: boolean;
  message: string;
}

export interface PaymentSyncData {
  paymentId: string;
  orderCode: string;
  oldStatus: string;
  newStatus: string;
  payosStatus: string;
}

export interface PaymentSyncResponse {
  success: boolean;
  message: string;
  data: PaymentSyncData;
}

export interface PaymentQueryParams {
  status?: PaymentStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
}

export interface PaymentState {
  currentPayment: Payment | null;
  myPayments: Payment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;
  loading: boolean;
  createPaymentLoading: boolean;
  error: string | null;
}
