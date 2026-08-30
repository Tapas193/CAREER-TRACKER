import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { failure } from '../utils/http';
import { AuthenticatedRequest } from '../types';

/** Restrict access to a set of roles. Must run after authenticate. */
export function requireRole(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return failure(res, 'Authentication required', 401);
    }
    if (!roles.includes(req.user.role)) {
      return failure(res, 'Forbidden: insufficient permissions', 403);
    }
    next();
  };
}
