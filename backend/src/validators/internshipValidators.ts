import { z } from 'zod';
import { dateString, optionalDate, money, dateRange } from './common';

export const createInternshipSchema = z
  .object({
    studentId: z.coerce.number().int().positive().optional(),
    companyName: z.string().min(1).max(150),
    role: z.string().min(1).max(100),
    startDate: dateString,
    endDate: optionalDate,
    stipend: money.optional(),
    certificateUrl: z.string().max(500).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const result = dateRange(data);
    if (result !== true) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.message, path: [result.path] });
    }
  });

export const updateInternshipSchema = z
  .object({
    companyName: z.string().min(1).max(150).optional(),
    role: z.string().min(1).max(100).optional(),
    startDate: dateString.optional(),
    endDate: optionalDate,
    stipend: money.optional(),
    certificateUrl: z.string().max(500).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const result = dateRange(data);
    if (result !== true) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.message, path: [result.path] });
    }
  });

export type CreateInternshipInput = z.infer<typeof createInternshipSchema>;
export type UpdateInternshipInput = z.infer<typeof updateInternshipSchema>;
