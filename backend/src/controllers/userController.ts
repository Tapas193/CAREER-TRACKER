import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { success, asyncHandler } from '../utils/http';

export const userController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const data = await userService.list(req.query);
    return success(res, data, 'Users fetched');
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getById(Number(req.params.id));
    return success(res, user, 'User fetched');
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.create(req.validated);
    return success(res, user, 'User created', 201);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.update(Number(req.params.id), req.validated);
    return success(res, user, 'User updated');
  }),
};
