import { internshipRepo } from '../repositories/internshipRepo';
import { AppError } from '../utils/http';

export const internshipService = {
  async list(params: { studentId?: number; page?: number; pageSize?: number }) {
    const [items, total] = await internshipRepo.findAll(params);
    return { items, total };
  },

  async getById(id: number, ownerStudentId?: number) {
    const internship = await internshipRepo.findById(id);
    if (!internship) throw new AppError('Internship not found', 404);
    if (ownerStudentId && internship.studentId !== ownerStudentId) {
      throw new AppError('Forbidden: you can only access your own data', 403);
    }
    return internship;
  },

  async create(data: any) {
    return internshipRepo.create(data);
  },

  async update(id: number, data: any, ownerStudentId?: number) {
    await this.getById(id, ownerStudentId);
    return internshipRepo.update(id, data);
  },

  async delete(id: number, ownerStudentId?: number) {
    await this.getById(id, ownerStudentId);
    return internshipRepo.delete(id);
  },
};
