import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export const projectRepo = {
  findAll(params: { studentId?: number; page?: number; pageSize?: number }) {
    const { studentId, page = 1, pageSize = 50 } = params;
    const where: Prisma.ProjectWhereInput = {};
    if (studentId) where.studentId = studentId;
    const skip = (page - 1) * pageSize;
    return Promise.all([
      prisma.project.findMany({ where, orderBy: [{ startDate: 'desc' }], skip, take: pageSize }),
      prisma.project.count({ where }),
    ]);
  },

  findById(id: number) {
    return prisma.project.findUnique({ where: { id } });
  },

  create(data: Prisma.ProjectCreateInput) {
    return prisma.project.create({ data });
  },

  update(id: number, data: Prisma.ProjectUpdateInput) {
    return prisma.project.update({ where: { id }, data });
  },

  delete(id: number) {
    return prisma.project.delete({ where: { id } });
  },
};
