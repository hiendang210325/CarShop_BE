import { v4 as uuidv4 } from 'uuid';
import { customerRepository } from '../repositories/customer.repository';
import { activityRepository } from '../repositories/activity.repository';
import { CustomerLead, TestDriveBooking } from '../types/customer.types';
import { AppError } from '../utils/AppError';

export class CustomerService {
  async getLeads(): Promise<CustomerLead[]> {
    return customerRepository.findAllLeads();
  }

  async getLeadById(id: string): Promise<CustomerLead> {
    const lead = await customerRepository.findLeadById(id);
    if (!lead) {
      throw AppError.notFound(`Lead with ID '${id}' not found`);
    }
    return lead;
  }

  async createLead(leadData: Omit<CustomerLead, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomerLead> {
    const now = new Date().toISOString();
    const newLead: CustomerLead = {
      ...leadData,
      id: `lead-${uuidv4().slice(0, 8)}`,
      createdAt: now,
      updatedAt: now,
    };

    return customerRepository.createLead(newLead);
  }

  async updateLead(id: string, updates: Partial<CustomerLead>): Promise<CustomerLead> {
    const existing = await customerRepository.findLeadById(id);
    if (!existing) {
      throw AppError.notFound(`Lead with ID '${id}' not found`);
    }

    const updated = await customerRepository.updateLead(id, updates);
    if (!updated) {
      throw AppError.notFound(`Lead with ID '${id}' could not be updated`);
    }

    return updated;
  }

  async getTestDrives(): Promise<TestDriveBooking[]> {
    return customerRepository.findAllTestDrives();
  }

  async createTestDrive(data: Omit<TestDriveBooking, 'id' | 'createdAt' | 'status'>): Promise<TestDriveBooking> {
    const now = new Date().toISOString();
    const newBooking: TestDriveBooking = {
      ...data,
      id: `td-${uuidv4().slice(0, 8)}`,
      status: 'CONFIRMED',
      createdAt: now,
    };

    const saved = await customerRepository.createTestDrive(newBooking);

    // Audit log
    await activityRepository.logActivity({
      id: `act-${uuidv4().slice(0, 8)}`,
      type: 'TEST_DRIVE',
      title: 'Lịch lái thử mới',
      description: `Khách hàng ${saved.customerName} đặt lịch lái thử ${saved.carName}.`,
      user: 'Khách Hàng',
      timestamp: now,
    });

    return saved;
  }
}

export const customerService = new CustomerService();
