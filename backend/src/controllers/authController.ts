import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { success, asyncHandler } from '../utils/http';
import { config } from '../config';
import { studentRepo } from '../repositories/studentRepo';

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.validated;
    const { token, user } = await authService.login({ email, password });

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return success(res, { user }, 'Login successful');
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie('token', { httpOnly: true, secure: config.cookieSecure, sameSite: 'lax', path: '/' });
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
