const { z } = require('zod');
const { idParams, idSchema } = require('../../utils/commonSchemas');
const { DAY_TYPE_VALUES } = require('../../constants/booking');

const priceItem = z.object({
  timeSlotId: idSchema,
  dayType: z.enum(DAY_TYPE_VALUES),
  amount: z.coerce.number().int().min(0),
});

const replaceBody = z.object({
  items: z.array(priceItem).min(1, 'Danh sách giá không được rỗng'),
});

module.exports = { replaceBody, idParams };
