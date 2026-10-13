import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getMetrics = asyncHandler(async (_req: Request, res: Response) => {
  const metrics = await dashboardService.getMetrics();
  sendSuccess(res, metrics, 'Dashboard metrics fetched successfully');
});

export const getRecentActivities = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  const activities = await dashboardService.getRecentActivities(limit);
  sendSuccess(res, activities, 'Recent activities fetched successfully');
});
