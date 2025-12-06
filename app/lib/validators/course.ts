import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be a non-negative number'),
  image_url: z.string().url('Invalid image URL').optional(),
  status: z.enum(['draft', 'published']).optional()
});

export const updateCourseSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').optional(),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be a non-negative number').optional(),
  image_url: z.string().url('Invalid image URL').optional(),
  status: z.enum(['draft', 'published', 'archived']).optional()
});

export const courseIdSchema = z.object({
  id: z.coerce.number().int().min(1, 'Invalid course ID')
});

export const getAllCoursesQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be a positive integer').optional(),
  limit: z.coerce.number().int().min(1).max(100, 'Limit must be between 1 and 100').optional(),
  status: z.enum(['published']).optional()
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseIdInput = z.infer<typeof courseIdSchema>;
export type GetAllCoursesQuery = z.infer<typeof getAllCoursesQuerySchema>;
