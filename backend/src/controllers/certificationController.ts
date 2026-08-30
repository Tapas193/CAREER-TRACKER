import { Request, Response } from 'express';
import { certificationService } from '../services/certificationService';
import { success, asyncHandler } from '../utils/http';
import { Role } from '@prisma/client';

export const certificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN
        ? Number(req.query.studentId) || undefined
        : req.user!.studentId ?? undefined;
    const data = await certificationService.list({ studentId: ownerStudentId });
    return success(res, data, 'Certifications fetched');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    const cert = await certificationService.getById(Number(req.params.id), ownerStudentId);
    return success(res, cert, 'Certification fetched');
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const data = { ...req.validated };
    if (req.user!.role !== Role.ADMIN) {
      data.studentId = req.user!.studentId;
    }
    const cert = await certificationService.create(data);
    return success(res, cert, 'Certification created', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    const cert = await certificationService.update(Number(req.params.id), req.validated, ownerStudentId);
    return success(res, cert, 'Certification updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    await certificationService.delete(Number(req.params.id), ownerStudentId);
    return success(res, null, 'Certification deleted');
  }),
};
