import { z } from 'zod';

export const createCourseSchema = z.object({
  courseCode: z.string().min(1).max(20),
  courseName: z.string().min(1).max(100),
  department: z.string().min(1).max(100),
  degree: z.string().min(1).max(50),
  durationYears: z.coerce.number().int().min(1),
  totalSemesters: z.coerce.number().int().min(1),
});

export const updateCourseSchema = z.object({
  courseCode: z.string().min(1).max(20).optional(),
  courseName: z.string().min(1).max(100).optional(),
  department: z.string().min(1).max(100).optional(),
  degree: z.string().min(1).max(50).optional(),
  durationYears: z.coerce.number().int().min(1).optional(),
  totalSemesters: z.coerce.number().int().min(1).optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
