import { studentSkillRepo } from '../repositories/studentSkillRepo';
import { AppError } from '../utils/http';

export const studentSkillService = {
  async list(params: { studentId?: number; page?: number; pageSize?: number }) {
    const [items, total] = await studentSkillRepo.findAll(params);
    return { items, total };
  },

  async assign(studentId: number, skillId: number) {
    const existing = await studentSkillRepo.findById(studentId, skillId);
    if (existing) throw new AppError('Skill already assigned to this student', 409);
    return studentSkillRepo.create({ student: { connect: { id: studentId } }, skill: { connect: { id: skillId } } });
  },

  async unassign(studentId: number, skillId: number, ownerStudentId?: number) {
    const existing = await studentSkillRepo.findById(studentId, skillId);
    if (!existing) throw new AppError('Student skill not found', 404);
    if (ownerStudentId && existing.studentId !== ownerStudentId) {
      throw new AppError('Forbidden: you can only access your own data', 403);
    }
    return studentSkillRepo.delete(studentId, skillId);
  },
};
