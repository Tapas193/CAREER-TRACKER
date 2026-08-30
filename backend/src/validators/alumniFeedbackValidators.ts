import { z } from 'zod';
import { rating, dateString } from './common';

export const createAlumniFeedbackSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  rating,
  comment: z.string().nullable().optional(),
  feedback: z.string().nullable().optional(),
  feedbackDate: dateString,
});

export const updateAlumniFeedbackSchema = z.object({
  rating: rating.optional(),
  comment: z.string().nullable().optional(),
  feedback: z.string().nullable().optional(),
  feedbackDate: dateString.optional(),
});

export type CreateAlumniFeedbackInput = z.infer<typeof createAlumniFeedbackSchema>;
export type UpdateAlumniFeedbackInput = z.infer<typeof updateAlumniFeedbackSchema>;
