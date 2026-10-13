import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { connectDatabase } from './database/prisma';

const startServer = async () => {
  // Test connection to PostgreSQL Database
  await connectDatabase();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info('===================================================');
    logger.info(`🚀 CarShop Enterprise API Server is running!`);
    logger.info(`📡 Port:        http://localhost:${env.PORT}`);
    logger.info(`🩺 Health:      http://localhost:${env.PORT}/api/v1/health`);
    logger.info(`🚗 Cars API:    http://localhost:${env.PORT}/api/v1/cars`);
    logger.info(`🔒 Environment: ${env.NODE_ENV}`);
    logger.info('===================================================');
  });

  // Graceful Shutdown Handler
  const gracefulShutdown = (signal: string) => {
    logger.warn(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed. Exiting process.');
      process.exit(0);
    });

    // Force close if graceful shutdown takes too long (10 seconds timeout)
    setTimeout(() => {
      logger.error('Force shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Rejection at Promise:', reason);
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception thrown:', error);
    process.exit(1);
  });
};

startServer();
