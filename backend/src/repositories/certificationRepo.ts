import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export const certificationRepo = {
  findAll(params: { studentId?: number; page?: number; pageSize?: number }) {
    const { studentId, page = 1, pageSize = 50 } = params;
    const where: Prisma.CertificationWhereInput = {};
    if (studentId) where.studentId = studentId;
    const skip = (page - 1) * pageSize;
    return Promise.all([
      prisma.certification.findMany({ where, orderBy: [{ issuingDate: 'desc' }], skip, take: pageSize }),
      prisma.certification.count({ where }),
    ]);
  },

  findById(id: number) {
    return prisma.certification.findUnique({ where: { id } });
  },

  create(data: Prisma.CertificationCreateInput) {
    return prisma.certification.create({ data });
  },

  update(id: number, data: Prisma.CertificationUpdateInput) {
    return prisma.certification.update({ where: { id }, data });
  },

  delete(id: number) {
    return prisma.certification.delete({ where: { id } });
  },
};
