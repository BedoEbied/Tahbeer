import { z } from 'zod';

export const createBookingSchema = z.object({
  course_id: z.number().int().positive(),
  slot_id: z.number().int().positive(),
  amount: z.number().positive(),
});

export const createPaymentSchema = z.object({
  booking_id: z.number().int().positive(),
  amount: z.number().positive(),
  email: z.string().email(),
  phone: z.string().min(10),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'completed', 'no_show']),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
