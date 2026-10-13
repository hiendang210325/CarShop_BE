import { prisma } from '../database/prisma';
import {
  SEED_USERS,
  SEED_CARS,
  SEED_LEADS,
  SEED_ORDERS,
  SEED_TEST_DRIVES,
  SEED_ACTIVITIES,
} from '../database/initialData';
import { logger } from '../utils/logger';
import { Prisma } from '@prisma/client';

const runSeed = async () => {
  logger.info('🌱 Starting CarShop PostgreSQL Database Seeding (Neon.tech)...');
  try {
    // Clean up in reverse dependency order
    logger.info('Cleaning up existing records...');
    await prisma.recentActivity.deleteMany();
    await prisma.testDriveBooking.deleteMany();
    await prisma.order.deleteMany();
    await prisma.customerLead.deleteMany();
    await prisma.car.deleteMany();
    await prisma.user.deleteMany();

    // 1. Seed Users
    logger.info(`Seeding ${SEED_USERS.length} users...`);
    for (const user of SEED_USERS) {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email.toLowerCase(),
          password: user.password!,
          fullName: user.fullName,
          role: user.role,
          department: user.department,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          createdAt: new Date(user.createdAt),
        },
      });
    }

    // 2. Seed Cars
    logger.info(`Seeding ${SEED_CARS.length} luxury cars...`);
    for (const car of SEED_CARS) {
      await prisma.car.create({
        data: {
          id: car.id,
          vin: car.vin,
          brand: car.brand,
          model: car.model,
          year: car.year,
          color: car.color,
          bodyType: car.bodyType,
          fuelType: car.fuelType,
          transmission: car.transmission,
          price: car.price,
          costPrice: car.costPrice,
          status: car.status,
          specs: car.specs as unknown as Prisma.InputJsonValue,
          imageUrl: car.imageUrl,
          galleryUrls: car.galleryUrls || [],
          description: car.description,
          createdAt: new Date(car.createdAt),
          updatedAt: new Date(car.updatedAt),
        },
      });
    }

    // 3. Seed Customer Leads
    logger.info(`Seeding ${SEED_LEADS.length} customer leads...`);
    for (const lead of SEED_LEADS) {
      await prisma.customerLead.create({
        data: {
          id: lead.id,
          fullName: lead.fullName,
          phone: lead.phone,
          email: lead.email,
          interestedCarBrand: lead.interestedCarBrand,
          interestedCarModel: lead.interestedCarModel,
          budgetRange: lead.budgetRange,
          status: lead.status,
          notes: lead.notes,
          assignedStaffName: lead.assignedStaffName,
          createdAt: new Date(lead.createdAt),
        },
      });
    }

    // 4. Seed Orders
    logger.info(`Seeding ${SEED_ORDERS.length} orders...`);
    for (const order of SEED_ORDERS) {
      await prisma.order.create({
        data: {
          id: order.id,
          orderCode: order.orderCode,
          carId: order.carId,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail,
          salesPersonId: order.salesPersonId,
          totalAmount: order.totalAmount,
          depositAmount: order.depositAmount,
          status: order.status,
          paymentMethod: order.paymentMethod,
          notes: order.notes,
          deliveryDate: order.deliveryDate ? new Date(order.deliveryDate) : undefined,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
        },
      });
    }

    // 5. Seed Test Drives
    logger.info(`Seeding ${SEED_TEST_DRIVES.length} test drive bookings...`);
    for (const td of SEED_TEST_DRIVES) {
      await prisma.testDriveBooking.create({
        data: {
          id: td.id,
          customerName: td.customerName,
          customerPhone: td.customerPhone,
          carName: td.carName,
          bookingDate: new Date(td.bookingDate),
          status: td.status,
          notes: td.notes,
          createdAt: new Date(td.createdAt),
        },
      });
    }

    // 6. Seed Recent Activities
    logger.info(`Seeding ${SEED_ACTIVITIES.length} activity logs...`);
    for (const act of SEED_ACTIVITIES) {
      await prisma.recentActivity.create({
        data: {
          id: act.id,
          type: act.type,
          title: act.title,
          description: act.description,
          user: act.user,
          timestamp: new Date(act.timestamp),
        },
      });
    }

    logger.info('🎉 Database seeding completed successfully on Neon PostgreSQL!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

runSeed();
