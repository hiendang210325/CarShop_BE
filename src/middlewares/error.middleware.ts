import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../constants';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// Global error handler
export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message: string = 'Internal Server Error';
  let errors: unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err.name === 'SyntaxError' && 'body' in err) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Malformed JSON body in request';
  } else {
    logger.error(`[Unhandled Exception] ${req.method} ${req.originalUrl}:`, err);
    message = env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message;
  }

  const responseBody: Record<string, unknown> = {
    success: false,
    statusCode,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };

  if (env.NODE_ENV !== 'production' && !(err instanceof AppError)) {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
};
