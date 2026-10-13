import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { TokenPayload, AuthTokens } from '../types/auth.types';
import { AppError } from './AppError';

export const generateTokens = (payload: TokenPayload): AuthTokens => {
  const accessOptions: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  };
  const refreshOptions: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  };

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, accessOptions);
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, refreshOptions);

  return {
    accessToken,
    refreshToken,
    expiresIn: 3600, // standard 1 hour in seconds
  };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized('Access token has expired');
    }
    throw AppError.unauthorized('Invalid access token');
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized('Refresh token has expired, please log in again');
    }
    throw AppError.unauthorized('Invalid refresh token');
  }
};

/**
 * Generate a single-use, 15-minute Password Reset Token
 * Cryptographic trick: Secret includes the user's current password hash.
 * As soon as the password changes, this token becomes permanently invalid!
 */
export const generateResetToken = (userId: string, email: string, passwordHash: string): string => {
  return jwt.sign(
    { userId, email, purpose: 'PASSWORD_RESET' },
    env.JWT_ACCESS_SECRET + passwordHash,
    { expiresIn: '15m' }
  );
};

/**
 * Verify the Password Reset Token against the user's current password hash
 */
export const verifyResetToken = (token: string, passwordHash: string): { userId: string; email: string } => {
  try {
    return jwt.verify(
      token,
      env.JWT_ACCESS_SECRET + passwordHash
    ) as { userId: string; email: string };
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      throw AppError.badRequest('Liên kết đặt lại mật khẩu đã hết hạn (chỉ có hiệu lực trong 15 phút). Vui lòng yêu cầu lại.');
    }
    throw AppError.badRequest('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã từng được sử dụng.');
  }
};
