import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { ROLES } from '../constants';

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.SALES_MANAGER));

router.get('/metrics', dashboardController.getMetrics);
router.get('/recent-activities', dashboardController.getRecentActivities);

export default router;
