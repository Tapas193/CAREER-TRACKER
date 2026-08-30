import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export const careerHistoryRepo = {
  findAll(params: { studentId?: number; page?: number; pageSize?: number }) {
    const { studentId, page = 1, pageSize = 50 } = params;
    const where: Prisma.CareerHistoryWhereInput = {};
    if (studentId) where.studentId = studentId;
    const skip = (page - 1) * pageSize;
    return Promise.all([
      prisma.careerHistory.findMany({ where, orderBy: [{ startDate: 'desc' }], skip, take: pageSize }),
      prisma.careerHistory.count({ where }),
    ]);
  },

  findById(id: number) {
    return prisma.careerHistory.findUnique({ where: { id } });
  },

  create(data: Prisma.CareerHistoryCreateInput) {
    return prisma.careerHistory.create({ data });
  },

  update(id: number, data: Prisma.CareerHistoryUpdateInput) {
    return prisma.careerHistory.update({ where: { id }, data });
  },

  delete(id: number) {
    return prisma.careerHistory.delete({ where: { id } });
  },
};
