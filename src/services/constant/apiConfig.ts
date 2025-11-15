export const BASE_URL = "https://evcare-85qa6.ondigitalocean.app";
// export const BASE_URL = "http://localhost:8080";

// Auth endpoints
export const LOGIN_ENDPOINT = `${BASE_URL}/api/auth/login`;
export const GOOGLE_LOGIN_ENDPOINT = `${BASE_URL}/api/auth/google-login`;
export const REGISTER_ENDPOINT = `${BASE_URL}/api/auth/register`;
export const VERIFY_EMAIL_ENDPOINT = `${BASE_URL}/api/auth/verify-email`;
export const VERIFY_EMAIL_TOKEN_ENDPOINT = (token: string) =>
  `${BASE_URL}/api/auth/verify-email/${token}`;
export const RESEND_VERIFICATION_ENDPOINT = `${BASE_URL}/api/auth/resend-verification`;
export const RESET_PASSWORD_ENDPOINT = `${BASE_URL}/api/auth/forgot-password`;
export const RESET_PASSWORD_WITH_TOKEN_ENDPOINT = (token: string) =>
  `${BASE_URL}/api/auth/reset-password/${token}`;
export const UPDATE_PASSWORD_ENDPOINT = `${BASE_URL}/api/auth/update-password`;
export const CHANGE_PASSWORD_ENDPOINT = `${BASE_URL}/api/auth/change-password`;
export const VERIFY_RESET_CODE_ENDPOINT = `${BASE_URL}/api/auth/verify-reset-code`;
export const LOGOUT_ENDPOINT = `${BASE_URL}/api/auth/logout`;
export const REFRESH_TOKEN_ENDPOINT = `${BASE_URL}/api/auth/refresh-token`;

// Staff endpoints
export const STAFF_LIST_ENDPOINT = `${BASE_URL}/api/staff`;
export const STAFF_ASSIGNMENT_LIST_ENDPOINT = `${BASE_URL}/api/staff-assignments`;
//change role endpoint
export const CHANGE_ROLE_ENDPOINT = `${BASE_URL}/api/staff-assignments`;
//get all users endpoint
export const GET_ALL_USERS_ENDPOINT = `${BASE_URL}/api/users`;

// User endpoints
export const USER_PROFILE_ENDPOINT = `${BASE_URL}/api/user/profile`;
export const USER_UPDATE_PROFILE_ENDPOINT = `${BASE_URL}/api/user/profile`;
export const USER_UPLOAD_AVATAR_ENDPOINT = `${BASE_URL}/api/user/upload-avatar`;

// Service Center endpoints
export const SERVICE_CENTERS_ENDPOINT = `${BASE_URL}/api/service-centers`;
export const SERVICE_CENTER_DETAIL_ENDPOINT = (id: string) =>
  `${BASE_URL}/api/service-centers/${id}`;
export const SERVICE_CENTER_NEARBY_ENDPOINT = `${BASE_URL}/api/service-centers/nearby/search`;
export const SERVICE_CENTER_CREATE_ENDPOINT = `${BASE_URL}/api/service-centers`;
export const SERVICE_CENTER_UPDATE_ENDPOINT = (id: string) =>
  `${BASE_URL}/api/service-centers/${id}`;
export const SERVICE_CENTER_DELETE_ENDPOINT = (id: string) =>
  `${BASE_URL}/api/service-centers/${id}`;
// get rating by service center id
export const GET_RATING_BY_SERVICE_CENTER_ID_ENDPOINT = (centerId: string) =>
  `${BASE_URL}/api/service-centers/${centerId}/ratings`;

// Vehicle endpoints
export const VEHICLES_ENDPOINT = `${BASE_URL}/api/vehicles`;
export const CREATE_VEHICLE_ENDPOINT = `${BASE_URL}/api/vehicles`;
export const VEHICLE_DETAIL_ENDPOINT = (vehicleId: string) =>
  `${BASE_URL}/api/vehicles/${vehicleId}`;
