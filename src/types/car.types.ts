import { CAR_STATUS, FUEL_TYPE, TRANSMISSION, BODY_TYPE } from '../constants';

export type CarStatus = (typeof CAR_STATUS)[keyof typeof CAR_STATUS];
export type FuelType = (typeof FUEL_TYPE)[keyof typeof FUEL_TYPE];
export type Transmission = (typeof TRANSMISSION)[keyof typeof TRANSMISSION];
export type CarBodyType = (typeof BODY_TYPE)[keyof typeof BODY_TYPE];

export interface CarSpecs {
  engine: string;
  horsepower: number;
  torque: string;
  acceleration: string; // 0-100 km/h
  mileage: number; // km
  seatingCapacity: number;
}

export interface Car {
  id: string;
  vin: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  bodyType: CarBodyType;
  fuelType: FuelType;
  transmission: Transmission;
  price: number;
  costPrice: number;
  status: CarStatus;
  specs: CarSpecs;
  imageUrl: string;
  galleryUrls?: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CarFilterParams {
  search?: string;
  brand?: string;
  bodyType?: string;
  status?: CarStatus | 'ALL';
  minPrice?: number;
  maxPrice?: number;
  fuelType?: FuelType | 'ALL';
  sortBy?: 'price_asc' | 'price_desc' | 'year_desc' | 'newest';
  page?: number;
  pageSize?: number;
}
