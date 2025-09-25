export const BASE_URL = "https://dolphin-app-pwai8.ondigitalocean.app";
// export const BASE_URL = "http://localhost:8080";

// Auth endpoints
export const LOGIN_ENDPOINT = `${BASE_URL}/api/auth/login`;
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
export const REFRESH_TOKEN_ENDPOINT = `${BASE_URL}/api/auth/refresh`;

// Staff endpoints
export const STAFF_LIST_ENDPOINT = `${BASE_URL}/api/staff`;
export const STAFF_ASSIGNMENT_LIST_ENDPOINT = `${BASE_URL}/api/staff-assignments`;


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

// Vehicle endpoints
export const VEHICLES_ENDPOINT = `${BASE_URL}/api/vehicles`;
export const CREATE_VEHICLE_ENDPOINT = `${BASE_URL}/api/vehicles`;
export const VEHICLE_DETAIL_ENDPOINT = (vehicleId: string) =>
  `${BASE_URL}/api/vehicles/${vehicleId}`;
export const UPDATE_VEHICLE_ENDPOINT = (vehicleId: string) =>
  `${BASE_URL}/api/vehicles/${vehicleId}`;
export const DELETE_VEHICLE_ENDPOINT = (vehicleId: string) =>
  `${BASE_URL}/api/vehicles/${vehicleId}`;

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
export const TECHNICIAN_PROGRESS_QUOTE_RESPONSE_ENDPOINT = (
  progressId: string
) => `${BASE_URL}/api/work-progress/${progressId}/quote-response`;
export const TECHNICIAN_PROGRESS_INSPECTION_QUOTE_ENDPOINT = (
  progressId: string
) => `${BASE_URL}/api/work-progress/${progressId}/inspection-quote`;
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
