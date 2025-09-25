import axiosInstance from '../../constant/axiosInstance';
import { STAFF_LIST_ENDPOINT } from '../../constant/apiConfig';

export interface StaffUser {
  _id: string;
  username?: string;
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  isVerified?: boolean;
  role: string;
}

export const fetchTechnicians = async (): Promise<StaffUser[]> => {
  const res = await axiosInstance.get(STAFF_LIST_ENDPOINT);
  const allStaff = res.data?.staff || res.data;
  return Array.isArray(allStaff)
    ? allStaff.filter((u) => u.role === 'technician')
    : [];
};


export const fetchAllStaff = async (): Promise<StaffUser[]> => {
  const res = await axiosInstance.get(STAFF_LIST_ENDPOINT);
  const allStaff = res.data?.staff || res.data;
  return Array.isArray(allStaff)
    ? allStaff
    : [];
};

export const fetchStaff = async (): Promise<StaffUser[]> => {
  const res = await axiosInstance.get(STAFF_LIST_ENDPOINT);
  const allStaff = res.data?.staff || res.data;
  return Array.isArray(allStaff)
    ? allStaff.filter((u) => u.role === 'staff')
    : [];
};
