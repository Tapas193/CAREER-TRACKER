import { Request, Response } from 'express';
import { studentSkillService } from '../services/studentSkillService';
import { success, asyncHandler } from '../utils/http';
import { Role } from '@prisma/client';

export const studentSkillController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN
        ? Number(req.query.studentId) || undefined
        : req.user!.studentId ?? undefined;
    const data = await studentSkillService.list({ studentId: ownerStudentId });
    return success(res, data, 'Student skills fetched');
  }),

  assign: asyncHandler(async (req: Request, res: Response) => {
    const { studentId, skillId } = req.validated;
    const data = await studentSkillService.assign(
      req.user!.role === Role.ADMIN ? studentId : req.user!.studentId,
      skillId
    );
    return success(res, data, 'Skill assigned', 201);
  }),

  unassign: asyncHandler(async (req: Request, res: Response) => {
    const studentId = Number(req.params.studentId);
    const skillId = Number(req.params.skillId);
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    await studentSkillService.unassign(studentId, skillId, ownerStudentId);
    return success(res, null, 'Skill unassigned');
  }),
};
