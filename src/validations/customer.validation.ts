import { z } from 'zod';
import { LEAD_STATUS } from '../constants';

export const createLeadSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    phone: z.string().min(8, 'Phone number is required'),
    email: z.string().email('Valid email is required'),
    interestedCarBrand: z.string().min(1, 'Interested brand is required'),
    interestedCarModel: z.string().min(1, 'Interested model is required'),
    budgetRange: z.string().min(1, 'Budget range is required'),
    status: z.enum([
      LEAD_STATUS.NEW,
      LEAD_STATUS.CONTACTED,
      LEAD_STATUS.TEST_DRIVE_SCHEDULED,
      LEAD_STATUS.NEGOTIATING,
      LEAD_STATUS.WON,
      LEAD_STATUS.LOST,
    ]).default(LEAD_STATUS.NEW),
    notes: z.string().default(''),
    assignedStaffName: z.string().default('Trần Minh Hoàng'),
  }),
});

export const updateLeadSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Lead ID is required'),
  }),
  body: createLeadSchema.shape.body.partial(),
});

export const createTestDriveSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, 'Customer name is required'),
    customerPhone: z.string().min(8, 'Phone number is required'),
    carName: z.string().min(1, 'Car name is required'),
    bookingDate: z.string().min(1, 'Booking date is required'),
    notes: z.string().optional(),
  }),
});
