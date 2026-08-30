import { z } from 'zod';
import { dateString, optionalDate, teamSize, dateRange } from './common';

export const createProjectSchema = z
  .object({
    studentId: z.coerce.number().int().positive().optional(),
    projectTitle: z.string().min(1).max(150),
    description: z.string().nullable().optional(),
    startDate: dateString,
    endDate: optionalDate,
    technologyUsed: z.string().max(255).nullable().optional(),
    projectUrl: z.string().max(500).nullable().optional(),
    teamSize: teamSize.default(1),
  })
  .superRefine((data, ctx) => {
    const result = dateRange(data);
    if (result !== true) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.message, path: [result.path] });
    }
  });

export const updateProjectSchema = z
  .object({
    projectTitle: z.string().min(1).max(150).optional(),
    description: z.string().nullable().optional(),
    startDate: dateString.optional(),
    endDate: optionalDate,
    technologyUsed: z.string().max(255).nullable().optional(),
    projectUrl: z.string().max(500).nullable().optional(),
    teamSize: teamSize.optional(),
  })
  .superRefine((data, ctx) => {
    const result = dateRange(data);
    if (result !== true) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.message, path: [result.path] });
    }
  });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
