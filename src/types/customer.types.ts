import { LEAD_STATUS } from '../constants';

export type LeadStatus = (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS];

export interface CustomerLead {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  interestedCarBrand: string;
  interestedCarModel: string;
  budgetRange: string;
  status: LeadStatus;
  notes: string;
  assignedStaffName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TestDriveBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  carName: string;
  bookingDate: string;
  status: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}
