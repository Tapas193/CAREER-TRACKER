import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export const preparationRepo = {
  findAll(params: {
    category?: string;
    topic?: string;
    resourceType?: string;
    difficulty?: string;
    includeInactive?: boolean;
  }) {
    const { category, topic, resourceType, difficulty, includeInactive = false } = params;
    const where: Prisma.PreparationResourceWhereInput = {};
    if (category) where.category = category;
    if (topic) where.topic = topic;
    if (resourceType) where.resourceType = resourceType as any;
    if (difficulty) where.difficulty = difficulty as any;
    if (!includeInactive) where.isActive = true;
    return prisma.preparationResource.findMany({
      where,
      orderBy: [{ topic: 'asc' }, { createdAt: 'desc' }],
    });
  },

  findById(id: number) {
    return prisma.preparationResource.findUnique({ where: { id } });
  },

  create(data: Prisma.PreparationResourceCreateInput) {
    return prisma.preparationResource.create({ data });
  },

  update(id: number, data: Prisma.PreparationResourceUpdateInput) {
    return prisma.preparationResource.update({ where: { id }, data });
  },

  delete(id: number) {
    return prisma.preparationResource.delete({ where: { id } });
  },
};