export const UPDATE_VEHICLE_ENDPOINT = (vehicleId: string) =>
  `${BASE_URL}/api/vehicles/${vehicleId}`;
export const DELETE_VEHICLE_ENDPOINT = (vehicleId: string) =>
  `${BASE_URL}/api/vehicles/${vehicleId}`;
export const VEHICLE_MODELS_ENDPOINT = `${BASE_URL}/api/vehicle-models`;

// Service types endpoints
export const POPULAR_SERVICE_TYPES_ENDPOINT = `${BASE_URL}/api/service-types/popular/list`;
export const COMPATIBLE_SERVICES_ENDPOINT = (vehicleId: string) =>
  `${BASE_URL}/api/booking/vehicles/${vehicleId}/services`;
// Service packages endpoints
export const COMPATIBLE_PACKAGES_ENDPOINT = (vehicleId: string) =>
  `${BASE_URL}/api/service-packages/vehicle/${vehicleId}/compatible`;
// Vehicle models/brands
export const VEHICLE_BRANDS_ENDPOINT = `${BASE_URL}/api/vehicle-models/brands/list`;

// Booking endpoints
export const CREATE_BOOKING_ENDPOINT = `${BASE_URL}/api/booking`;
export const BOOKING_SERVICE_CENTERS_ENDPOINT = `${BASE_URL}/api/booking/service-centers`;
export const BOOKING_TIME_SLOTS_ENDPOINT = (
  serviceCenterId: string,
  date: string
) =>
  `${BASE_URL}/api/booking/service-centers/${serviceCenterId}/slots?date=${date}`;
export const BOOKING_TIME_SLOTS_BY_SERVICE_ENDPOINT = (
  serviceCenterId: string,
  serviceTypeId: string,
  date: string
) =>
  `${BASE_URL}/api/booking/service-centers/${serviceCenterId}/services/${serviceTypeId}/slots?date=${date}`;
export const MY_BOOKINGS_ENDPOINT = `${BASE_URL}/api/booking/my-bookings`;
export const BOOKING_DETAILS_ENDPOINT = (bookingId: string) =>
  `${BASE_URL}/api/booking/${bookingId}`;
export const BOOKING_CANCEL_ENDPOINT = (bookingId: string) =>
  `${BASE_URL}/api/booking/${bookingId}/cancel`;
export const BOOKING_RESCHEDULE_ENDPOINT = (bookingId: string) =>
  `${BASE_URL}/api/booking/${bookingId}/reschedule`;
export const BOOKING_AWAITING_CONFIRMATION_ENDPOINT = `${BASE_URL}/api/booking/awaiting-confirmation`;
export const BOOKING_CONFIRM_ENDPOINT = (bookingId: string) =>
  `${BASE_URL}/api/booking/${bookingId}/confirm`;

// Pending offline payment bookings
export const BOOKINGS_PENDING_OFFLINE_PAYMENT_ENDPOINT = `${BASE_URL}/api/bookings/pending-offline-payment`;

//Feeback endpoints by customer
export const CUSTOMER_FEEDBACK_ENDPOINT = (appointmentId: string) =>
  `${BASE_URL}/api/appointments/${appointmentId}/feedback`;
//get customer feedback
export const GET_CUSTOMER_FEEDBACK_ENDPOINT = (appointmentId: string) =>
  `${BASE_URL}/api/appointments/${appointmentId}/feedback`;

export const SUBMIT_CUSTOMER_FEEDBACK_ENDPOINT = (appointmentId: string) =>
  `${BASE_URL}/api/appointments/${appointmentId}/feedback`;

// Appointment progress (customer view)
export const APPOINTMENT_PROGRESS_ENDPOINT = (appointmentId: string) =>
  `${BASE_URL}/api/appointments/${appointmentId}/progress`;

// Confirmed bookings (for staff/technician views)
export const BOOKINGS_CONFIRMED_ENDPOINT = `${BASE_URL}/api/bookings/confirmed`;

