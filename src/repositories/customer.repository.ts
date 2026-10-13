import { prisma } from '../database/prisma';
import { CustomerLead, LeadStatus, TestDriveBooking } from '../types/customer.types';

export class CustomerRepository {
  async findAllLeads(): Promise<CustomerLead[]> {
    const leads = await prisma.customerLead.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return leads.map((l) => ({
      ...l,
      status: l.status as LeadStatus,
      notes: l.notes ?? '',
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    }));
  }

  async findLeadById(id: string): Promise<CustomerLead | null> {
    const lead = await prisma.customerLead.findUnique({ where: { id } });
    if (!lead) return null;
    return {
      ...lead,
      status: lead.status as LeadStatus,
      notes: lead.notes ?? '',
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
    };
  }

  async createLead(leadData: CustomerLead): Promise<CustomerLead> {
    const created = await prisma.customerLead.create({
      data: {
        id: leadData.id,
        fullName: leadData.fullName,
        phone: leadData.phone,
        email: leadData.email,
        interestedCarBrand: leadData.interestedCarBrand,
        interestedCarModel: leadData.interestedCarModel,
        budgetRange: leadData.budgetRange,
        status: leadData.status,
        notes: leadData.notes,
        assignedStaffName: leadData.assignedStaffName,
      },
    });

    return {
      ...created,
      status: created.status as LeadStatus,
      notes: created.notes ?? '',
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  async updateLead(id: string, updates: Partial<CustomerLead>): Promise<CustomerLead | null> {
    const updated = await prisma.customerLead.update({
      where: { id },
      data: updates,
    });

    return {
      ...updated,
      status: updated.status as LeadStatus,
      notes: updated.notes ?? '',
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async findAllTestDrives(): Promise<TestDriveBooking[]> {
    const items = await prisma.testDriveBooking.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return items.map((t) => ({
      ...t,
      status: t.status as 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED',
      bookingDate: t.bookingDate.toISOString(),
      notes: t.notes ?? undefined,
      createdAt: t.createdAt.toISOString(),
    }));
  }

  async createTestDrive(booking: TestDriveBooking): Promise<TestDriveBooking> {
    const created = await prisma.testDriveBooking.create({
      data: {
        id: booking.id,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        carName: booking.carName,
        bookingDate: new Date(booking.bookingDate),
        status: booking.status,
        notes: booking.notes,
      },
    });

    return {
      ...created,
      status: created.status as 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED',
      bookingDate: created.bookingDate.toISOString(),
      notes: created.notes ?? undefined,
      createdAt: created.createdAt.toISOString(),
    };
  }

  async countLeads(): Promise<number> {
    return prisma.customerLead.count();
  }
}

export const customerRepository = new CustomerRepository();
