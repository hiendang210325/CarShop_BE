import { z } from 'zod';
import { ORDER_STATUS, PAYMENT_METHOD } from '../constants';

export const createOrderSchema = z.object({
  body: z.object({
    carId: z.string().min(1, 'Car ID is required'),
    customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
    customerPhone: z.string().min(8, 'Phone number must be at least 8 characters'),
    customerEmail: z.string().email('Please enter a valid customer email'),
    totalAmount: z.number().positive('Total amount must be greater than 0'),
    depositAmount: z.number().nonnegative('Deposit amount must be non-negative'),
    paymentMethod: z.enum([
      PAYMENT_METHOD.BANK_TRANSFER,
      PAYMENT_METHOD.INSTALLMENT,
      PAYMENT_METHOD.CASH,
      PAYMENT_METHOD.CREDIT_CARD,
    ]),
    notes: z.string().optional(),
    deliveryDate: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Order ID is required'),
  }),
  body: z.object({
    status: z.enum([
      ORDER_STATUS.PENDING,
      ORDER_STATUS.APPROVED,
      ORDER_STATUS.DELIVERING,
      ORDER_STATUS.COMPLETED,
      ORDER_STATUS.CANCELLED,
    ]),
  }),
});

export const orderQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.string().optional(),
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    pageSize: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
});
