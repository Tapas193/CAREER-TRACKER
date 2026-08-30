import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export const academicRecordRepo = {
  findAll(params: { studentId?: number; page?: number; pageSize?: number }) {
    const { studentId, page = 1, pageSize = 50 } = params;
    const where: Prisma.AcademicRecordWhereInput = {};
    if (studentId) where.studentId = studentId;
    const skip = (page - 1) * pageSize;
    return Promise.all([
      prisma.academicRecord.findMany({ where, orderBy: [{ semester: 'asc' }], skip, take: pageSize }),
      prisma.academicRecord.count({ where }),
    ]);
  },

  findById(id: number) {
    return prisma.academicRecord.findUnique({ where: { id } });
  },

  create(data: Prisma.AcademicRecordCreateInput) {
    return prisma.academicRecord.create({ data });
  },

  update(id: number, data: Prisma.AcademicRecordUpdateInput) {
    return prisma.academicRecord.update({ where: { id }, data });
  },

  delete(id: number) {
    return prisma.academicRecord.delete({ where: { id } });
  },
};
