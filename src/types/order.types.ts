import { ORDER_STATUS, PAYMENT_METHOD } from '../constants';
import { Car } from './car.types';
import { SafeUser } from './auth.types';

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export interface Order {
  id: string;
  orderCode: string;
  carId: string;
  car?: Car;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  salesPersonId: string;
  salesPerson?: SafeUser;
  totalAmount: number;
  depositAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  deliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}
