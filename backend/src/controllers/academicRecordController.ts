import { Request, Response } from 'express';
import { academicRecordService } from '../services/academicRecordService';
import { success, asyncHandler } from '../utils/http';
import { Role } from '@prisma/client';

export const academicRecordController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN
        ? Number(req.query.studentId) || undefined
        : req.user!.studentId ?? undefined;
    const data = await academicRecordService.list({ studentId: ownerStudentId });
    return success(res, data, 'Academic records fetched');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    const record = await academicRecordService.getById(Number(req.params.id), ownerStudentId);
    return success(res, record, 'Academic record fetched');
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const data = { ...req.validated };
    if (req.user!.role !== Role.ADMIN) {
      data.studentId = req.user!.studentId;
    }
    const record = await academicRecordService.create(data);
    return success(res, record, 'Academic record created', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    const record = await academicRecordService.update(Number(req.params.id), req.validated, ownerStudentId);
    return success(res, record, 'Academic record updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    await academicRecordService.delete(Number(req.params.id), ownerStudentId);
    return success(res, null, 'Academic record deleted');
  }),
};
