const { z } = require('zod');
const { idParams, paginationQuery } = require('../../utils/commonSchemas');
const { NEWS_POST_STATUS_VALUES } = require('../../constants/content');

const listQuery = paginationQuery.extend({
  status: z.enum(NEWS_POST_STATUS_VALUES).optional(),
});

const createBody = z.object({
  title: z.string().trim().min(1).max(300),
  excerpt: z.string().trim().max(1000).optional(),
  imageUrl: z.string().trim().max(500).optional().nullable(),
  status: z.enum(NEWS_POST_STATUS_VALUES).default('Draft'),
});

const updateBody = createBody
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'Phải gửi ít nhất một trường cần cập nhật');

module.exports = { listQuery, createBody, updateBody, idParams };
