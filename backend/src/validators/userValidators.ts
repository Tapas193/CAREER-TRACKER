import { z } from 'zod';
import { Role, AccountStatus } from '@prisma/client';

export const createUserSchema = z.object({
  firstName: z.string().min(1).max(50),
  middleName: z.string().max(50).nullable().optional(),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().max(15).nullable().optional(),
  password: z.string().min(6),
  role: z.nativeEnum(Role).default(Role.STUDENT),
  accountStatus: z.nativeEnum(AccountStatus).default(AccountStatus.ACTIVE),
  studentId: z.coerce.number().int().positive().nullable().optional(),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  middleName: z.string().max(50).nullable().optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().max(15).nullable().optional(),
  password: z.string().min(6).optional(),
  role: z.nativeEnum(Role).optional(),
  accountStatus: z.nativeEnum(AccountStatus).optional(),
  studentId: z.coerce.number().int().positive().nullable().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
