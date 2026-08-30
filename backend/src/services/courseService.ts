import { courseRepo } from '../repositories/courseRepo';
import { AppError } from '../utils/http';
import { Prisma } from '@prisma/client';

export const courseService = {
  async list(params: any) {
    const [items, total] = await courseRepo.findAll(params);
    return { items, total };
  },

  async getById(id: number) {
    const course = await courseRepo.findById(id);
    if (!course) throw new AppError('Course not found', 404);
    return course;
  },

  async create(data: Prisma.CourseCreateInput) {
    return courseRepo.create(data);
  },

  async update(id: number, data: Prisma.CourseUpdateInput) {
    await this.ensureExists(id);
    return courseRepo.update(id, data);
  },

  async delete(id: number) {
    await this.ensureExists(id);
    return courseRepo.delete(id);
  },

  async ensureExists(id: number) {
    const course = await courseRepo.findById(id);
    if (!course) throw new AppError('Course not found', 404);
    return course;
  },
};