// Technician schedule endpoints
export const TECHNICIAN_SCHEDULE_CREATE_ENDPOINT = `${BASE_URL}/api/technician-schedules`;
export const TECHNICIAN_SCHEDULE_CREATE_DEFAULT_ENDPOINT = `${BASE_URL}/api/technician-schedules/default`;
export const TECHNICIAN_SCHEDULE_LIST_ENDPOINT = `${BASE_URL}/api/technician-schedules`;
export const TECHNICIAN_SCHEDULE_BY_CENTER_ENDPOINT = `${BASE_URL}/api/technician-schedules`;
export const TECHNICIAN_SCHEDULES_BY_TECHNICIAN_ENDPOINT = (
  technicianId: string
) => `${BASE_URL}/api/technicians/${technicianId}/schedules`;
export const TECHNICIAN_SCHEDULE_UPDATE_ENDPOINT = (id: string) =>
  `${BASE_URL}/api/technician-schedules/${id}`;
export const TECHNICIAN_SCHEDULE_DELETE_ENDPOINT = (id: string) =>
  `${BASE_URL}/api/technician-schedules/${id}`;

export const TECHNICIAN_SCHEDULE_ADD_APPOINTMENT_ENDPOINT = (id: string) =>
  `${BASE_URL}/api/technician-schedules/${id}/appointments`;

// Technician staff endpoints
export const TECHNICIAN_STAFF_BY_CENTER_ENDPOINT = (centerId: string) =>
  `${BASE_URL}/api/service-centers/${centerId}/staff?position=technician`;
export const AVAILABLE_TECHNICIANS_ENDPOINT = (centerId: string) =>
  `${BASE_URL}/api/service-centers/${centerId}/available-technicians`;

//Technician check in endpoints

export const TECHNICIAN_CHECK_IN_ENDPOINT = (scheduleId: string) =>
  `${BASE_URL}/api/technician-schedules/${scheduleId}/check-in`;
export const TECHNICIAN_CHECK_OUT_ENDPOINT = (scheduleId: string) =>
  `${BASE_URL}/api/technician-schedules/${scheduleId}/check-out`;

// Deprecated/misnamed helper removed in favor of TECHNICIAN_SCHEDULES_BY_TECHNICIAN_ENDPOINT

//servicetype
export const SERVICE_TYPE_POPULAR_ENDPOINT = `${BASE_URL}/api/service-types/popular/list`;
export const SERVICE_TYPE_CREATE_ENDPOINT = `${BASE_URL}/api/service-types`;
export const SERVICE_TYPE_UPDATE_ENDPOINT = (id: string) =>
  `${BASE_URL}/api/service-types/${id}`;
export const SERVICE_TYPE_DELETE_ENDPOINT = (id: string) =>
  `${BASE_URL}/api/service-types/${id}`;
export const SERVICE_TYPE_ENDPOINT = `${BASE_URL}/api/service-types`;

// Certificate endpoints
export const CERTIFICATE_ENDPOINT = `${BASE_URL}/api/technician-certificates`;
export const CERTIFICATE_DETAIL_ENDPOINT = (id: string) =>
  `${BASE_URL}/api/technician-certificates/${id}`;

// Technician work progress endpoints
export const TECHNICIAN_PROGRESS_CREATE_ENDPOINT = `${BASE_URL}/api/work-progress`;
export const WORK_PROGRESS_LIST_ENDPOINT = `${BASE_URL}/api/work-progress`;
export const WORK_PROGRESS_DETAIL_ENDPOINT = (id: string) =>
  `${BASE_URL}/api/work-progress/${id}`;
export const WORK_PROGRESS_PROCESS_PAYMENT_ENDPOINT = (id: string) =>
  `${BASE_URL}/api/work-progress/${id}/process-payment`;
