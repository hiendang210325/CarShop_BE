import { v4 as uuidv4 } from 'uuid';
import { orderRepository } from '../repositories/order.repository';
import { carRepository } from '../repositories/car.repository';
import { activityRepository } from '../repositories/activity.repository';
import { Order, OrderStatus, PaymentMethod } from '../types/order.types';
import { SafeUser } from '../types/auth.types';
import { AppError } from '../utils/AppError';
import { CAR_STATUS, ORDER_STATUS } from '../constants';

export class OrderService {
  async getOrders(params: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    return orderRepository.findAll(params);
  }

  async getOrderById(id: string): Promise<Order> {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw AppError.notFound(`Order with ID '${id}' not found`);
    }
    return order;
  }

  async createOrder(
    data: {
      carId: string;
      customerName: string;
      customerPhone: string;
      customerEmail: string;
      totalAmount: number;
      depositAmount: number;
      paymentMethod: PaymentMethod;
      notes?: string;
      deliveryDate?: string;
    },
    currentUser?: SafeUser
  ): Promise<Order> {
    const car = await carRepository.findById(data.carId);
    if (!car) {
      throw AppError.notFound(`Car with ID '${data.carId}' not found`);
    }

    if (car.status === CAR_STATUS.SOLD) {
      throw AppError.badRequest('This car has already been sold and cannot be ordered');
    }

    const orderId = `ord-${uuidv4().slice(0, 8)}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `ORD-${new Date().getFullYear()}-${randomSuffix}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      id: orderId,
      orderCode,
      carId: data.carId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      salesPersonId: currentUser?.id || 'user-mgr-02',
      totalAmount: data.totalAmount,
      depositAmount: data.depositAmount,
      status: ORDER_STATUS.PENDING,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      deliveryDate: data.deliveryDate,
      createdAt: now,
      updatedAt: now,
    };

    // Update car status to RESERVED
    await carRepository.update(car.id, { status: CAR_STATUS.RESERVED });

    const created = await orderRepository.create(newOrder);

    // Audit activity
    await activityRepository.logActivity({
      id: `act-${uuidv4().slice(0, 8)}`,
      type: 'ORDER_CREATED',
      title: 'Đơn hàng mới được tạo',
      description: `Đơn hàng ${orderCode} cho khách hàng ${data.customerName} với xe ${car.brand} ${car.model}.`,
      user: currentUser?.fullName || 'Hệ Thống',
      timestamp: now,
    });

    return created;
  }

  async updateOrderStatus(id: string, status: OrderStatus, currentUser?: SafeUser): Promise<Order> {
    const existing = await orderRepository.findById(id);
    if (!existing) {
      throw AppError.notFound(`Order with ID '${id}' not found`);
    }

    const updated = await orderRepository.updateStatus(id, status);
    if (!updated) {
      throw AppError.notFound(`Order with ID '${id}' could not be updated`);
    }

    // If order is completed, mark car as SOLD
    if (status === ORDER_STATUS.COMPLETED && updated.carId) {
      await carRepository.update(updated.carId, { status: CAR_STATUS.SOLD });
    }

    // If order is cancelled, release car back to AVAILABLE
    if (status === ORDER_STATUS.CANCELLED && updated.carId) {
      await carRepository.update(updated.carId, { status: CAR_STATUS.AVAILABLE });
    }

    // Audit activity
    await activityRepository.logActivity({
      id: `act-${uuidv4().slice(0, 8)}`,
      type: status === ORDER_STATUS.COMPLETED ? 'LEAD_WON' : 'STATUS_CHANGED',
      title: `Cập nhật trạng thái đơn hàng ${updated.orderCode}`,
      description: `Đơn hàng ${updated.orderCode} chuyển sang trạng thái '${status}'.`,
      user: currentUser?.fullName || 'Hệ Thống',
      timestamp: new Date().toISOString(),
    });

    return updated;
  }
}

export const orderService = new OrderService();
