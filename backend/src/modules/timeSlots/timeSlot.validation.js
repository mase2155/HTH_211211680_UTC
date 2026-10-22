const { z } = require('zod');
const { idParams, paginationQuery, booleanQuery, timeSchema, idSchema } = require('../../utils/commonSchemas');

const slotRangeBody = z
  .object({
    fieldTypeId: idSchema,
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'Giờ kết thúc phải sau giờ bắt đầu',
    path: ['endTime'],
  });

const createBody = slotRangeBody;

const updateBody = z
  .object({
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'Phải gửi ít nhất một trường cần cập nhật')
  .refine((data) => !data.startTime || !data.endTime || data.endTime > data.startTime, {
    message: 'Giờ kết thúc phải sau giờ bắt đầu',
    path: ['endTime'],
  });

const listQuery = paginationQuery.extend({
  fieldTypeId: idSchema.optional(),
  isActive: booleanQuery.optional(),
});

module.exports = { listQuery, createBody, updateBody, idParams };
