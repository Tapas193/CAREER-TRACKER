import { projectRepo } from '../repositories/projectRepo';
import { AppError } from '../utils/http';

export const projectService = {
  async list(params: { studentId?: number; page?: number; pageSize?: number }) {
    const [items, total] = await projectRepo.findAll(params);
    return { items, total };
  },

  async getById(id: number, ownerStudentId?: number) {
    const project = await projectRepo.findById(id);
    if (!project) throw new AppError('Project not found', 404);
    if (ownerStudentId && project.studentId !== ownerStudentId) {
      throw new AppError('Forbidden: you can only access your own data', 403);
    }
    return project;
  },

  async create(data: any) {
    return projectRepo.create(data);
  },

  async update(id: number, data: any, ownerStudentId?: number) {
    await this.getById(id, ownerStudentId);
    return projectRepo.update(id, data);
  },

  async delete(id: number, ownerStudentId?: number) {
    await this.getById(id, ownerStudentId);
    return projectRepo.delete(id);
  },
};
