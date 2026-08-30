import { z } from 'zod';
import { dateString, optionalDate, dateRange } from './common';

export const createCareerHistorySchema = z
  .object({
    studentId: z.coerce.number().int().positive().optional(),
    companyName: z.string().min(1).max(150),
    jobTitle: z.string().min(1).max(100),
    startDate: dateString,
    endDate: optionalDate,
    role: z.string().max(100).nullable().optional(),
    location: z.string().max(100).nullable().optional(),
    currentJob: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    const result = dateRange(data);
    if (result !== true) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.message, path: [result.path] });
    }
  });

export const updateCareerHistorySchema = z
  .object({
    companyName: z.string().min(1).max(150).optional(),
    jobTitle: z.string().min(1).max(100).optional(),
    startDate: dateString.optional(),
    endDate: optionalDate,
    role: z.string().max(100).nullable().optional(),
    location: z.string().max(100).nullable().optional(),
    currentJob: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const result = dateRange(data);
    if (result !== true) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.message, path: [result.path] });
    }
  });

export type CreateCareerHistoryInput = z.infer<typeof createCareerHistorySchema>;
export type UpdateCareerHistoryInput = z.infer<typeof updateCareerHistorySchema>;
