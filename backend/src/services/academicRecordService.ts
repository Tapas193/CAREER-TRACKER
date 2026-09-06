import { academicRecordRepo } from '../repositories/academicRecordRepo';
import { AppError } from '../utils/http';
import { NotificationType, ResultStatus } from '@prisma/client';
import { notificationService } from './notificationService';

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
    const record = await academicRecordRepo.create(data);
    if (record.resultStatus === ResultStatus.FAIL) {
      await notificationService.notifyStudent(record.studentId, {
        type: NotificationType.ACADEMIC,
        title: 'Academic result requires attention',
        message: `Semester ${record.semester} (${record.academicYear}) has been recorded with a FAIL result. Please check your academic records.`,
        relatedId: record.id,
        relatedType: 'AcademicRecord',
      });
    }
    return record;
  },

  async update(id: number, data: any, ownerStudentId?: number) {
    const existing = await this.getById(id, ownerStudentId);
    const record = await academicRecordRepo.update(id, data);
    if (existing.resultStatus !== ResultStatus.FAIL && data.resultStatus === ResultStatus.FAIL) {
      await notificationService.notifyStudent(record.studentId, {
        type: NotificationType.ACADEMIC,
        title: 'Academic result requires attention',
        message: `Semester ${record.semester} (${record.academicYear}) has been updated with a FAIL result. Please check your academic records.`,
        relatedId: record.id,
        relatedType: 'AcademicRecord',
      });
    }
    return record;
  },

  async delete(id: number, ownerStudentId?: number) {
    await this.getById(id, ownerStudentId);
    return academicRecordRepo.delete(id);
  },
};
