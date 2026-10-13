import { Response } from 'express';
import { HTTP_STATUS } from '../constants';
import { ApiResponse, PaginatedResponse } from '../types/common';

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  data: T,
  message?: string
): Response => {
  const responsePayload: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    data,
    message,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(responsePayload);
};

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Operation successful'
): Response => {
  return sendResponse(res, HTTP_STATUS.OK, data, message);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): Response => {
  return sendResponse(res, HTTP_STATUS.CREATED, data, message);
};

export const sendPaginated = <T>(
  res: Response,
  items: T[],
  total: number,
  page: number,
  pageSize: number,
  message: string = 'Data retrieved successfully'
): Response => {
  const totalPages = Math.ceil(total / (pageSize || 10)) || 1;
  const paginatedData: PaginatedResponse<T> = {
    items,
    total,
    page: Number(page),
    pageSize: Number(pageSize),
    totalPages,
  };

  return sendSuccess(res, paginatedData, message);
};
