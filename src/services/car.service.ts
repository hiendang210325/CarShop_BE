import { v4 as uuidv4 } from 'uuid';
import { carRepository } from '../repositories/car.repository';
import { activityRepository } from '../repositories/activity.repository';
import { Car, CarFilterParams, CarStatus } from '../types/car.types';
import { SafeUser } from '../types/auth.types';
import { AppError } from '../utils/AppError';

export class CarService {
  async getCars(params: CarFilterParams) {
    return carRepository.findAll(params);
  }

  async getCarById(id: string): Promise<Car> {
    const car = await carRepository.findById(id);
    if (!car) {
      throw AppError.notFound(`Car with ID '${id}' not found`);
    }
    return car;
  }

  async createCar(carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>, user?: SafeUser): Promise<Car> {
    // Check VIN uniqueness
    const existingVin = await carRepository.findByVin(carData.vin);
    if (existingVin) {
      throw AppError.conflict(`A car with VIN '${carData.vin}' already exists`);
    }

    const now = new Date().toISOString();
    const newCar: Car = {
      ...carData,
      id: `car-${uuidv4().slice(0, 8)}`,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await carRepository.create(newCar);

    // Audit log
    await activityRepository.logActivity({
      id: `act-${uuidv4().slice(0, 8)}`,
      type: 'CAR_ADDED',
      title: 'Nhập kho xe mới',
      description: `Đã thêm xe ${saved.brand} ${saved.model} (${saved.year}) vào kho xe.`,
      user: user?.fullName || 'Hệ Thống',
      timestamp: now,
    });

    return saved;
  }

  async updateCar(id: string, updates: Partial<Car>): Promise<Car> {
    const existing = await carRepository.findById(id);
    if (!existing) {
      throw AppError.notFound(`Car with ID '${id}' not found`);
    }

    if (updates.vin && updates.vin !== existing.vin) {
      const vinCheck = await carRepository.findByVin(updates.vin);
      if (vinCheck) {
        throw AppError.conflict(`A car with VIN '${updates.vin}' already exists`);
      }
    }

    const updated = await carRepository.update(id, updates);
    if (!updated) {
      throw AppError.notFound(`Car with ID '${id}' could not be updated`);
    }

    return updated;
  }

  async updateCarStatus(id: string, status: CarStatus, user?: SafeUser): Promise<Car> {
    const car = await carRepository.findById(id);
    if (!car) {
      throw AppError.notFound(`Car with ID '${id}' not found`);
    }

    const updated = await carRepository.update(id, { status });
    if (!updated) {
      throw AppError.notFound(`Car with ID '${id}' could not be updated`);
    }

    // Audit log
    await activityRepository.logActivity({
      id: `act-${uuidv4().slice(0, 8)}`,
      type: 'STATUS_CHANGED',
      title: 'Cập nhật trạng thái xe',
      description: `Xe ${car.brand} ${car.model} chuyển trạng thái thành '${status}'.`,
      user: user?.fullName || 'Hệ Thống',
      timestamp: new Date().toISOString(),
    });

    return updated;
  }

  async deleteCar(id: string): Promise<void> {
    const car = await carRepository.findById(id);
    if (!car) {
      throw AppError.notFound(`Car with ID '${id}' not found`);
    }

    await carRepository.delete(id);
  }
}

export const carService = new CarService();
