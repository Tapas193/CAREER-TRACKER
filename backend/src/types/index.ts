import { Request } from 'express';
import { Role, StudentStatus, GraduationStatus } from '@prisma/client';

export interface AuthUser {
  userId: number;
  email: string;
  role: Role;
  studentId: number | null;
  currentStatus?: StudentStatus | null;
  graduationStatus?: GraduationStatus | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// Extend Express Request to carry authenticated user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
      validated?: any;
    }
  }
}
