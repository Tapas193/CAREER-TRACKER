import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';

export interface CreateUserInput {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  phone?: string | null;
  passwordHash: string;
  role: Role;
  studentId?: number | null;
}

export const userRepo = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: { student: true },
    });
  },

  findByStudentId(studentId: number) {
    return prisma.user.findUnique({ where: { studentId } });
  },

  create(data: CreateUserInput) {
    return prisma.user.create({
      data: {
        firstName: data.firstName,
        middleName: data.middleName ?? null,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone ?? null,
        passwordHash: data.passwordHash,
        role: data.role,
        studentId: data.studentId ?? null,
      },
    });
  },

  async validateLogin(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { student: true },
    });
    if (!user || user.accountStatus !== 'ACTIVE') {
      return null;
    }
    return user;
  },
};
