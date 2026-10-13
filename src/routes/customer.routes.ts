import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { ROLES } from '../constants';
import {
  createLeadSchema,
  updateLeadSchema,
  createTestDriveSchema,
} from '../validations/customer.validation';

const router = Router();

// Leads (Internal Management)
router.get(
  '/leads',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.STAFF),
  customerController.getLeads
);

router.post(
  '/leads',
  validate(createLeadSchema),
  customerController.createLead
);

router.get(
  '/leads/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.STAFF),
  customerController.getLeadById
);

router.patch(
  '/leads/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.STAFF),
  validate(updateLeadSchema),
  customerController.updateLead
);

// Test Drive Booking (Public & Internal)
router.get(
  '/test-drives',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.STAFF),
  customerController.getTestDrives
);

router.post(
  '/test-drives',
  validate(createTestDriveSchema),
  customerController.createTestDrive
);

export default router;
