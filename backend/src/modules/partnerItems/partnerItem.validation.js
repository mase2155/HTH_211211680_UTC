const { z } = require('zod');
const { idParams, paginationQuery } = require('../../utils/commonSchemas');

const listQuery = paginationQuery.extend({
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});

const createBody = z.object({
  title: z.string().trim().min(1).max(300),
  imageUrl: z.string().trim().max(500).optional().nullable(),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

const updateBody = createBody
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'Phải gửi ít nhất một trường cần cập nhật');

module.exports = { listQuery, createBody, updateBody, idParams };
