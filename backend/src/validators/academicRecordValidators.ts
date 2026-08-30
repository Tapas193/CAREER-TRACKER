import { z } from 'zod';
import { gpa } from './common';
import { ResultStatus } from '@prisma/client';

export const createAcademicRecordSchema = z
  .object({
    studentId: z.coerce.number().int().positive().optional(),
    semester: z.coerce.number().int().min(1),
    academicYear: z.coerce.number().int(),
    sgpa: gpa,
    cgpa: gpa,
    creditsEarned: z.coerce.number().min(0),
    totalCredits: z.coerce.number().min(0),
    resultStatus: z.nativeEnum(ResultStatus),
  })
  .refine(
    (data) => data.creditsEarned <= data.totalCredits,
    { message: 'creditsEarned must be <= totalCredits', path: ['creditsEarned'] }
  );

export const updateAcademicRecordSchema = z.object({
  semester: z.coerce.number().int().min(1).optional(),
  academicYear: z.coerce.number().int().optional(),
  sgpa: gpa.optional(),
  cgpa: gpa.optional(),
  creditsEarned: z.coerce.number().min(0).optional(),
  totalCredits: z.coerce.number().min(0).optional(),
  resultStatus: z.nativeEnum(ResultStatus).optional(),
});

export type CreateAcademicRecordInput = z.infer<typeof createAcademicRecordSchema>;
export type UpdateAcademicRecordInput = z.infer<typeof updateAcademicRecordSchema>;
