import { z } from 'zod';

export const createBookingSchema = z.object({
  fieldId: z.coerce.number().int().positive('Vui lòng chọn sân'),
  timeSlotId: z.coerce.number().int().positive('Vui lòng chọn khung giờ'),
  bookingDate: z.string().min(1, 'Vui lòng chọn ngày'),
  customerName: z.string().trim().min(2, 'Họ tên tối thiểu 2 ký tự'),
  customerPhone: z
    .string()
    .trim()
    .regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ'),
  note: z.string().trim().max(500).optional().or(z.literal('')),
  paymentMethod: z.enum(['Online', 'PayAtField'], { required_error: 'Vui lòng chọn hình thức thanh toán' }),
});
