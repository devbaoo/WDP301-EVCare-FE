import axiosInstance from "../../constant/axiosInstance";
import { GET_ALL_USERS_ENDPOINT } from "../../constant/apiConfig";

export interface AppUser {
  _id: string;
  username?: string;
  email: string;
  isVerified?: boolean;
  fullName?: string;
  phone?: string;
  address?: string;
  role: string;
  createdAt?: string;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: AppUser[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export const fetchAllUsers = async (params?: { page?: number; limit?: number; search?: string; role?: string; sort?: string }): Promise<UsersResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.role && params.role !== "all") queryParams.append("role", params.role);
    if (params?.sort) queryParams.append("sort", params.sort);

    const url = queryParams.toString()
      ? `${GET_ALL_USERS_ENDPOINT}?${queryParams.toString()}`
      : GET_ALL_USERS_ENDPOINT;

    const res = await axiosInstance.get(url);
    return res.data;
  } catch (error) {
    throw error;
  }
};


