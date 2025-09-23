export type QuoteStatus = "pending" | "approved" | "rejected";

export interface WorkProgressMilestone {
  _id?: string;
  name: string;
  description: string;
  status?: "pending" | "in_progress" | "done";
}

export interface WorkProgress {
  _id: string;
  technicianId: string | { _id: string; email?: string };
  appointmentId:
    | string
    | {
        _id: string;
        appointmentTime: {
          date: string;
          startTime: string;
          endTime: string;
          duration: number;
        };
        serviceDetails: {
          description: string;
          priority: string;
          estimatedCost: number;
          isInspectionOnly: boolean;
          isFromPackage: boolean;
        };
        inspectionAndQuote: {
          inspectionNotes?: string;
          inspectionCompletedAt?: string;
          vehicleCondition?: string;
          diagnosisDetails?: string;
          quoteAmount?: number;
          quoteDetails?: string;
          quotedAt?: string;
          quoteStatus?: QuoteStatus;
          customerResponseAt?: string;
          customerResponseNotes?: string;
        };
        payment: {
          method: string;
          status: string;
          amount: number;
          paidAt?: string;
          transactionId?: string;
        };
        confirmation: {
          isConfirmed: boolean;
          confirmationMethod: string;
          confirmedAt?: string;
          confirmedBy?: string;
        };
        cancellation: {
          isCancelled: boolean;
          refundAmount: number;
        };
        rescheduling: {
          isRescheduled: boolean;
        };
        completion: {
          isCompleted: boolean;
        };
        customer: string;
        vehicle: string;
        serviceCenter: string;
        serviceType: string;
        status: string;
        reminders: string[];
        documents: string[];
        internalNotes: string[];
        createdAt: string;
        updatedAt: string;
        __v: number;
      };
  serviceDate: string;
  startTime: string;
  currentStatus: string;
  progressPercentage?: number;
  milestones: WorkProgressMilestone[];
  notes?: string;
  timeSpent?: number;
  pauseTime?: number;
  issues?: string[];
  inspection?: {
    isInspectionOnly: boolean;
    diagnosisDetails: string;
    inspectionCompletedAt: string;
    inspectionNotes: string;
    vehicleCondition: string;
  };
  quote?: {
    quoteStatus: QuoteStatus;
    quoteAmount: number;
    quoteDetails: string;
    quotedAt: string;
    customerResponseAt: string;
  };
  paymentDetails?: {
    paymentMethod: string;
    paymentStatus: string;
    paidAmount: number;
  };
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface CreateWorkProgressPayload {
  technicianId: string;
  appointmentId: string;
  serviceDate: string;
  startTime?: string;
  currentStatus?: string; // default handled by server
  milestones?: Array<{ name: string; description: string }>;
  notes?: string;
}

export interface CreateWorkProgressResponse {
  success: boolean;
  message: string;
  data: WorkProgress;
}

export interface WorkProgressResponse {
  success: boolean;
  message?: string;
  data: WorkProgress;
}

export interface InspectionQuotePayload {
  vehicleCondition: string;
  diagnosisDetails: string;
  inspectionNotes?: string;
  quoteAmount: number;
  quoteDetails: string;
  customerResponseNotes?: string;
}

export interface CompleteMaintenancePayload {
  notes?: string;
  workDone: string;
  recommendations?: string;
}
