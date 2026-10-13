import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { ROLES } from '../constants';

const router = Router();

// All user management routes require ADMIN privileges
router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id/status', userController.updateUserStatus);
router.patch('/:id/role', userController.updateUserRole);
router.delete('/:id', userController.deleteUser);

export default router;
