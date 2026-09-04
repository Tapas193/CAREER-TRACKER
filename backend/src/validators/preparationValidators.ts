import { z } from 'zod';

export const classroomCategories = [
  'Interview Preparation',
  'Technical Interview',
  'HR Interview',
  'Aptitude',
  'Coding / DSA',
  'Communication Skills',
  'Resume Preparation',
  'Group Discussion',
  'Mock Interview',
] as const;

export const resourceTypes = ['YOUTUBE', 'ARTICLE', 'PDF', 'DOCUMENT', 'PRACTICE', 'OTHER'] as const;
export const difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

const url = z.string().min(1).max(1000).refine(
  (v) => /^https?:\/\//i.test(v),
  'URL must start with http:// or https://'
);

export const createPreparationResourceSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  category: z.enum(classroomCategories),
  topic: z.string().min(1).max(200),
  resourceType: z.enum(resourceTypes),
  url: url,
  thumbnailUrl: z.string().max(1000).nullable().optional().refine(
    (v) => (v == null || v === '' ? true : /^https?:\/\//i.test(v)),
    'Thumbnail URL must start with http:// or https://'
  ),
  duration: z.string().max(50).nullable().optional(),
  difficulty: z.enum(difficulties).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updatePreparationResourceSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  category: z.enum(classroomCategories).optional(),
  topic: z.string().min(1).max(200).optional(),
  resourceType: z.enum(resourceTypes).optional(),
  url: url.optional(),
  thumbnailUrl: z.string().max(1000).nullable().optional().refine(
    (v) => (v == null || v === '' ? true : /^https?:\/\//i.test(v)),
    'Thumbnail URL must start with http:// or https://'
  ),
  duration: z.string().max(50).nullable().optional(),
  difficulty: z.enum(difficulties).nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreatePreparationResourceInput = z.infer<typeof createPreparationResourceSchema>;
export type UpdatePreparationResourceInput = z.infer<typeof updatePreparationResourceSchema>;
