import { preparationRepo } from '../repositories/preparationRepo';
import { AppError } from '../utils/http';

export const preparationService = {
  async list(params: {
    category?: string;
    topic?: string;
    resourceType?: string;
    difficulty?: string;
    includeInactive?: boolean;
  }) {
    const items = await preparationRepo.findAll(params);
    return { items, total: items.length };
  },

  async getById(id: number) {
    const resource = await preparationRepo.findById(id);
    if (!resource) throw new AppError('Preparation resource not found', 404);
    return resource;
  },

  async create(data: any) {
    return preparationRepo.create(data);
  },

  async update(id: number, data: any) {
    await this.getById(id);
    return preparationRepo.update(id, data);
  },

  async delete(id: number) {
    await this.getById(id);
    return preparationRepo.delete(id);
  },
};
