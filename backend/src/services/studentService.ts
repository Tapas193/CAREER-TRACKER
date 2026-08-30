import { prisma } from '../config/prisma';
import { studentRepo, CreateStudentData } from '../repositories/studentRepo';
import { hashPassword } from '../utils/password';
import { AppError } from '../utils/http';
import { StudentStatus, GraduationStatus, Role } from '@prisma/client';

export interface CreateStudentWithAccount extends CreateStudentData {
  createAccount?: boolean;
  email?: string;
  phone?: string;
  password?: string;
}

export const studentService = {
  async list(params: any) {
    const [items, total] = await studentRepo.findAll(params);
    return { items, total };
  },

  async getById(id: number) {
    const student = await studentRepo.findById(id);
    if (!student) throw new AppError('Student not found', 404);
    return student;
  },

  async create(data: CreateStudentWithAccount) {
    // Check uniqueness explicitly for helpful errors
    const { createAccount, email, phone, password, ...studentData } = data;

    return prisma.$transaction(async (tx) => {
      const student = await tx.student.create({ data: studentData as any });

      if (createAccount) {
        if (!email || !password) {
          throw new AppError('email and password are required when createAccount is true');
        }
        const existing = await tx.user.findUnique({ where: { email } });
        if (existing) throw new AppError('A user with this email already exists', 409);
        const passwordHash = await hashPassword(password);
        await tx.user.create({
          data: {
            firstName: studentData.firstName,
            middleName: studentData.middleName ?? null,
            lastName: studentData.lastName,
            email,
            phone: phone ?? null,
            passwordHash,
            role: Role.STUDENT,
            studentId: student.id,
          },
        });
      }
      return student;
    });
  },

  async update(id: number, data: any) {
    await this.ensureExists(id);
    return studentRepo.update(id, data);
  },

  async graduate(id: number, overridesFromAdmin: boolean, confirmation: boolean) {
    const student = await studentRepo.findById(id);
    if (!student) throw new AppError('Student not found', 404);

    // Decision 5: block if unresolved backlogs or incomplete academic record
    const { unresolvedBacklogs, hasAcademicRecord } = await this.graduationReadiness(id);
    if (unresolvedBacklogs && !(overridesFromAdmin && confirmation)) {
      throw new AppError(
        `Cannot graduate: ${unresolvedBacklogs} unresolved backlog(s). Admin override with confirmation is required.`,
        400
      );
    }
    if (!hasAcademicRecord && !(overridesFromAdmin && confirmation)) {
      throw new AppError(
        'Cannot graduate: no academic record found for the expected passing year. Admin override with confirmation is required.',
        400
      );
    }

    // Decision 5: graduation trigger sets GRADUATED, admin can further set ALUMNI
    await studentRepo.update(id, {
      currentStatus: StudentStatus.GRADUATED,
      graduationStatus: GraduationStatus.GRADUATED,
    });
    return this.getById(id);
  },

  async markAlumni(id: number) {
    await this.ensureExists(id);
    return studentRepo.update(id, {
      currentStatus: StudentStatus.ALUMNI,
      graduationStatus: GraduationStatus.GRADUATED,
    });
  },

  async activate(id: number) {
    await this.ensureExists(id);
    return studentRepo.activate(id);
  },

  async deactivate(id: number) {
    await this.ensureExists(id);
    return studentRepo.deactivate(id);
  },

  async graduationReadiness(id: number) {
    const student = await studentRepo.findById(id);
    if (!student) throw new AppError('Student not found', 404);
    const unresolvedBacklogs = student.backlogs.filter((b: any) => !b.clearedDate).length;
    const hasAcademicRecord = student.academicRecords.length > 0;
    return { unresolvedBacklogs, hasAcademicRecord };
  },

  async ensureExists(id: number) {
    const s = await studentRepo.findById(id);
    if (!s) throw new AppError('Student not found', 404);
    return s;
  },
};
