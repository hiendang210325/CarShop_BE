import { HTTP_STATUS } from '../constants';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: Record<string, string[]> | Array<{ field: string; message: string }>;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errors?: Record<string, string[]> | Array<{ field: string; message: string }>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: Record<string, string[]> | Array<{ field: string; message: string }>) {
    return new AppError(message, HTTP_STATUS.BAD_REQUEST, errors);
  }

  static unauthorized(message: string = 'Unauthorized: Access token is missing or invalid') {
    return new AppError(message, HTTP_STATUS.UNAUTHORIZED);
  }

  static forbidden(message: string = 'Forbidden: You do not have permission to perform this action') {
    return new AppError(message, HTTP_STATUS.FORBIDDEN);
  }

  static notFound(message: string = 'Resource not found') {
    return new AppError(message, HTTP_STATUS.NOT_FOUND);
  }

  static conflict(message: string) {
    return new AppError(message, HTTP_STATUS.CONFLICT);
  }

  static unprocessableEntity(message: string, errors?: Record<string, string[]> | Array<{ field: string; message: string }>) {
    return new AppError(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, errors);
  }
}
