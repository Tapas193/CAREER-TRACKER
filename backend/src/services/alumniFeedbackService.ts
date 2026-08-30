import { alumniFeedbackRepo } from '../repositories/alumniFeedbackRepo';
import { AppError } from '../utils/http';

export const alumniFeedbackService = {
  async list(params: { studentId?: number; page?: number; pageSize?: number }) {
    const [items, total] = await alumniFeedbackRepo.findAll(params);
    return { items, total };
  },

  async getById(id: number, ownerStudentId?: number) {
    const feedback = await alumniFeedbackRepo.findById(id);
    if (!feedback) throw new AppError('Alumni feedback not found', 404);
    if (ownerStudentId && feedback.studentId !== ownerStudentId) {
      throw new AppError('Forbidden: you can only access your own data', 403);
    }
    return feedback;
  },

  async create(data: any) {
    return alumniFeedbackRepo.create(data);
  },

  async update(id: number, data: any, ownerStudentId?: number) {
    await this.getById(id, ownerStudentId);
    return alumniFeedbackRepo.update(id, data);
  },

  async delete(id: number, ownerStudentId?: number) {
    await this.getById(id, ownerStudentId);
    return alumniFeedbackRepo.delete(id);
  },
};
