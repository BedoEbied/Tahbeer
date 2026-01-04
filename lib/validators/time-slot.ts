import { z } from 'zod';

export const createTimeSlotSchema = z.object({
  course_id: z.number().int().positive(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
});

export const updateTimeSlotSchema = z.object({
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
});

export type CreateTimeSlotInput = z.infer<typeof createTimeSlotSchema>;
export type UpdateTimeSlotInput = z.infer<typeof updateTimeSlotSchema>;
