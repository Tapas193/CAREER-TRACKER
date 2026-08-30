import { Request, Response } from 'express';
import { skillService } from '../services/skillService';
import { success, asyncHandler } from '../utils/http';

export const skillController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const data = await skillService.list(req.query);
    return success(res, data, 'Skills fetched');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const skill = await skillService.getById(Number(req.params.id));
    return success(res, skill, 'Skill fetched');
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const skill = await skillService.create(req.validated);
    return success(res, skill, 'Skill created', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const skill = await skillService.update(Number(req.params.id), req.validated);
    return success(res, skill, 'Skill updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await skillService.delete(Number(req.params.id));
    return success(res, null, 'Skill deleted');
  }),
};
