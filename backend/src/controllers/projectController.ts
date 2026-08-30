import { Request, Response } from 'express';
import { projectService } from '../services/projectService';
import { success, asyncHandler } from '../utils/http';
import { Role } from '@prisma/client';

export const projectController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN
        ? Number(req.query.studentId) || undefined
        : req.user!.studentId ?? undefined;
    const data = await projectService.list({ studentId: ownerStudentId });
    return success(res, data, 'Projects fetched');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    const project = await projectService.getById(Number(req.params.id), ownerStudentId);
    return success(res, project, 'Project fetched');
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const data = { ...req.validated };
    if (req.user!.role !== Role.ADMIN) {
      data.studentId = req.user!.studentId;
    }
    const project = await projectService.create(data);
    return success(res, project, 'Project created', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    const project = await projectService.update(Number(req.params.id), req.validated, ownerStudentId);
    return success(res, project, 'Project updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    await projectService.delete(Number(req.params.id), ownerStudentId);
    return success(res, null, 'Project deleted');
  }),
};
