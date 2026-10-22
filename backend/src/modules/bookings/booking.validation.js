const { z } = require('zod');
const {
  idParams,
  paginationQuery,
  dateSchema,
  idSchema,
  phoneSchema,
} = require('../../utils/commonSchemas');
const { BOOKING_STATUS_VALUES, PAYMENT_METHOD_VALUES } = require('../../constants/booking');

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

module.exports = { createBody, listMineQuery, listAllQuery, cancelBody, adminStatusBody, idParams };
