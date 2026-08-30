import { Request, Response } from 'express';
import { courseService } from '../services/courseService';
import { success, asyncHandler } from '../utils/http';

export const courseController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const data = await courseService.list(req.query);
    return success(res, data, 'Courses fetched');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const course = await courseService.getById(Number(req.params.id));
    return success(res, course, 'Course fetched');
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const course = await courseService.create(req.validated);
    return success(res, course, 'Course created', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const course = await courseService.update(Number(req.params.id), req.validated);
    return success(res, course, 'Course updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await courseService.delete(Number(req.params.id));
    return success(res, null, 'Course deleted');
  }),
};
