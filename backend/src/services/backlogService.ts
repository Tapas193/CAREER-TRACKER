import { backlogRepo } from '../repositories/backlogRepo';
import { AppError } from '../utils/http';
import { NotificationType } from '@prisma/client';
import { notificationService } from './notificationService';

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
    const backlog = await backlogRepo.create(data);
    if (!backlog.clearedDate) {
      await notificationService.notifyStudent(backlog.studentId, {
        type: NotificationType.BACKLOG,
        title: 'Backlog requires attention',
        message: `A backlog in ${backlog.subject} (semester ${backlog.semester}) has been recorded as pending. Please review your re-attempt plan.`,
        relatedId: backlog.id,
        relatedType: 'Backlog',
      });
    }
    return backlog;
  },

  async update(id: number, data: any, ownerStudentId?: number) {
    const existing = await this.getById(id, ownerStudentId);
    const backlog = await backlogRepo.update(id, data);
    if (!existing.clearedDate && data.clearedDate) {
      await notificationService.notifyStudent(backlog.studentId, {
        type: NotificationType.BACKLOG,
        title: 'Backlog cleared',
        message: `Your backlog in ${backlog.subject} has been marked as cleared. Well done!`,
        relatedId: backlog.id,
        relatedType: 'Backlog',
      });
    }
    return backlog;
  },

  async delete(id: number, ownerStudentId?: number) {
    await this.getById(id, ownerStudentId);
    return backlogRepo.delete(id);
  },
};
