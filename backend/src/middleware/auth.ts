import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { failure } from '../utils/http';
import { AuthenticatedRequest } from '../types';

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined);

  if (!token) {
    return failure(res, 'Authentication required', 401);
  }

  const user = verifyToken(token);
  if (!user) {
    return failure(res, 'Invalid or expired token', 401);
  }

  req.user = user;
  next();
}
