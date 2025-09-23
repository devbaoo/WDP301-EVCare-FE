import axiosInstance from '../../constant/axiosInstance';
import { Certificate } from '../../../interfaces/certificate';

// Định nghĩa endpoint
import {
  CERTIFICATE_ENDPOINT,
  CERTIFICATE_DETAIL_ENDPOINT,
} from '../../constant/apiConfig';

// Lấy danh sách certificate
export const fetchCertificates = async (): Promise<Certificate[]> => {
  const res = await axiosInstance.get(CERTIFICATE_ENDPOINT);
  return res.data?.data || res.data;
};

// Lấy chi tiết certificate
export const fetchCertificateById = async (id: string): Promise<Certificate> => {
  const res = await axiosInstance.get(CERTIFICATE_DETAIL_ENDPOINT(id));
  return res.data?.data || res.data;
};

// Tạo mới certificate
export const createCertificate = async (data: Omit<Certificate, '_id' | 'createdAt' | 'updatedAt'>): Promise<Certificate> => {
  const res = await axiosInstance.post(CERTIFICATE_ENDPOINT, data);
  return res.data?.data || res.data;
};

// Cập nhật certificate
export const updateCertificate = async (id: string, data: Partial<Omit<Certificate, '_id' | 'createdAt' | 'updatedAt'>>): Promise<Certificate> => {
  const res = await axiosInstance.put(CERTIFICATE_DETAIL_ENDPOINT(id), data);
  return res.data?.data || res.data;
};

