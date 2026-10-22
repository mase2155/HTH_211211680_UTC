import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Họ tên tối thiểu 2 ký tự'),
  phone: z
    .string()
    .trim()
    .regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ')
    .optional()
    .or(z.literal('')),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z
      .string()
      .min(8, 'Mật khẩu mới tối thiểu 8 ký tự')
      .regex(/[A-Za-z]/, 'Mật khẩu mới phải có chữ cái')
      .regex(/\d/, 'Mật khẩu mới phải có chữ số'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });
