import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Connect to Database with auto-retry logic for serverless cold starts (Neon.tech)
 */
export const connectDatabase = async (maxRetries = 5, delayMs = 3000): Promise<void> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$connect();
      logger.info('🐘 Successfully connected to PostgreSQL Database (Neon.tech)!');
      return;
    } catch (error) {
      if (attempt < maxRetries) {
        logger.warn(
          `⏳ [Database] Neon PostgreSQL đang khởi động từ trạng thái nghỉ (Lần thử ${attempt}/${maxRetries}). Đợi ${delayMs / 1000}s thử lại...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        logger.error('❌ Failed to connect to PostgreSQL Database after retries:', error);
        process.exit(1);
      }
    }
  }
};
