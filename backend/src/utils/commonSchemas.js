const { z } = require('zod');
const { isValidDate } = require('./datetime');

const idSchema = z.coerce.number().int().positive();

const idParams = z.object({ id: idSchema });

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có dạng YYYY-MM-DD')
  .refine(isValidDate, 'Ngày không hợp lệ');

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Giờ phải có dạng HH:mm');

const emailSchema = z.string().trim().toLowerCase().email('Email không hợp lệ').max(150);

const phoneSchema = z
  .string()
  .trim()
  .regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ');

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Query kiểu boolean: ?isActive=true|false
const booleanQuery = z.enum(['true', 'false']).transform((value) => value === 'true');

module.exports = {
  idSchema,
  idParams,
  dateSchema,
  timeSchema,
  emailSchema,
  phoneSchema,
  paginationQuery,
  booleanQuery,
};
