import { Request, Response } from 'express';
import { internshipService } from '../services/internshipService';
import { success, asyncHandler } from '../utils/http';
import { Role } from '@prisma/client';

export const internshipController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN
        ? Number(req.query.studentId) || undefined
        : req.user!.studentId ?? undefined;
    const data = await internshipService.list({ studentId: ownerStudentId });
    return success(res, data, 'Internships fetched');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    const internship = await internshipService.getById(Number(req.params.id), ownerStudentId);
    return success(res, internship, 'Internship fetched');
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const data = { ...req.validated };
    if (req.user!.role !== Role.ADMIN) {
      data.studentId = req.user!.studentId;
    }
    const internship = await internshipService.create(data);
    return success(res, internship, 'Internship created', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    const internship = await internshipService.update(Number(req.params.id), req.validated, ownerStudentId);
    return success(res, internship, 'Internship updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    await internshipService.delete(Number(req.params.id), ownerStudentId);
    return success(res, null, 'Internship deleted');
  }),
};
