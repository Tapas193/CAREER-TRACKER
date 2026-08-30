import { academicRecordRepo } from '../repositories/academicRecordRepo';
import { AppError } from '../utils/http';

export const academicRecordService = {
  async list(params: { studentId?: number; page?: number; pageSize?: number }) {
    const [items, total] = await academicRecordRepo.findAll(params);
    return { items, total };
  },

  async getById(id: number, ownerStudentId?: number) {
    const record = await academicRecordRepo.findById(id);
    if (!record) throw new AppError('Academic record not found', 404);
    if (ownerStudentId && record.studentId !== ownerStudentId) {
      throw new AppError('Forbidden: you can only access your own data', 403);
    }
    return record;
  },

  async create(data: any) {
    return academicRecordRepo.create(data);
  },

  async update(id: number, data: any, ownerStudentId?: number) {
    await this.getById(id, ownerStudentId);
    return academicRecordRepo.update(id, data);
  },

  async delete(id: number, ownerStudentId?: number) {
    await this.getById(id, ownerStudentId);
    return academicRecordRepo.delete(id);
  },
};
