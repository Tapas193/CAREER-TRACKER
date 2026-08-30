import { careerHistoryRepo } from '../repositories/careerHistoryRepo';
import { AppError } from '../utils/http';

export const careerHistoryService = {
  async list(params: { studentId?: number; page?: number; pageSize?: number }) {
    const [items, total] = await careerHistoryRepo.findAll(params);
    return { items, total };
  },

  async getById(id: number, ownerStudentId?: number) {
    const history = await careerHistoryRepo.findById(id);
    if (!history) throw new AppError('Career history not found', 404);
    if (ownerStudentId && history.studentId !== ownerStudentId) {
      throw new AppError('Forbidden: you can only access your own data', 403);
    }
    return history;
  },

  async create(data: any) {
    return careerHistoryRepo.create(data);
  },

  async update(id: number, data: any, ownerStudentId?: number) {
    await this.getById(id, ownerStudentId);
    return careerHistoryRepo.update(id, data);
  },

  async delete(id: number, ownerStudentId?: number) {
    await this.getById(id, ownerStudentId);
    return careerHistoryRepo.delete(id);
  },
};
