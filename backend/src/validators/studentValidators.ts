import { z } from 'zod';
import { dateString } from './common';
import {
  StudentStatus,
  GraduationStatus,
  AccountStatus,
} from '@prisma/client';

export const createStudentSchema = z.object({
  firstName: z.string().min(1).max(50),
  middleName: z.string().max(50).nullable().optional(),
  lastName: z.string().min(1).max(50),
  dateOfBirth: dateString.nullable().optional(),
  gender: z.string().max(45).nullable().optional(),
  enrollmentNo: z.string().min(1).max(30),
  rollNumber: z.string().min(1).max(15),
  admissionNo: z.string().min(1).max(30),
  admissionYear: z.coerce.number().int(),
  expectedYear: z.coerce.number().int(),
  currentSemester: z.coerce.number().int().min(1),
  currentStatus: z.nativeEnum(StudentStatus).default(StudentStatus.ADMITTED),
  graduationStatus: z.nativeEnum(GraduationStatus).default(GraduationStatus.IN_PROGRESS),
  accountStatus: z.nativeEnum(AccountStatus).default(AccountStatus.ACTIVE),
  address: z.string().max(255).nullable().optional(),
  courseId: z.coerce.number().int().positive(),
  // Optional: create a linked login account
  createAccount: z.boolean().optional(),
  email: z.string().email().optional(),
  phone: z.string().max(15).optional(),
  password: z.string().min(6).optional(),
});

export const updateStudentSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  middleName: z.string().max(50).nullable().optional(),
  lastName: z.string().min(1).max(50).optional(),
  dateOfBirth: dateString.nullable().optional(),
  gender: z.string().max(45).nullable().optional(),
  address: z.string().max(255).nullable().optional(),
  currentSemester: z.coerce.number().int().min(1).optional(),
  phone: z.string().max(15).optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
