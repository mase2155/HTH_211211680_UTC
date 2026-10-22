const { z } = require('zod');
const {
  idParams,
  paginationQuery,
  dateSchema,
  idSchema,
} = require('../../utils/commonSchemas');
const { FIELD_STATUS_VALUES } = require('../../constants/field');

const listQuery = paginationQuery.extend({
  keyword: z.string().trim().max(100).optional(),
  fieldTypeId: idSchema.optional(),
  bookingDate: dateSchema.optional(),
  timeSlotId: idSchema.optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  status: z.enum(FIELD_STATUS_VALUES).optional(),
});

const createBody = z.object({
  fieldTypeId: idSchema,
  name: z.string().trim().min(1).max(150),
  address: z.string().trim().min(1).max(255),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(FIELD_STATUS_VALUES).default('Active'),
});

const updateBody = createBody
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'Phải gửi ít nhất một trường cần cập nhật');

module.exports = { listQuery, createBody, updateBody, idParams };
