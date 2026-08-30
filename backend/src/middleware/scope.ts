import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { failure } from '../utils/http';
import { AuthenticatedRequest } from '../types';

/**
 * Ensures the authenticated user is either ADMIN or owns the student scope
 * given by the :id param. Must run after authenticate.
 */
export function ensureStudentScope(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return failure(res, 'Authentication required', 401);
  }
  const targetId = parseInt(req.params.id, 10);

  if (req.user.role === Role.ADMIN) {
    return next();
  }

  if (req.user.studentId === null || req.user.studentId !== targetId) {
    return failure(res, 'Forbidden: you can only access your own data', 403);
  }
  next();
}
