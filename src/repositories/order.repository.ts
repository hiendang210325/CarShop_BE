import { prisma } from '../database/prisma';
import { Order, OrderStatus, PaymentMethod } from '../types/order.types';
import { CarBodyType, CarSpecs, CarStatus, FuelType, Transmission } from '../types/car.types';
import { Role } from '../constants';
import { Prisma } from '@prisma/client';

export class OrderRepository {
  private formatOrder(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ord: any
  ): Order {
    const formatted: Order = {
      id: ord.id,
      orderCode: ord.orderCode,
      carId: ord.carId,
      customerName: ord.customerName,
      customerPhone: ord.customerPhone,
      customerEmail: ord.customerEmail,
      salesPersonId: ord.salesPersonId,
      totalAmount: ord.totalAmount,
      depositAmount: ord.depositAmount,
      status: ord.status as OrderStatus,
      paymentMethod: ord.paymentMethod as PaymentMethod,
      notes: ord.notes ?? undefined,
      deliveryDate: ord.deliveryDate ? ord.deliveryDate.toISOString() : undefined,
      createdAt: ord.createdAt.toISOString(),
      updatedAt: ord.updatedAt.toISOString(),
    };

    if (ord.car) {
      formatted.car = {
        ...ord.car,
        bodyType: ord.car.bodyType as CarBodyType,
        fuelType: ord.car.fuelType as FuelType,
        transmission: ord.car.transmission as Transmission,
        status: ord.car.status as CarStatus,
        specs: ord.car.specs as unknown as CarSpecs,
        createdAt: ord.car.createdAt.toISOString(),
        updatedAt: ord.car.updatedAt.toISOString(),
      };
    }

    if (ord.salesPerson) {
      formatted.salesPerson = {
        id: ord.salesPerson.id,
        email: ord.salesPerson.email,
        fullName: ord.salesPerson.fullName,
        role: ord.salesPerson.role as Role,
        department: ord.salesPerson.department ?? undefined,
        phone: ord.salesPerson.phone ?? undefined,
        avatarUrl: ord.salesPerson.avatarUrl ?? undefined,
        createdAt: ord.salesPerson.createdAt.toISOString(),
      };
    }

    return formatted;
  }

  async findAll(params: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: Order[]; total: number }> {
    const where: Prisma.OrderWhereInput = {};

    if (params.status && params.status !== 'ALL') {
      where.status = params.status as OrderStatus;
    }

    if (params.search) {
      where.OR = [
        { orderCode: { contains: params.search, mode: 'insensitive' } },
        { customerName: { contains: params.search, mode: 'insensitive' } },
        { customerPhone: { contains: params.search, mode: 'insensitive' } },
        { customerEmail: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const page = params.page && params.page > 0 ? params.page : 1;
    const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 10;
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          car: true,
          salesPerson: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      items: items.map((o) => this.formatOrder(o)),
      total,
    };
  }

  async findById(id: string): Promise<Order | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        car: true,
        salesPerson: true,
      },
    });
    if (!order) return null;
    return this.formatOrder(order);
  }

  async findByOrderCode(code: string): Promise<Order | null> {
    const order = await prisma.order.findUnique({
      where: { orderCode: code },
      include: {
        car: true,
        salesPerson: true,
      },
    });
    if (!order) return null;
    return this.formatOrder(order);
  }

  async create(orderData: Order): Promise<Order> {
    const created = await prisma.order.create({
      data: {
        id: orderData.id,
        orderCode: orderData.orderCode,
        carId: orderData.carId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerEmail: orderData.customerEmail,
        salesPersonId: orderData.salesPersonId,
        totalAmount: orderData.totalAmount,
        depositAmount: orderData.depositAmount,
        status: orderData.status,
        paymentMethod: orderData.paymentMethod,
        notes: orderData.notes,
        deliveryDate: orderData.deliveryDate ? new Date(orderData.deliveryDate) : undefined,
      },
      include: {
        car: true,
        salesPerson: true,
      },
    });

    return this.formatOrder(created);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        car: true,
        salesPerson: true,
      },
    });

    return this.formatOrder(updated);
  }

  async count(): Promise<number> {
    return prisma.order.count();
  }
}

export const orderRepository = new OrderRepository();
