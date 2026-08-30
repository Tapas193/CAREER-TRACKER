import { prisma } from '../config/prisma';
import { StudentStatus, GraduationStatus, Prisma } from '@prisma/client';

const studentInclude = {
  course: true,
  academicRecords: { orderBy: [{ semester: 'asc' }] },
  backlogs: { orderBy: [{ semester: 'asc' }] },
  skills: { include: { skill: true } },
  certifications: { orderBy: [{ issuingDate: 'desc' }] },
  projects: { orderBy: [{ startDate: 'desc' }] },
  internships: { orderBy: [{ startDate: 'desc' }] },
  placements: { include: { rounds: { include: { feedback: true } }, offerLetter: true } },
  careerHistory: { orderBy: [{ startDate: 'desc' }] },
  alumniFeedback: { orderBy: [{ feedbackDate: 'desc' }] },
  user: true,
} satisfies Prisma.StudentInclude;

export interface CreateStudentData {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  dateOfBirth?: Date | null;
  gender?: string | null;
  enrollmentNo: string;
  rollNumber: string;
  admissionNo: string;
  admissionYear: number;
  expectedYear: number;
  currentSemester: number;
  currentStatus?: StudentStatus;
  graduationStatus?: GraduationStatus;
  accountStatus?: any;
  address?: string | null;
  courseId: number;
}

export const studentRepo = {
  findAll(params: { search?: string; status?: string; courseId?: number; page?: number; pageSize?: number; sortBy?: string; order?: 'asc' | 'desc' }) {
    const { search, status, courseId, page = 1, pageSize = 50, sortBy = 'id', order = 'asc' } = params;
    const where: Prisma.StudentWhereInput = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { enrollmentNo: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } },
        { admissionNo: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.currentStatus = status as StudentStatus;
    if (courseId) where.courseId = Number(courseId);

    const allowedSort = [
      'id', 'firstName', 'lastName', 'enrollmentNo', 'rollNumber', 'admissionYear', 'currentSemester', 'currentStatus', 'admissionNo',
    ];
    const orderBy = allowedSort.includes(sortBy) ? { [sortBy]: order } : { id: 'asc' as Prisma.SortOrder };

    const skip = (page - 1) * pageSize;
    return Promise.all([
      prisma.student.findMany({ where, include: studentInclude, orderBy, skip, take: pageSize }),
      prisma.student.count({ where }),
    ]);
  },

  findById(id: number) {
    return prisma.student.findUnique({ where: { id }, include: studentInclude });
  },

  getLifecycleStatus(id: number) {
    return prisma.student.findUnique({
      where: { id },
      select: { currentStatus: true, graduationStatus: true },
    });
  },

  findByUserId(userId: number) {
    return prisma.user.findUnique({ where: { id: userId }, include: { student: { include: studentInclude } } });
  },

  create(data: CreateStudentData, tx = prisma) {
    return tx.student.create({ data: { ...data } as any, include: studentInclude });
  },

  update(id: number, data: any) {
    return prisma.student.update({ where: { id }, data, include: studentInclude });
  },

  async setStatus(id: number, currentStatus: StudentStatus) {
    return prisma.student.update({ where: { id }, data: { currentStatus } });
  },

  async isGraduated(id: number) {
    const s = await prisma.student.findUnique({ where: { id }, select: { currentStatus: true } });
    return s?.currentStatus === StudentStatus.ALUMNI || s?.currentStatus === StudentStatus.GRADUATED;
  },

  async activate(id: number) {
    return prisma.student.update({ where: { id }, data: { accountStatus: 'ACTIVE' } });
  },

  async deactivate(id: number) {
    return prisma.student.update({ where: { id }, data: { accountStatus: 'INACTIVE' } });
  },

  async count() {
    return prisma.student.count();
  },
};
