import { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import { sendCreated, sendPaginated, sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10;
  const search = req.query.search as string | undefined;
  const status = req.query.status as string | undefined;

  const { items, total } = await orderService.getOrders({
    page,
    pageSize,
    search,
    status,
  });

  sendPaginated(res, items, total, page, pageSize, 'Orders fetched successfully');
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.params.id);
  sendSuccess(res, order, 'Order fetched successfully');
});

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(req.body, req.user);
  sendCreated(res, order, 'Order created successfully');
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const updated = await orderService.updateOrderStatus(req.params.id, req.body.status, req.user);
  sendSuccess(res, updated, 'Order status updated successfully');
});
