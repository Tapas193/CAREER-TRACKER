import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export const skillRepo = {
  findAll(params: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 50 } = params;
    const skip = (page - 1) * pageSize;
    return Promise.all([
      prisma.skill.findMany({ orderBy: { id: 'asc' }, skip, take: pageSize }),
      prisma.skill.count(),
    ]);
  },

  findById(id: number) {
    return prisma.skill.findUnique({ where: { id } });
  },

  create(data: Prisma.SkillCreateInput) {
    return prisma.skill.create({ data });
  },

  update(id: number, data: Prisma.SkillUpdateInput) {
    return prisma.skill.update({ where: { id }, data });
  },

  delete(id: number) {
    return prisma.skill.delete({ where: { id } });
  },
};
