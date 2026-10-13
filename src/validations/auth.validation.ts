import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email không được để trống' })
      .trim()
      .toLowerCase()
      .email('Email không đúng định dạng'),
    password: z
      .string({ required_error: 'Mật khẩu không được để trống' })
      .min(1, 'Mật khẩu không được để trống'),
    rememberMe: z.boolean().optional(),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email không được để trống' })
      .trim()
      .toLowerCase()
      .email('Email không đúng định dạng'),
    password: z
      .string({ required_error: 'Mật khẩu không được để trống' })
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số'
      ),
    fullName: z
      .string({ required_error: 'Họ và tên không được để trống' })
      .trim()
      .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
      .max(100, 'Họ và tên không quá 100 ký tự'),
    phone: z
      .string()
      .trim()
      .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ tại Việt Nam')
      .optional()
      .or(z.literal('')),
    department: z.string().trim().optional(),
  }),
});

export const refreshTokenSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Vui lòng cung cấp mật khẩu hiện tại'),
    newPassword: z
      .string()
      .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số'
      ),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, 'Họ và tên phải có ít nhất 2 ký tự').optional(),
    phone: z
      .string()
      .trim()
      .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ tại Việt Nam')
      .optional()
      .or(z.literal('')),
    avatarUrl: z.string().url('Đường dẫn hình ảnh đại diện không hợp lệ').optional(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email không được để trống' })
      .trim()
      .toLowerCase()
      .email('Email không đúng định dạng'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z
      .string({ required_error: 'Token không được để trống' })
      .min(1, 'Token không được để trống'),
    newPassword: z
      .string({ required_error: 'Mật khẩu mới không được để trống' })
      .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số'
      ),
  }),
});