export const WORK_PROGRESS_PROCESS_ONLINE_PAYMENT_ENDPOINT = (id: string) =>
  `${BASE_URL}/api/work-progress/${id}/process-online-payment`;
// Deprecated: progress-level quote endpoints removed in favor of appointment-level
// New appointment-level quote endpoints
export const APPOINTMENT_INSPECTION_QUOTE_ENDPOINT = (appointmentId: string) =>
  `${BASE_URL}/api/appointments/${appointmentId}/inspection-quote`;
export const APPOINTMENT_QUOTE_RESPONSE_ENDPOINT = (appointmentId: string) =>
  `${BASE_URL}/api/appointments/${appointmentId}/quote-response`;
export const APPOINTMENT_VIEW_QUOTE_ENDPOINT = (appointmentId: string) =>
  `${BASE_URL}/api/appointments/${appointmentId}/quote`;
export const TECHNICIAN_PROGRESS_START_MAINTENANCE_ENDPOINT = (
  progressId: string
) => `${BASE_URL}/api/work-progress/${progressId}/start-maintenance`;
export const TECHNICIAN_PROGRESS_COMPLETE_MAINTENANCE_ENDPOINT = (
  progressId: string
) => `${BASE_URL}/api/work-progress/${progressId}/complete-maintenance`;

// Payment endpoints
export const PAYMENT_CREATE_ENDPOINT = (appointmentId: string) =>
  `${BASE_URL}/api/payment/booking/${appointmentId}`;
export const PAYMENT_STATUS_ENDPOINT = (paymentId: string) =>
  `${BASE_URL}/api/payment/${paymentId}/status`;
export const PAYMENT_SYNC_ENDPOINT = (orderCode: string) =>
  `${BASE_URL}/api/payment/sync/${orderCode}`;
export const PAYMENT_CANCEL_ENDPOINT = (paymentId: string) =>
  `${BASE_URL}/api/payment/${paymentId}/cancel`;
export const MY_PAYMENTS_ENDPOINT = `${BASE_URL}/api/payment/my-payments`;
export const PAYMENT_WEBHOOK_ENDPOINT = `${BASE_URL}/api/payment/webhook`;
export const PAYOS_PAYMENT_INFO_ENDPOINT = (orderCode: string) =>
  `${BASE_URL}/api/payment/${orderCode}`;
export const PAYOS_CANCEL_ENDPOINT = (orderCode: string) =>
  `${BASE_URL}/api/payment/${orderCode}/cancel`;

// Parts management endpoints
export const PARTS_ENDPOINT = `${BASE_URL}/api/parts`;
export const PART_DETAIL_ENDPOINT = (partId: string) =>
  `${BASE_URL}/api/parts/${partId}`;
export const PARTS_BY_CATEGORY_ENDPOINT = (category: string) =>
  `${BASE_URL}/api/parts/category/${category}`;
export const COMPATIBLE_PARTS_BY_MODEL_ENDPOINT = (vehicleModelId: string) =>
  `${BASE_URL}/api/vehicle-models/${vehicleModelId}/compatible-parts`;

// Inventory management endpoints
export const INVENTORY_ENDPOINT = `${BASE_URL}/api/inventory`;
export const INVENTORY_DETAIL_ENDPOINT = (inventoryId: string) =>
  `${BASE_URL}/api/inventory/${inventoryId}`;
export const INVENTORY_LOW_STOCK_ALERTS_ENDPOINT = `${BASE_URL}/api/inventory/alerts/low-stock`;
export const INVENTORY_STATS_ENDPOINT = (centerId: string) =>
  `${BASE_URL}/api/service-centers/${centerId}/inventory-stats`;
export const INVENTORY_TRANSACTIONS_ENDPOINT = `${BASE_URL}/api/inventory/transactions`;

// AI optimization endpoints
export const AI_PREDICTIONS_ENDPOINT = `${BASE_URL}/api/ai/predictions`;
export const AI_PREDICTION_DETAIL_ENDPOINT = (predictionId: string) =>
  `${BASE_URL}/api/ai/predictions/${predictionId}`;
