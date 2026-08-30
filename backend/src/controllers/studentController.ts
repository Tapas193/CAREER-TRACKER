import { Request, Response } from 'express';
import { studentService } from '../services/studentService';
import { success, asyncHandler } from '../utils/http';

export const studentController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const data = await studentService.list(req.query);
    return success(res, data, 'Students fetched');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const student = await studentService.getById(Number(req.params.id));
    return success(res, student, 'Student fetched');
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const student = await studentService.create(req.validated);
    return success(res, student, 'Student created', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const student = await studentService.update(Number(req.params.id), req.validated);
    return success(res, student, 'Student updated');
  }),

  activate: asyncHandler(async (req: Request, res: Response) => {
    const student = await studentService.activate(Number(req.params.id));
    return success(res, student, 'Student activated');
  }),

  deactivate: asyncHandler(async (req: Request, res: Response) => {
    const student = await studentService.deactivate(Number(req.params.id));
    return success(res, student, 'Student deactivated');
  }),

  graduate: asyncHandler(async (req: Request, res: Response) => {
    const { override = false, confirmation = false } = req.body || {};
    const student = await studentService.graduate(Number(req.params.id), !!override, !!confirmation);
    return success(res, student, 'Student marked as graduated');
  }),

  markAlumni: asyncHandler(async (req: Request, res: Response) => {
    const student = await studentService.markAlumni(Number(req.params.id));
    return success(res, student, 'Student marked as alumni');
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const student = await studentService.getById(req.user!.studentId!);
    return success(res, student, 'My profile');
  }),
};
