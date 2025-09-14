export const BASE_URL = "https://dolphin-app-pwai8.ondigitalocean.app";

// Auth endpoints
export const LOGIN_ENDPOINT = `${BASE_URL}/api/auth/login`;
export const REGISTER_ENDPOINT = `${BASE_URL}/api/auth/register`;
export const VERIFY_EMAIL_ENDPOINT = `${BASE_URL}/api/auth/verify-email`;
export const VERIFY_EMAIL_TOKEN_ENDPOINT = (token: string) => `${BASE_URL}/api/auth/verify-email/${token}`;
export const RESEND_VERIFICATION_ENDPOINT = `${BASE_URL}/api/auth/resend-verification`;
export const RESET_PASSWORD_ENDPOINT = `${BASE_URL}/api/auth/reset-password`;
export const UPDATE_PASSWORD_ENDPOINT = `${BASE_URL}/api/auth/update-password`;
export const VERIFY_RESET_CODE_ENDPOINT = `${BASE_URL}/api/auth/verify-reset-code`;
export const LOGOUT_ENDPOINT = `${BASE_URL}/api/auth/logout`;
export const REFRESH_TOKEN_ENDPOINT = `${BASE_URL}/api/auth/refresh`;

// Service Center endpoints
export const SERVICE_CENTERS_ENDPOINT = `${BASE_URL}/api/service-centers`;
export const SERVICE_CENTER_DETAIL_ENDPOINT = (id: string) => `${BASE_URL}/api/service-centers/${id}`;
export const SERVICE_CENTER_NEARBY_ENDPOINT = `${BASE_URL}/api/service-centers/nearby/search`;

