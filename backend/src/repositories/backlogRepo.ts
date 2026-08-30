import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export const backlogRepo = {
  findAll(params: { studentId?: number; page?: number; pageSize?: number }) {
    const { studentId, page = 1, pageSize = 50 } = params;
    const where: Prisma.BacklogWhereInput = {};
    if (studentId) where.studentId = studentId;
    const skip = (page - 1) * pageSize;
    return Promise.all([
      prisma.backlog.findMany({ where, orderBy: [{ semester: 'asc' }], skip, take: pageSize }),
      prisma.backlog.count({ where }),
    ]);
  },

  findById(id: number) {
    return prisma.backlog.findUnique({ where: { id } });
  },

  create(data: Prisma.BacklogCreateInput) {
    return prisma.backlog.create({ data });
  },

  update(id: number, data: Prisma.BacklogUpdateInput) {
    return prisma.backlog.update({ where: { id }, data });
  },

  delete(id: number) {
    return prisma.backlog.delete({ where: { id } });
  },
};
