const { z } = require('zod');
const { idParams, paginationQuery, booleanQuery, phoneSchema } = require('../../utils/commonSchemas');
const { ROLE_VALUES } = require('../../constants/roles');

const updateProfileBody = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: phoneSchema.optional().nullable(),
});

const changePasswordBody = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z
    .string()
    .min(8, 'Mật khẩu mới tối thiểu 8 ký tự')
    .max(72)
    .regex(/[A-Za-z]/, 'Mật khẩu mới phải có ít nhất một chữ cái')
    .regex(/\d/, 'Mật khẩu mới phải có ít nhất một chữ số'),
});

const listUsersQuery = paginationQuery.extend({
  keyword: z.string().trim().max(100).optional(),
  role: z.enum(ROLE_VALUES).optional(),
  isActive: booleanQuery.optional(),
});

const adminUpdateBody = z
  .object({
    fullName: z.string().trim().min(2).max(100).optional(),
    phone: phoneSchema.optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'Phải gửi ít nhất một trường cần cập nhật');

module.exports = { updateProfileBody, changePasswordBody, listUsersQuery, adminUpdateBody, idParams };
