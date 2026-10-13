import { z } from 'zod';
import { CAR_STATUS, FUEL_TYPE, TRANSMISSION, BODY_TYPE } from '../constants';

const carSpecsSchema = z.object({
  engine: z.string().min(1, 'Engine specification is required'),
  horsepower: z.number().positive('Horsepower must be a positive number'),
  torque: z.string().min(1, 'Torque is required'),
  acceleration: z.string().min(1, 'Acceleration is required'),
  mileage: z.number().nonnegative('Mileage must be non-negative'),
  seatingCapacity: z.number().int().min(1, 'Seating capacity must be at least 1'),
});

export const createCarSchema = z.object({
  body: z.object({
    vin: z.string().min(5, 'VIN must be at least 5 characters'),
    brand: z.string().min(1, 'Brand is required'),
    model: z.string().min(1, 'Model is required'),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 2),
    color: z.string().min(1, 'Color is required'),
    bodyType: z.enum([
      BODY_TYPE.SEDAN,
      BODY_TYPE.SUV,
      BODY_TYPE.COUPE,
      BODY_TYPE.HATCHBACK,
      BODY_TYPE.CROSSOVER,
      BODY_TYPE.PICKUP,
    ]),
    fuelType: z.enum([
      FUEL_TYPE.PETROL,
      FUEL_TYPE.DIESEL,
      FUEL_TYPE.ELECTRIC,
      FUEL_TYPE.HYBRID,
    ]),
    transmission: z.enum([TRANSMISSION.AUTOMATIC, TRANSMISSION.MANUAL]),
    price: z.number().positive('Price must be greater than 0'),
    costPrice: z.number().positive('Cost price must be greater than 0'),
    status: z.enum([
      CAR_STATUS.AVAILABLE,
      CAR_STATUS.RESERVED,
      CAR_STATUS.SOLD,
      CAR_STATUS.MAINTENANCE,
    ]).default(CAR_STATUS.AVAILABLE),
    specs: carSpecsSchema,
    imageUrl: z.string().url('A valid image URL is required'),
    galleryUrls: z.array(z.string().url()).optional(),
    description: z.string().min(10, 'Description must be at least 10 characters'),
  }),
});

export const updateCarSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Car ID is required'),
  }),
  body: createCarSchema.shape.body.partial(),
});

export const updateCarStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Car ID is required'),
  }),
  body: z.object({
    status: z.enum([
      CAR_STATUS.AVAILABLE,
      CAR_STATUS.RESERVED,
      CAR_STATUS.SOLD,
      CAR_STATUS.MAINTENANCE,
    ]),
  }),
});

export const carQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    brand: z.string().optional(),
    bodyType: z.string().optional(),
    status: z.string().optional(),
    fuelType: z.string().optional(),
    minPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    maxPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    sortBy: z.enum(['price_asc', 'price_desc', 'year_desc', 'newest']).optional(),
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    pageSize: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
});
