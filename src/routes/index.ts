import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import carRoutes from './car.routes';
import orderRoutes from './order.routes';
import customerRoutes from './customer.routes';
import dashboardRoutes from './dashboard.routes';
import healthRoutes from './health.routes';

const apiRouter = Router();

apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/cars', carRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/customers', customerRoutes);
apiRouter.use('/dashboard', dashboardRoutes);

export default apiRouter;
