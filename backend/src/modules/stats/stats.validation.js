const { z } = require('zod');
const { dateSchema } = require('../../utils/commonSchemas');

const revenueQuery = z.object({
  groupBy: z.enum(['day', 'month']).default('day'),
  fromDate: dateSchema.optional(),
  toDate: dateSchema.optional(),
});

module.exports = { revenueQuery };
