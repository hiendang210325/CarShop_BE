import fs from 'fs';
import path from 'path';
import { User } from '../types/auth.types';
import { Car } from '../types/car.types';
import { Order } from '../types/order.types';
import { CustomerLead, TestDriveBooking } from '../types/customer.types';
import { RecentActivity } from '../types/dashboard.types';
import {
  SEED_USERS,
  SEED_CARS,
  SEED_LEADS,
  SEED_ORDERS,
  SEED_TEST_DRIVES,
  SEED_ACTIVITIES,
} from './initialData';
import { logger } from '../utils/logger';

export interface DatabaseSchema {
  users: User[];
  cars: Car[];
  orders: Order[];
  leads: CustomerLead[];
  testDrives: TestDriveBooking[];
  activities: RecentActivity[];
}

class DatabaseStore {
  private dbPath: string;
  private data: DatabaseSchema;

  constructor() {
    this.dbPath = path.resolve(process.cwd(), 'data', 'database.json');
    this.data = this.initializeDatabase();
  }

  private initializeDatabase(): DatabaseSchema {
    try {
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(this.dbPath)) {
        const fileContent = fs.readFileSync(this.dbPath, 'utf-8');
        const parsed = JSON.parse(fileContent);
        logger.info('Database loaded from disk: ' + this.dbPath);
        return {
          users: parsed.users || SEED_USERS,
          cars: parsed.cars || SEED_CARS,
          orders: parsed.orders || SEED_ORDERS,
          leads: parsed.leads || SEED_LEADS,
          testDrives: parsed.testDrives || SEED_TEST_DRIVES,
          activities: parsed.activities || SEED_ACTIVITIES,
        };
      }
    } catch (error) {
      logger.warn('Failed to load database from disk, using default seed data', error);
    }

    // Default Seed Data
    const defaultData: DatabaseSchema = {
      users: [...SEED_USERS],
      cars: [...SEED_CARS],
      orders: [...SEED_ORDERS],
      leads: [...SEED_LEADS],
      testDrives: [...SEED_TEST_DRIVES],
      activities: [...SEED_ACTIVITIES],
    };

    this.persist(defaultData);
    return defaultData;
  }

  private persist(dataToSave?: DatabaseSchema): void {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      logger.error('Failed to persist database to file:', error);
    }
  }

  public get users(): User[] {
    return this.data.users;
  }

  public get cars(): Car[] {
    return this.data.cars;
  }

  public get orders(): Order[] {
    return this.data.orders;
  }

  public get leads(): CustomerLead[] {
    return this.data.leads;
  }

  public get testDrives(): TestDriveBooking[] {
    return this.data.testDrives;
  }

  public get activities(): RecentActivity[] {
    return this.data.activities;
  }

  public save(): void {
    this.persist();
  }

  public reset(): void {
    this.data = {
      users: [...SEED_USERS],
      cars: [...SEED_CARS],
      orders: [...SEED_ORDERS],
      leads: [...SEED_LEADS],
      testDrives: [...SEED_TEST_DRIVES],
      activities: [...SEED_ACTIVITIES],
    };
    this.persist();
    logger.info('Database has been reset to seed values');
  }
}

export const dbStore = new DatabaseStore();
