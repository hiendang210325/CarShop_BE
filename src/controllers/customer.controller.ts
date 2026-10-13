import { Request, Response } from 'express';
import { customerService } from '../services/customer.service';
import { sendCreated, sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getLeads = asyncHandler(async (_req: Request, res: Response) => {
  const leads = await customerService.getLeads();
  sendSuccess(res, leads, 'Customer leads fetched successfully');
});

export const getLeadById = asyncHandler(async (req: Request, res: Response) => {
  const lead = await customerService.getLeadById(req.params.id);
  sendSuccess(res, lead, 'Customer lead fetched successfully');
});

export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const lead = await customerService.createLead(req.body);
  sendCreated(res, lead, 'Customer lead created successfully');
});

export const updateLead = asyncHandler(async (req: Request, res: Response) => {
  const updated = await customerService.updateLead(req.params.id, req.body);
  sendSuccess(res, updated, 'Customer lead updated successfully');
});

export const getTestDrives = asyncHandler(async (_req: Request, res: Response) => {
  const testDrives = await customerService.getTestDrives();
  sendSuccess(res, testDrives, 'Test drive bookings fetched successfully');
});

export const createTestDrive = asyncHandler(async (req: Request, res: Response) => {
  const booking = await customerService.createTestDrive(req.body);
  sendCreated(res, booking, 'Test drive booked successfully');
});
