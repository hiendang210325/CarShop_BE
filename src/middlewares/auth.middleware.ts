import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { Role } from '../constants';
import { SafeUser } from '../types/auth.types';

// Extend Express Request interface to include authenticated user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Authentication required: Bearer token is missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw AppError.unauthorized('Invalid authorization header format');
    }

    const payload = verifyAccessToken(token);
    const user = await userRepository.findById(payload.userId);

    if (!user) {
      throw AppError.unauthorized('User associated with this token no longer exists');
    }

    req.user = userRepository.toSafeUser(user);
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('User not authenticated'));
    }

    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Access denied: Required role [${allowedRoles.join(', ')}], your role is [${req.user.role}]`
        )
      );
    }

    next();
  };
};
