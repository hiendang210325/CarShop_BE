import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { ROLES } from '../constants';
import {
  createOrderSchema,
  orderQuerySchema,
  updateOrderStatusSchema,
} from '../validations/order.validation';

const router = Router();

// Orders require authentication
router.use(authenticate);

router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.STAFF),
  validate(orderQuerySchema),
  orderController.getOrders
);

router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.STAFF, ROLES.CUSTOMER),
  orderController.getOrderById
);

router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.STAFF),
  validate(createOrderSchema),
  orderController.createOrder
);

router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN, ROLES.SALES_MANAGER),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

export default router;
