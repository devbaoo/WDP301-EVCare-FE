export const BASE_URL = "https://dolphin-app-pwai8.ondigitalocean.app";

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
export const VERIFY_RESET_CODE_ENDPOINT = `${BASE_URL}/api/auth/verify-reset-code`;
export const LOGOUT_ENDPOINT = `${BASE_URL}/api/auth/logout`;
export const REFRESH_TOKEN_ENDPOINT = `${BASE_URL}/api/auth/refresh`;

// User endpoints
export const USER_PROFILE_ENDPOINT = `${BASE_URL}/api/user/profile`;
export const USER_UPDATE_PROFILE_ENDPOINT = `${BASE_URL}/api/user/profile`;
export const USER_UPLOAD_AVATAR_ENDPOINT = `${BASE_URL}/api/user/upload-avatar`;

// Service Center endpoints
export const SERVICE_CENTERS_ENDPOINT = `${BASE_URL}/api/service-centers`;
export const SERVICE_CENTER_DETAIL_ENDPOINT = (id: string) =>
  `${BASE_URL}/api/service-centers/${id}`;
export const SERVICE_CENTER_NEARBY_ENDPOINT = `${BASE_URL}/api/service-centers/nearby/search`;

// Vehicle endpoints
export const VEHICLES_ENDPOINT = `${BASE_URL}/api/vehicles`;
export const CREATE_VEHICLE_ENDPOINT = `${BASE_URL}/api/vehicles`;

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

//servicetype
export const SERVICE_TYPE_POPULAR_ENDPOINT = `${BASE_URL}/api/service-types/popular/list`;
