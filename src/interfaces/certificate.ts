export interface Certificate {
  _id: string;
  technicianId: string;
  certificateName: string;
  issuingAuthority?: string;
  issueDate: string;
  expiryDate?: string;
  certificateNumber?: string;
  specialization?: string;
  status?: 'active' | 'expired' | 'revoked';
  documentUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
