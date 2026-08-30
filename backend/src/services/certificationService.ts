import { certificationRepo } from '../repositories/certificationRepo';
import { AppError } from '../utils/http';

export const certificationService = {
  async list(params: { studentId?: number; page?: number; pageSize?: number }) {
    const [items, total] = await certificationRepo.findAll(params);
    return { items, total };
  },

  async getById(id: number, ownerStudentId?: number) {
    const cert = await certificationRepo.findById(id);
    if (!cert) throw new AppError('Certification not found', 404);
    if (ownerStudentId && cert.studentId !== ownerStudentId) {
      throw new AppError('Forbidden: you can only access your own data', 403);
    }
    return cert;
  },

  async create(data: any) {
    return certificationRepo.create(data);
  },

  async update(id: number, data: any, ownerStudentId?: number) {
    await this.getById(id, ownerStudentId);
    return certificationRepo.update(id, data);
  },

  async delete(id: number, ownerStudentId?: number) {
    await this.getById(id, ownerStudentId);
    return certificationRepo.delete(id);
  },
};
