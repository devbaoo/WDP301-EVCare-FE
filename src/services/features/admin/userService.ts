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
}

export const fetchAllUsers = async (): Promise<AppUser[]> => {
  try {
    const res = await axiosInstance.get(GET_ALL_USERS_ENDPOINT);
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? (data as AppUser[]) : (data?.users || []);
  } catch (_) {
    return [];
  }
};


