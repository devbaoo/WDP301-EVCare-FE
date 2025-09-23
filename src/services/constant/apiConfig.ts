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
