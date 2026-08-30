import { Response, NextFunction } from 'express';
import { Role, StudentStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { failure } from '../utils/http';
import { AuthenticatedRequest } from '../types';

/**
 * Decision 6 lock: once a student is GRADUATED/ALUMNI, they lose write access
 * to pre-graduation entities. ADMINS bypass this (they retain correction access).
 * Must run after authenticate. Only enforced for STUDENT/PLACEMENT_HEAD roles
 * acting on their own/pre-graduation data via the student-scoped write routes.
 */
export async function requireWritableStudent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return failure(res, 'Authentication required', 401);
  }
  if (req.user.role === Role.ADMIN) {
    return next();
  }
  if (req.user.studentId == null) {
    return failure(res, 'This account is not linked to a student profile', 403);
  }

  const student = await prisma.student.findUnique({
    where: { id: req.user.studentId },
    select: { currentStatus: true, accountStatus: true },
  });

  if (!student || student.accountStatus !== 'ACTIVE') {
    return failure(res, 'Student account is not active', 403);
  }

  if (student.currentStatus === StudentStatus.GRADUATED || student.currentStatus === StudentStatus.ALUMNI) {
    return failure(
      res,
      'Graduated students cannot modify pre-graduation records (academics, skills, certifications, projects, internships, placements). Contact an administrator for corrections.',
      403
    );
  }
  next();
}

export { Role };
