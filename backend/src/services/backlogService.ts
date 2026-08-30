import { backlogRepo } from '../repositories/backlogRepo';
import { AppError } from '../utils/http';

export const backlogService = {
  async list(params: { studentId?: number; page?: number; pageSize?: number }) {
    const [items, total] = await backlogRepo.findAll(params);
    return { items, total };
  },

  async getById(id: number, ownerStudentId?: number) {
    const backlog = await backlogRepo.findById(id);
    if (!backlog) throw new AppError('Backlog not found', 404);
    if (ownerStudentId && backlog.studentId !== ownerStudentId) {
      throw new AppError('Forbidden: you can only access your own data', 403);
    }
    return backlog;
  },

  async create(data: any) {
    return backlogRepo.create(data);
  },

  async update(id: number, data: any, ownerStudentId?: number) {
    await this.getById(id, ownerStudentId);
    return backlogRepo.update(id, data);
  },

  async delete(id: number, ownerStudentId?: number) {
    await this.getById(id, ownerStudentId);
    return backlogRepo.delete(id);
  },
};
