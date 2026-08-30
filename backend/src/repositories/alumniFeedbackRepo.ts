import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export const alumniFeedbackRepo = {
  findAll(params: { studentId?: number; page?: number; pageSize?: number }) {
    const { studentId, page = 1, pageSize = 50 } = params;
    const where: Prisma.AlumniFeedbackWhereInput = {};
    if (studentId) where.studentId = studentId;
    const skip = (page - 1) * pageSize;
    return Promise.all([
      prisma.alumniFeedback.findMany({ where, orderBy: [{ feedbackDate: 'desc' }], skip, take: pageSize }),
      prisma.alumniFeedback.count({ where }),
    ]);
  },

  findById(id: number) {
    return prisma.alumniFeedback.findUnique({ where: { id } });
  },

  create(data: Prisma.AlumniFeedbackCreateInput) {
    return prisma.alumniFeedback.create({ data });
  },

  update(id: number, data: Prisma.AlumniFeedbackUpdateInput) {
    return prisma.alumniFeedback.update({ where: { id }, data });
  },

  delete(id: number) {
    return prisma.alumniFeedback.delete({ where: { id } });
  },
};
