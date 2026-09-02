import { userRepo } from '../repositories/userRepo';
import { hashPassword } from '../utils/password';
import { AppError } from '../utils/http';
import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';

export const userService = {
  async list(params: { search?: string; role?: string; page?: number; pageSize?: number }) {
    const { search, role, page = 1, pageSize = 50 } = params;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role as Role;
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          accountStatus: true,
          studentId: true,
          student: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { id: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  },

  async getById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        accountStatus: true,
        studentId: true,
        student: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  },

  async create(data: any) {
    const { password, ...rest } = data;

    const existing = await userRepo.findByEmail(rest.email);

    if (existing) {
      throw new AppError('A user with this email already exists', 409);
    }

    const passwordHash = await hashPassword(password);

    return prisma.user.create({
      data: {
        ...rest,
        passwordHash,
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        accountStatus: true,
        studentId: true,
        student: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async update(id: number, data: any) {
    await this.getById(id);

    const { password, ...rest } = data;
    const updateData: any = { ...rest };

    if (password) {
      updateData.passwordHash = await hashPassword(password);
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        accountStatus: true,
        studentId: true,
        student: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },
};
