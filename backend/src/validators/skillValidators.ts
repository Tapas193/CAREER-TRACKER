import { z } from 'zod';

export const createSkillSchema = z.object({
  skillName: z.string().min(1).max(50),
  category: z.string().max(50).nullable().optional(),
});

export const updateSkillSchema = z.object({
  skillName: z.string().min(1).max(50).optional(),
  category: z.string().max(50).nullable().optional(),
});

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
