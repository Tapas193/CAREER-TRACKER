import { skillRepo } from '../repositories/skillRepo';
import { AppError } from '../utils/http';
import { Prisma } from '@prisma/client';

export const skillService = {
  async list(params: any) {
    const [items, total] = await skillRepo.findAll(params);
    return { items, total };
  },

  async getById(id: number) {
    const skill = await skillRepo.findById(id);
    if (!skill) throw new AppError('Skill not found', 404);
    return skill;
  },

  async create(data: Prisma.SkillCreateInput) {
    return skillRepo.create(data);
  },

  async update(id: number, data: Prisma.SkillUpdateInput) {
    await this.ensureExists(id);
    return skillRepo.update(id, data);
  },

  async delete(id: number) {
    await this.ensureExists(id);
    return skillRepo.delete(id);
  },

  async ensureExists(id: number) {
    const skill = await skillRepo.findById(id);
    if (!skill) throw new AppError('Skill not found', 404);
    return skill;
  },
};
