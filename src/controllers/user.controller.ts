import { Request, Response } from 'express';
import { userRepository } from '../repositories/user.repository';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { Role, ROLES } from '../constants';

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { search, role, isActive } = req.query;

  const users = await userRepository.findAll({
    search: search ? String(search) : undefined,
    role: role ? String(role) : undefined,
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
  });

  sendSuccess(res, users, 'Lấy danh sách người dùng thành công');
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userRepository.findById(id);

  if (!user) {
    throw AppError.notFound('Không tìm thấy người dùng');
  }

  sendSuccess(res, userRepository.toSafeUser(user), 'Lấy thông tin người dùng thành công');
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    throw AppError.badRequest('Trường isActive phải là boolean (true/false)');
  }

  const updated = await userRepository.update(id, { isActive });
  if (!updated) {
    throw AppError.notFound('Không tìm thấy người dùng');
  }

  sendSuccess(
    res,
    userRepository.toSafeUser(updated),
    isActive ? 'Đã kích hoạt tài khoản' : 'Đã khóa tài khoản'
  );
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = [ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.STAFF, ROLES.CUSTOMER];
  if (!validRoles.includes(role)) {
    throw AppError.badRequest(`Role không hợp lệ. Các role hợp lệ: ${validRoles.join(', ')}`);
  }

  const updated = await userRepository.update(id, { role: role as Role });
  if (!updated) {
    throw AppError.notFound('Không tìm thấy người dùng');
  }

  sendSuccess(res, userRepository.toSafeUser(updated), `Đã cập nhật quyền thành công sang ${role}`);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (req.user && req.user.id === id) {
    throw AppError.badRequest('Bạn không thể tự xóa tài khoản của chính mình');
  }

  const success = await userRepository.delete(id);
  if (!success) {
    throw AppError.notFound('Không tìm thấy người dùng');
  }

  sendSuccess(res, null, 'Đã xóa người dùng thành công');
});
