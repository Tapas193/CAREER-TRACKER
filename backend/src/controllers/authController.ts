import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { success, asyncHandler } from '../utils/http';
import { studentRepo } from '../repositories/studentRepo';
import { authCookieOptions } from '../utils/cookies';

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.validated;
    const { token, user } = await authService.login({ email, password });

    res.cookie('token', token, authCookieOptions());

    return success(res, { user }, 'Login successful');
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie('token', authCookieOptions());
    return success(res, null, 'Logged out');
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const authUser: any = req.user ? { ...req.user } : null;

    if (authUser && authUser.role === 'STUDENT' && authUser.studentId != null) {
      const st = await studentRepo.getLifecycleStatus(authUser.studentId);
      authUser.currentStatus = st?.currentStatus ?? null;
      authUser.graduationStatus = st?.graduationStatus ?? null;
    }

    return success(res, authUser, 'Current user');
  }),
};
