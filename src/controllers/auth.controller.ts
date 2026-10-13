import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sendCreated, sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

const COOKIE_NAME = 'refreshToken';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Helper to set HttpOnly refresh token cookie
 */
const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
};

/**
 * Helper to clear refresh token cookie on logout
 */
const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  setRefreshTokenCookie(res, result.tokens.refreshToken);
  sendSuccess(res, result, 'Đăng nhập thành công');
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  setRefreshTokenCookie(res, result.tokens.refreshToken);
  sendCreated(res, result, 'Đăng ký tài khoản thành công');
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  // Support obtaining refresh token from either HttpOnly cookie or request body
  const token = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;

  if (!token) {
    throw AppError.unauthorized('Refresh token không được tìm thấy qua Cookie hoặc Request Body');
  }

  const result = await authService.refreshAccessToken(token);

  // Set new rotated refresh token in cookie
  setRefreshTokenCookie(res, result.refreshToken);

  sendSuccess(res, result, 'Cấp lại Access Token mới thành công');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;
  await authService.logout(token);
  clearRefreshTokenCookie(res);
  sendSuccess(res, null, 'Đăng xuất thành công');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw AppError.unauthorized('Yêu cầu xác thực tài khoản');
  }
  const user = await authService.getMe(req.user.id);
  sendSuccess(res, user, 'Lấy thông tin tài khoản thành công');
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw AppError.unauthorized('Yêu cầu xác thực tài khoản');
  }
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
  clearRefreshTokenCookie(res);
  sendSuccess(res, result, 'Đổi mật khẩu thành công');
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw AppError.unauthorized('Yêu cầu xác thực tài khoản');
  }
  const updatedUser = await authService.updateProfile(req.user.id, req.body);
  sendSuccess(res, updatedUser, 'Cập nhật thông tin tài khoản thành công');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body.email);
  sendSuccess(res, result, result.message);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  const result = await authService.resetPassword(token, newPassword);
  sendSuccess(res, result, result.message);
});
