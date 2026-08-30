import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export const courseRepo = {
  findAll(params: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 50 } = params;
    const skip = (page - 1) * pageSize;
    return Promise.all([
      prisma.course.findMany({ orderBy: { id: 'asc' }, skip, take: pageSize }),
      prisma.course.count(),
    ]);
  },

  findById(id: number) {
    return prisma.course.findUnique({ where: { id } });
  },

  create(data: Prisma.CourseCreateInput) {
    return prisma.course.create({ data });
  },

  update(id: number, data: Prisma.CourseUpdateInput) {
    return prisma.course.update({ where: { id }, data });
  },

  delete(id: number) {
    return prisma.course.delete({ where: { id } });
  },
};
