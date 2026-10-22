import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Họ tên tối thiểu 2 ký tự'),
    email: z.string().trim().email('Email không hợp lệ'),
    phone: z
      .string()
      .trim()
      .regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(8, 'Mật khẩu tối thiểu 8 ký tự')
      .regex(/[A-Za-z]/, 'Mật khẩu phải có chữ cái')
      .regex(/\d/, 'Mật khẩu phải có chữ số'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });
