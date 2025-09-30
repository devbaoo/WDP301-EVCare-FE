import { store } from "../store/store";
import { refreshToken, logout } from "../features/auth/authSlice";

/**
 * Manually refresh the authentication token using Redux store
 * This is useful for proactive token refresh before expiration
 * @returns Promise<boolean> - Returns true if refresh was successful, false otherwise
 */
export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const result = await store.dispatch(refreshToken());

    if (refreshToken.fulfilled.match(result)) {
      return true;
    } else {
      // If refresh failed, logout the user
      store.dispatch(logout());
      return false;
    }
  } catch (error) {
    console.error("Manual token refresh failed:", error);
    store.dispatch(logout());
    return false;
  }
};

/**
 * Check if token is about to expire and refresh if needed
 * @param tokenExp - Token expiration timestamp
 * @param bufferMinutes - Minutes before expiration to trigger refresh (default: 5)
 * @returns Promise<boolean> - Returns true if token is still valid or refresh was successful
 */
export const ensureTokenValidity = async (
  tokenExp?: number,
  bufferMinutes: number = 5
): Promise<boolean> => {
  if (!tokenExp) {
    return true; // If no expiration info, assume valid
  }

  const now = Math.floor(Date.now() / 1000);
  const bufferSeconds = bufferMinutes * 60;

  // If token expires within buffer time, refresh it
  if (tokenExp - now < bufferSeconds) {
    return await refreshAuthToken();
  }

  return true;
};

/**
 * Get token expiration time from JWT token
 * @param token - JWT token string
 * @returns number | null - Expiration timestamp or null if invalid
 */
export const getTokenExpiration = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp || null;
  } catch (error) {
    console.error("Failed to parse token:", error);
    return null;
  }
};

/**
 * Check if a token is expired
 * @param token - JWT token string
 * @returns boolean - True if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const exp = getTokenExpiration(token);
  if (!exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return exp < now;
};
