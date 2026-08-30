import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export const internshipRepo = {
  findAll(params: { studentId?: number; page?: number; pageSize?: number }) {
    const { studentId, page = 1, pageSize = 50 } = params;
    const where: Prisma.InternshipWhereInput = {};
    if (studentId) where.studentId = studentId;
    const skip = (page - 1) * pageSize;
    return Promise.all([
      prisma.internship.findMany({ where, orderBy: [{ startDate: 'desc' }], skip, take: pageSize }),
      prisma.internship.count({ where }),
    ]);
  },

  findById(id: number) {
    return prisma.internship.findUnique({ where: { id } });
  },

  create(data: Prisma.InternshipCreateInput) {
    return prisma.internship.create({ data });
  },

  update(id: number, data: Prisma.InternshipUpdateInput) {
    return prisma.internship.update({ where: { id }, data });
  },

  delete(id: number) {
    return prisma.internship.delete({ where: { id } });
  },
};
