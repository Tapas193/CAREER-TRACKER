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
  user: {
    select: {
      id: true,
      firstName: true,
      middleName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      accountStatus: true,
      studentId: true,
      createdAt: true,
      updatedAt: true,
    },
  },
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
    const { search, status, courseId, sortBy = 'id', order = 'asc' } = params;
    // Query params arrive as strings from express; coerce them to safe integers so
    // Prisma's skip/take receive numbers (a raw string throws a PrismaClientValidationError -> 400).
    const pageNum = Math.max(1, Number.parseInt(String(params.page), 10) || 1);
    const pageSizeNum = Math.min(100, Math.max(1, Number.parseInt(String(params.pageSize), 10) || 50));
    const where: Prisma.StudentWhereInput = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { middleName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { enrollmentNo: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } },
        { admissionNo: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status) where.currentStatus = status as StudentStatus;
    if (courseId) where.courseId = Number(courseId);

    const allowedSort = [
      'id', 'firstName', 'lastName', 'enrollmentNo', 'rollNumber', 'admissionYear', 'currentSemester', 'currentStatus', 'admissionNo',
    ];
    const orderBy = allowedSort.includes(sortBy) ? { [sortBy]: order } : { id: 'asc' as Prisma.SortOrder };

    const skip = (pageNum - 1) * pageSizeNum;
    return Promise.all([
      prisma.student.findMany({ where, include: studentInclude, orderBy, skip, take: pageSizeNum }),
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
