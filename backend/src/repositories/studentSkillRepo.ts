import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export const studentSkillRepo = {
  findAll(params: { studentId?: number; page?: number; pageSize?: number }) {
    const { studentId, page = 1, pageSize = 50 } = params;
    const where: Prisma.StudentSkillWhereInput = {};
    if (studentId) where.studentId = studentId;
    const skip = (page - 1) * pageSize;
    return Promise.all([
      prisma.studentSkill.findMany({ where, include: { skill: true }, orderBy: { studentId: 'asc' }, skip, take: pageSize }),
      prisma.studentSkill.count({ where }),
    ]);
  },

  findById(studentId: number, skillId: number) {
    return prisma.studentSkill.findUnique({ where: { studentId_skillId: { studentId, skillId } } });
  },

  create(data: Prisma.StudentSkillCreateInput) {
    return prisma.studentSkill.create({ data, include: { skill: true } });
  },

  delete(studentId: number, skillId: number) {
    return prisma.studentSkill.delete({ where: { studentId_skillId: { studentId, skillId } } });
  },
};