export const AI_DEMAND_FORECAST_ENDPOINT = `${BASE_URL}/api/ai/demand-forecast`;
export const AI_STOCK_OPTIMIZATION_ENDPOINT = `${BASE_URL}/api/ai/stock-optimization`;
export const AI_APPLY_RECOMMENDATIONS_ENDPOINT = `${BASE_URL}/api/ai/apply-recommendations`;

// AI Prediction endpoints
export const AI_PREDICTION_GENERATE_ENDPOINT = (centerId: string) =>
  `${BASE_URL}/api/ai-prediction/generate/${centerId}`;
export const AI_PREDICTION_REGENERATE_ENDPOINT = (centerId: string) =>
  `${BASE_URL}/api/ai-prediction/regenerate/${centerId}`;
export const AI_PREDICTION_LATEST_ENDPOINT = (centerId: string) =>
  `${BASE_URL}/api/ai-prediction/latest/${centerId}`;
export const AI_PREDICTION_HISTORY_ENDPOINT = (centerId: string) =>
  `${BASE_URL}/api/ai-prediction/history/${centerId}`;
export const AI_PREDICTION_STATS_ENDPOINT = (centerId: string) =>
  `${BASE_URL}/api/ai-prediction/stats/${centerId}`;

// Dashboard endpoints
export const DASHBOARD_OVERVIEW_ENDPOINT = `${BASE_URL}/api/dashboard/overview`;
export const DASHBOARD_REVENUE_ANALYTICS_ENDPOINT = `${BASE_URL}/api/dashboard/revenue-analytics`;
export const DASHBOARD_BOOKING_ANALYTICS_ENDPOINT = `${BASE_URL}/api/dashboard/booking-analytics`;
export const DASHBOARD_CUSTOMER_GROWTH_ENDPOINT = `${BASE_URL}/api/dashboard/customer-growth`;
export const DASHBOARD_SERVICE_CENTER_PERFORMANCE_ENDPOINT = `${BASE_URL}/api/dashboard/service-center-performance`;
export const DASHBOARD_INVENTORY_STATS_ENDPOINT = `${BASE_URL}/api/dashboard/inventory-stats`;
export const DASHBOARD_RECENT_ACTIVITIES_ENDPOINT = `${BASE_URL}/api/dashboard/recent-activities`;
export const DASHBOARD_TOP_CUSTOMERS_ENDPOINT = `${BASE_URL}/api/dashboard/top-customers`;

// Chat endpoints
const CHAT_BASE_ENDPOINT = `${BASE_URL}/api/chat`;
export const CHAT_BOOKINGS_ENDPOINT = `${CHAT_BASE_ENDPOINT}/bookings`;
export const CHAT_CONVERSATIONS_ENDPOINT = `${CHAT_BASE_ENDPOINT}/conversations`;
export const CHAT_UNREAD_COUNT_ENDPOINT = `${CHAT_BASE_ENDPOINT}/unread-count`;
export const CHAT_CONVERSATION_MESSAGES_ENDPOINT = (
  conversationId: string,
  page?: number,
  limit?: number
) => {
  const params: string[] = [];
  if (typeof page === "number") {
    params.push(`page=${page}`);
  }
  if (typeof limit === "number") {
    params.push(`limit=${limit}`);
  }
  const queryString = params.length ? `?${params.join("&")}` : "";
  return `${CHAT_CONVERSATIONS_ENDPOINT}/${conversationId}/messages${queryString}`;
};
export const CHAT_CONVERSATION_MARK_READ_ENDPOINT = (conversationId: string) =>
  `${CHAT_CONVERSATIONS_ENDPOINT}/${conversationId}/read`;
export const CHAT_CONVERSATION_SEND_MESSAGE_ENDPOINT = (
  conversationId: string
) => `${CHAT_CONVERSATIONS_ENDPOINT}/${conversationId}/messages`;
