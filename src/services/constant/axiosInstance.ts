import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { BASE_URL, REFRESH_TOKEN_ENDPOINT } from "./apiConfig";

// Track if we're currently refreshing token to avoid multiple concurrent refresh calls
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Function to add subscribers waiting for token refresh
const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Function to notify all subscribers when refresh is complete
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Function to handle token refresh
const refreshTokenRequest = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post(
      REFRESH_TOKEN_ENDPOINT,
      {
        refreshToken: refreshToken,
      },
      {
        baseURL: BASE_URL,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Update stored tokens
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);

    return accessToken;
  } catch (error) {
    // If refresh fails, clear all tokens and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Dispatch logout action to update store state
    if (typeof window !== "undefined" && window.location) {
      // Redirect to login page
      window.location.href = "/login";
    }

    throw error;
  }
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and automatic token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If a refresh is already in progress, wait for it to complete
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshTokenRequest();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          onRefreshed(newToken);
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Notify waiting requests that refresh failed
        onRefreshed("");

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// HTTP Methods
export const api = {
  // GET request
  get: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.get(url, config);
  },

  // POST request
  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.post(url, data, config);
  },

  // PUT request
  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.put(url, data, config);
  },

  // PATCH request
  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.patch(url, data, config);
  },

  // DELETE request
  delete: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.delete(url, config);
  },

  // Upload file
  upload: <T = any>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.post(url, formData, {
      ...config,
      headers: {
        "Content-Type": "multipart/form-data",
        ...config?.headers,
      },
    });
  },

  // Download file
  download: (
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<Blob>> => {
    return axiosInstance.get(url, {
      ...config,
      responseType: "blob",
    });
  },
};

export default axiosInstance;

// Export refresh token function for manual use
export { refreshTokenRequest };
