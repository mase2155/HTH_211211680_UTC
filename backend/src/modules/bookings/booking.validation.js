const { z } = require('zod');
const {
  idParams,
  paginationQuery,
  dateSchema,
  idSchema,
  phoneSchema,
} = require('../../utils/commonSchemas');
const {
  BOOKING_STATUS_VALUES,
  PAYMENT_METHOD_VALUES,
  PAYMENT_STATUS_VALUES,
} = require('../../constants/booking');

const createBody = z.object({
  fieldId: idSchema,
  timeSlotId: idSchema,
  bookingDate: dateSchema,
  customerName: z.string().trim().min(2).max(100),
  customerPhone: phoneSchema,
  note: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(PAYMENT_METHOD_VALUES),
});

const listMineQuery = paginationQuery.extend({
  status: z.enum(BOOKING_STATUS_VALUES).optional(),
});

const listAllQuery = paginationQuery.extend({
  status: z.enum(BOOKING_STATUS_VALUES).optional(),
  bookingDate: dateSchema.optional(),
  fieldId: idSchema.optional(),
});

const cancelBody = z.object({
  reason: z.string().trim().max(255).optional(),
});

const adminStatusBody = z.object({
  status: z.enum(BOOKING_STATUS_VALUES),
  cancelReason: z.string().trim().max(255).optional(),
});

const adminUpdateBody = z
  .object({
    customerName: z.string().trim().min(2).max(100).optional(),
    customerPhone: phoneSchema.optional(),
    note: z.string().trim().max(500).optional(),
    paymentStatus: z.enum(PAYMENT_STATUS_VALUES).optional(),
    status: z.enum(BOOKING_STATUS_VALUES).optional(),
    cancelReason: z.string().trim().max(255).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'Phải gửi ít nhất một trường cần cập nhật');

module.exports = {
  createBody,
  listMineQuery,
  listAllQuery,
  cancelBody,
  adminStatusBody,
  adminUpdateBody,
  idParams,
};
