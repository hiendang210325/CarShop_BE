import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { userRepository } from '../repositories/user.repository';
import { tokenRepository } from '../repositories/token.repository';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { AuthResponse, AuthTokens, SafeUser, User } from '../types/auth.types';
import { Role, ROLES } from '../constants';
import { logger } from '../utils/logger';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export class AuthService {
  /**
   * Helper to calculate expiration date for refresh tokens (7 days)
   */
  private getRefreshTokenExpiry(): Date {
    return new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  }

  /**
   * 1. User Login with Email & Password
   */
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const email = credentials.email.trim().toLowerCase();
    const user = await userRepository.findByEmail(email);

    if (!user || !user.password) {
      logger.warn(`⚠️ [AUTH] Đăng nhập thất bại: Email không tồn tại -> ${email}`);
      throw AppError.unauthorized('Email hoặc mật khẩu không chính xác');
    }

    if (user.isActive === false) {
      logger.warn(`🚫 [AUTH] Tài khoản bị khóa đang cố đăng nhập -> ${email}`);
      throw AppError.forbidden('Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.');
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      logger.warn(`⚠️ [AUTH] Đăng nhập thất bại: Sai mật khẩu -> ${email}`);
      throw AppError.unauthorized('Email hoặc mật khẩu không chính xác');
    }

    const safeUser = userRepository.toSafeUser(user);
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Save refresh token to database
    await tokenRepository.saveRefreshToken(
      user.id,
      tokens.refreshToken,
      this.getRefreshTokenExpiry()
    );

    logger.info(`✅ [AUTH] Người dùng đăng nhập thành công: ${user.email} (Role: ${user.role})`);
    return { user: safeUser, tokens };
  }

  /**
   * 2. User Registration (Public self-registration strictly enforces CUSTOMER role)
   */
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    role?: Role;
    phone?: string;
    department?: string;
  }): Promise<AuthResponse> {
    const email = data.email.trim().toLowerCase();
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      logger.warn(`⚠️ [AUTH] Đăng ký thất bại: Trùng email -> ${email}`);
      throw AppError.conflict('Địa chỉ email này đã được sử dụng');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    // Business standard: Public registration strictly creates CUSTOMER role to prevent privilege escalation attacks
    const assignedRole: Role = ROLES.CUSTOMER;

    const newUser: User = {
      id: `user-${uuidv4().slice(0, 8)}`,
      email,
      password: hashedPassword,
      fullName: data.fullName.trim(),
      role: assignedRole,
      phone: data.phone?.trim() || undefined,
      department: data.department?.trim() || 'Khách hàng',
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    await userRepository.create(newUser);
    const safeUser = userRepository.toSafeUser(newUser);

    const tokens = generateTokens({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // Save refresh token to database
    await tokenRepository.saveRefreshToken(
      newUser.id,
      tokens.refreshToken,
      this.getRefreshTokenExpiry()
    );

    logger.info(`🎉 [AUTH] Người dùng mới đăng ký thành công: ${newUser.email} (ID: ${newUser.id})`);
    return { user: safeUser, tokens };
  }

  /**
   * 3. Refresh Access Token with Token Rotation (RTR)
   */
  async refreshAccessToken(refreshTokenString: string): Promise<AuthTokens & { user: SafeUser }> {
    if (!refreshTokenString) {
      throw AppError.unauthorized('Refresh token không được để trống');
    }

    // Verify JWT cryptographic signature & expiration
    const payload = verifyRefreshToken(refreshTokenString);

    // Check token state in database
    const dbToken = await tokenRepository.findByToken(refreshTokenString);

    // Refresh Token Reuse Detection
    if (!dbToken || dbToken.revoked) {
      if (dbToken && dbToken.revoked) {
        // Potential token theft: Revoke all tokens for this user immediately!
        logger.error(`🚨 [SECURITY ALERT] Phát hiện tái sử dụng Refresh Token đã bị thu hồi của userId: ${payload.userId}! Đã thu hồi toàn bộ phiên đăng nhập.`);
        await tokenRepository.revokeAllForUser(payload.userId);
      }
      throw AppError.unauthorized('Phiên đăng nhập không hợp lệ hoặc đã bị thu hồi. Vui lòng đăng nhập lại.');
    }

    if (dbToken.expiresAt < new Date()) {
      throw AppError.unauthorized('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }

    const user = await userRepository.findById(payload.userId);
    if (!user || user.isActive === false) {
      throw AppError.unauthorized('Tài khoản không tồn tại hoặc đã bị khóa');
    }

    // Revoke old refresh token (Token Rotation)
    await tokenRepository.revokeToken(refreshTokenString);

    // Issue brand new token pair
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Save new refresh token in DB
    await tokenRepository.saveRefreshToken(
      user.id,
      tokens.refreshToken,
      this.getRefreshTokenExpiry()
    );

    return {
      ...tokens,
      user: userRepository.toSafeUser(user),
    };
  }

  /**
   * 4. Logout (Revoke refresh token)
   */
  async logout(refreshTokenString?: string): Promise<void> {
    if (refreshTokenString) {
      await tokenRepository.revokeToken(refreshTokenString);
      logger.info(`🚪 [AUTH] Refresh token đã được thu hồi khi đăng xuất.`);
    }
  }

  /**
   * 5. Get current authenticated user profile
   */
  async getMe(userId: string): Promise<SafeUser> {
    const user = await userRepository.findById(userId);
    if (!user || user.isActive === false) {
      throw AppError.notFound('Hồ sơ người dùng không tồn tại hoặc đã bị khóa');
    }
    return userRepository.toSafeUser(user);
  }

  /**
   * 6. Change Password (Authenticated user)
   */
  async changePassword(
    userId: string,
    currentPass: string,
    newPass: string
  ): Promise<{ message: string }> {
    const user = await userRepository.findById(userId);
    if (!user || !user.password) {
      throw AppError.notFound('Người dùng không tồn tại');
    }

    const isMatch = await bcrypt.compare(currentPass, user.password);
    if (!isMatch) {
      logger.warn(`⚠️ [AUTH] Đổi mật khẩu thất bại: Mật khẩu hiện tại không đúng (userId: ${userId})`);
      throw AppError.badRequest('Mật khẩu hiện tại không chính xác');
    }

    if (currentPass === newPass) {
      throw AppError.badRequest('Mật khẩu mới không được trùng với mật khẩu cũ');
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await userRepository.update(userId, { password: hashedPassword });

    // Revoke all existing sessions for security
    await tokenRepository.revokeAllForUser(userId);
    logger.info(`🔑 [AUTH] Người dùng ${userId} đã đổi mật khẩu thành công. Đã thu hồi toàn bộ token cũ.`);

    return { message: 'Đổi mật khẩu thành công. Các phiên đăng nhập khác đã được đăng xuất an toàn.' };
  }

  /**
   * 7. Update User Profile
   */
  async updateProfile(
    userId: string,
    updates: { fullName?: string; phone?: string; avatarUrl?: string }
  ): Promise<SafeUser> {
    const updated = await userRepository.update(userId, updates);
    if (!updated) {
      throw AppError.notFound('Không tìm thấy người dùng');
    }
    return userRepository.toSafeUser(updated);
  }

  /**
   * 8. Forgot Password (Request Password Reset Link)
   */
  async forgotPassword(emailRaw: string): Promise<{ message: string; resetToken?: string }> {
    const email = emailRaw.trim().toLowerCase();
    const user = await userRepository.findByEmail(email);

    // Business standard: Chống User Enumeration (Dù có hay không có user vẫn trả về cùng 1 message)
    const genericMessage = 'Nếu email của bạn tồn tại trong hệ thống, liên kết đặt lại mật khẩu đã được gửi.';

    if (!user || user.isActive === false) {
      logger.warn(`⚠️ [AUTH] Quên mật khẩu: Email không tồn tại hoặc bị khóa -> ${email}`);
      return { message: genericMessage };
    }

    // 1. Tạo raw token ngẫu nhiên bảo mật 32 bytes (64 hex characters)
    const rawResetToken = crypto.randomBytes(32).toString('hex');

    // 2. Hash token với SHA-256 trước khi lưu vào Database (Chống rò rỉ token khi database bị dump)
    const hashedToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');

    // 3. Thời gian hết hạn là 15 phút
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // 4. Lưu hashed token vào Database
    await userRepository.update(user.id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expiresAt,
    });

    // 5. Log đường link ra terminal để DEV/Tester dễ dàng copy test
    const resetUrl = `http://localhost:5173/reset-password?token=${rawResetToken}`;
    logger.info(`=======================================================`);
    logger.info(`📧 [RESET PASSWORD SIMULATION] Gửi link tới: ${user.email}`);
    logger.info(`🔗 Token test: ${rawResetToken}`);
    logger.info(`🌐 Reset URL:  ${resetUrl}`);
    logger.info(`⏳ Hết hạn trong 15 phút.`);
    logger.info(`=======================================================`);

    return {
      message: genericMessage,
      // Trả kèm resetToken trong development để tiện test trực tiếp trên Postman
      ...(process.env.NODE_ENV !== 'production' ? { resetToken: rawResetToken } : {}),
    };
  }

  /**
   * 9. Reset Password with Token
   */
  async resetPassword(rawToken: string, newPassword: string): Promise<{ message: string }> {
    // 1. Hash rawToken được gửi lên để so sánh với database
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // 2. Tìm user có hashed token tương ứng
    const user = await userRepository.findByResetToken(hashedToken);

    if (!user || !user.resetPasswordExpires) {
      throw AppError.badRequest('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng');
    }

    // 3. Kiểm tra xem token có bị hết hạn (quá 15 phút) không
    if (new Date(user.resetPasswordExpires) < new Date()) {
      // Xóa token đã hết hạn
      await userRepository.update(user.id, {
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      });
      throw AppError.badRequest('Liên kết đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại.');
    }

    // 4. Băm mật khẩu mới (bcrypt)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 5. Cập nhật mật khẩu mới & Xóa token reset (Single-Use)
    await userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });

    // 6. Thu hồi toàn bộ Refresh Tokens cũ để đá các phiên đăng nhập khác ra ngoài
    await tokenRepository.revokeAllForUser(user.id);

    logger.info(`🎉 [AUTH] Đặt lại mật khẩu thành công cho email: ${user.email}. Đã thu hồi toàn bộ phiên cũ.`);

    return {
      message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.',
    };
  }
}

export const authService = new AuthService();
