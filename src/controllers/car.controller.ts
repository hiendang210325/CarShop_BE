import { Request, Response } from 'express';
import { carService } from '../services/car.service';
import { sendCreated, sendPaginated, sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { CarFilterParams } from '../types/car.types';

export const getCars = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as CarFilterParams;
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;

  const { items, total } = await carService.getCars(query);
  sendPaginated(res, items, total, page, pageSize, 'Cars fetched successfully');
});

export const getCarById = asyncHandler(async (req: Request, res: Response) => {
  const car = await carService.getCarById(req.params.id);
  sendSuccess(res, car, 'Car details retrieved successfully');
});

export const createCar = asyncHandler(async (req: Request, res: Response) => {
  const car = await carService.createCar(req.body, req.user);
  sendCreated(res, car, 'Car added successfully');
});

export const updateCar = asyncHandler(async (req: Request, res: Response) => {
  const updated = await carService.updateCar(req.params.id, req.body);
  sendSuccess(res, updated, 'Car updated successfully');
});

export const updateCarStatus = asyncHandler(async (req: Request, res: Response) => {
  const updated = await carService.updateCarStatus(req.params.id, req.body.status, req.user);
  sendSuccess(res, updated, 'Car status updated successfully');
});

export const deleteCar = asyncHandler(async (req: Request, res: Response) => {
  await carService.deleteCar(req.params.id);
  sendSuccess(res, null, 'Car deleted successfully');
});
