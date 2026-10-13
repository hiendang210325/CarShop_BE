import { prisma } from '../database/prisma';
import {
  Car,
  CarFilterParams,
  CarSpecs,
  CarStatus,
  CarBodyType,
  FuelType,
  Transmission,
} from '../types/car.types';
import { Prisma } from '@prisma/client';

export class CarRepository {
  async findAll(params: CarFilterParams): Promise<{ items: Car[]; total: number }> {
    const where: Prisma.CarWhereInput = {};

    // Filter by search (brand or model or vin)
    if (params.search) {
      where.OR = [
        { brand: { contains: params.search, mode: 'insensitive' } },
        { model: { contains: params.search, mode: 'insensitive' } },
        { vin: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    // Filter by brand
    if (params.brand && params.brand !== 'ALL') {
      where.brand = { equals: params.brand, mode: 'insensitive' };
    }

    // Filter by bodyType
    if (params.bodyType && params.bodyType !== 'ALL') {
      where.bodyType = params.bodyType as CarBodyType;
    }

    // Filter by status
    if (params.status && params.status !== 'ALL') {
      where.status = params.status as CarStatus;
    }

    // Filter by fuelType
    if (params.fuelType && params.fuelType !== 'ALL') {
      where.fuelType = params.fuelType as FuelType;
    }

    // Filter by price
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.price = {};
      if (params.minPrice !== undefined) where.price.gte = params.minPrice;
      if (params.maxPrice !== undefined) where.price.lte = params.maxPrice;
    }

    // Sorting
    let orderBy: Prisma.CarOrderByWithRelationInput = { createdAt: 'desc' };
    if (params.sortBy) {
      switch (params.sortBy) {
        case 'price_asc':
          orderBy = { price: 'asc' };
          break;
        case 'price_desc':
          orderBy = { price: 'desc' };
          break;
        case 'year_desc':
          orderBy = { year: 'desc' };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
      }
    }

    const page = params.page && params.page > 0 ? params.page : 1;
    const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 10;
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.car.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.car.count({ where }),
    ]);

    const formattedItems: Car[] = items.map((c) => ({
      ...c,
      bodyType: c.bodyType as CarBodyType,
      fuelType: c.fuelType as FuelType,
      transmission: c.transmission as Transmission,
      status: c.status as CarStatus,
      specs: c.specs as unknown as CarSpecs,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return {
      items: formattedItems,
      total,
    };
  }

  async findById(id: string): Promise<Car | null> {
    const car = await prisma.car.findUnique({ where: { id } });
    if (!car) return null;
    return {
      ...car,
      bodyType: car.bodyType as CarBodyType,
      fuelType: car.fuelType as FuelType,
      transmission: car.transmission as Transmission,
      status: car.status as CarStatus,
      specs: car.specs as unknown as CarSpecs,
      createdAt: car.createdAt.toISOString(),
      updatedAt: car.updatedAt.toISOString(),
    };
  }

  async findByVin(vin: string): Promise<Car | null> {
    const car = await prisma.car.findUnique({ where: { vin } });
    if (!car) return null;
    return {
      ...car,
      bodyType: car.bodyType as CarBodyType,
      fuelType: car.fuelType as FuelType,
      transmission: car.transmission as Transmission,
      status: car.status as CarStatus,
      specs: car.specs as unknown as CarSpecs,
      createdAt: car.createdAt.toISOString(),
      updatedAt: car.updatedAt.toISOString(),
    };
  }

  async create(carData: Car): Promise<Car> {
    const created = await prisma.car.create({
      data: {
        id: carData.id,
        vin: carData.vin,
        brand: carData.brand,
        model: carData.model,
        year: carData.year,
        color: carData.color,
        bodyType: carData.bodyType,
        fuelType: carData.fuelType,
        transmission: carData.transmission,
        price: carData.price,
        costPrice: carData.costPrice,
        status: carData.status,
        specs: carData.specs as unknown as Prisma.InputJsonValue,
        imageUrl: carData.imageUrl,
        galleryUrls: carData.galleryUrls || [],
        description: carData.description,
      },
    });

    return {
      ...created,
      bodyType: created.bodyType as CarBodyType,
      fuelType: created.fuelType as FuelType,
      transmission: created.transmission as Transmission,
      status: created.status as CarStatus,
      specs: created.specs as unknown as CarSpecs,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  async update(id: string, updates: Partial<Car>): Promise<Car | null> {
    const data: Prisma.CarUpdateInput = {};
    if (updates.brand !== undefined) data.brand = updates.brand;
    if (updates.model !== undefined) data.model = updates.model;
    if (updates.year !== undefined) data.year = updates.year;
    if (updates.color !== undefined) data.color = updates.color;
    if (updates.bodyType !== undefined) data.bodyType = updates.bodyType;
    if (updates.fuelType !== undefined) data.fuelType = updates.fuelType;
    if (updates.transmission !== undefined) data.transmission = updates.transmission;
    if (updates.price !== undefined) data.price = updates.price;
    if (updates.costPrice !== undefined) data.costPrice = updates.costPrice;
    if (updates.status !== undefined) data.status = updates.status;
    if (updates.specs !== undefined) data.specs = updates.specs as unknown as Prisma.InputJsonValue;
    if (updates.imageUrl !== undefined) data.imageUrl = updates.imageUrl;
    if (updates.galleryUrls !== undefined) data.galleryUrls = updates.galleryUrls;
    if (updates.description !== undefined) data.description = updates.description;

    const updated = await prisma.car.update({
      where: { id },
      data,
    });

    return {
      ...updated,
      bodyType: updated.bodyType as CarBodyType,
      fuelType: updated.fuelType as FuelType,
      transmission: updated.transmission as Transmission,
      status: updated.status as CarStatus,
      specs: updated.specs as unknown as CarSpecs,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.car.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async count(): Promise<number> {
    return prisma.car.count();
  }
}

export const carRepository = new CarRepository();
