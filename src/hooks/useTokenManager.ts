import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../services/store/store";
import {
  refreshAuthToken,
  getTokenExpiration,
  isTokenExpired,
} from "../services/auth/tokenManager";
import { logout } from "../services/features/auth/authSlice";

/**
 * Hook to manage automatic token refresh
 * @param checkInterval - Interval in minutes to check token validity (default: 15)
 * @param refreshBuffer - Minutes before expiration to trigger refresh (default: 5)
 */
export const useTokenManager = (
  checkInterval: number = 15,
  refreshBuffer: number = 5
) => {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    // Check if current token is already expired
    if (isTokenExpired(token)) {
      dispatch(logout());
      return;
    }

    const checkTokenValidity = async () => {
      if (!token || !isAuthenticated) return;

      const exp = getTokenExpiration(token);
      if (!exp) {
        dispatch(logout());
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      const bufferSeconds = refreshBuffer * 60;

      // If token expires within buffer time, refresh it
      if (exp - now < bufferSeconds) {
        const success = await refreshAuthToken();
        if (!success) {
          dispatch(logout());
        }
      }
    };

    // Initial check
    checkTokenValidity();

    // Set up periodic checks
    const interval = setInterval(checkTokenValidity, checkInterval * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [token, isAuthenticated, dispatch, checkInterval, refreshBuffer]);
};

/**
 * Hook to provide manual token refresh functionality
 */
export const useRefreshToken = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.auth);

  const refresh = async (): Promise<boolean> => {
    try {
      return await refreshAuthToken();
    } catch (error) {
      console.error("Token refresh failed:", error);
      dispatch(logout());
      return false;
    }
  };

  return {
    refresh,
    isRefreshing: loading,
  };
};
