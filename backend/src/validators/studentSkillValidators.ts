import { z } from 'zod';

export const assignSkillSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  skillId: z.coerce.number().int().positive(),
});

export type AssignSkillInput = z.infer<typeof assignSkillSchema>;
