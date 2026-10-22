const { z } = require('zod');
const { idParams, paginationQuery, booleanQuery } = require('../../utils/commonSchemas');

const listQuery = paginationQuery.extend({
  isActive: booleanQuery.optional(),
});

const createBody = z.object({
  name: z.string().trim().min(1, 'Tên loại sân là bắt buộc').max(50),
  description: z.string().trim().max(255).optional(),
});

const updateBody = createBody
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'Phải gửi ít nhất một trường cần cập nhật');

module.exports = { listQuery, createBody, updateBody, idParams };
