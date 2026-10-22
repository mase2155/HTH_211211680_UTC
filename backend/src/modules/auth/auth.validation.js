const { z } = require('zod');
const { emailSchema, phoneSchema } = require('../../utils/commonSchemas');

const registerBody = z.object({
  fullName: z.string().trim().min(2, 'Họ tên tối thiểu 2 ký tự').max(100),
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .max(72, 'Mật khẩu tối đa 72 ký tự')
    .regex(/[A-Za-z]/, 'Mật khẩu phải có ít nhất một chữ cái')
    .regex(/\d/, 'Mật khẩu phải có ít nhất một chữ số'),
  phone: phoneSchema.optional(),
});

const loginBody = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

module.exports = { registerBody, loginBody };
