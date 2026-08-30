import { Request, Response } from 'express';
import { alumniFeedbackService } from '../services/alumniFeedbackService';
import { success, asyncHandler } from '../utils/http';
import { Role } from '@prisma/client';

export const alumniFeedbackController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN
        ? Number(req.query.studentId) || undefined
        : req.user!.studentId ?? undefined;
    const data = await alumniFeedbackService.list({ studentId: ownerStudentId });
    return success(res, data, 'Alumni feedback fetched');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    const feedback = await alumniFeedbackService.getById(Number(req.params.id), ownerStudentId);
    return success(res, feedback, 'Alumni feedback fetched');
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const data = { ...req.validated };
    if (req.user!.role !== Role.ADMIN) {
      data.studentId = req.user!.studentId;
    }
    const feedback = await alumniFeedbackService.create(data);
    return success(res, feedback, 'Alumni feedback created', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    const feedback = await alumniFeedbackService.update(Number(req.params.id), req.validated, ownerStudentId);
    return success(res, feedback, 'Alumni feedback updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    await alumniFeedbackService.delete(Number(req.params.id), ownerStudentId);
    return success(res, null, 'Alumni feedback deleted');
  }),
};
