import { Router } from 'express';
import * as carController from '../controllers/car.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { ROLES } from '../constants';
import {
  carQuerySchema,
  createCarSchema,
  updateCarSchema,
  updateCarStatusSchema,
} from '../validations/car.validation';

const router = Router();

// Public endpoints (or authenticated)
router.get('/', validate(carQuerySchema), carController.getCars);
router.get('/:id', carController.getCarById);

// Protected endpoints (Staff & Management)
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SALES_MANAGER),
  validate(createCarSchema),
  carController.createCar
);

router.put(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SALES_MANAGER),
  validate(updateCarSchema),
  carController.updateCar
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.STAFF),
  validate(updateCarStatusSchema),
  carController.updateCarStatus
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  carController.deleteCar
);

export default router;
