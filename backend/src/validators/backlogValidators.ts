import { z } from 'zod';
import { optionalDate } from './common';

export const createBacklogSchema = z.object({
  studentId: z.coerce.number().int().positive().optional(),
  attemptedNo: z.coerce.number().int().min(1),
  semester: z.coerce.number().int().min(1),
  subject: z.string().min(1).max(100),
  status: z.string().min(1).max(45),
  clearedDate: optionalDate,
  attemptedAgain: z.boolean().optional(),
});

export const updateBacklogSchema = z.object({
  attemptedNo: z.coerce.number().int().min(1).optional(),
  semester: z.coerce.number().int().min(1).optional(),
  subject: z.string().min(1).max(100).optional(),
  status: z.string().min(1).max(45).optional(),
  clearedDate: optionalDate,
  attemptedAgain: z.boolean().optional(),
});

export type CreateBacklogInput = z.infer<typeof createBacklogSchema>;
export type UpdateBacklogInput = z.infer<typeof updateBacklogSchema>;
