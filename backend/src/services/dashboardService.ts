import { prisma } from '../config/prisma';
import { PlacementStatus, StudentStatus, Role } from '@prisma/client';
import { AppError } from '../utils/http';
import { AuthUser } from '../types';

export const dashboardService = {
  async adminDashboard() {
    const [
      totalStudents,
      activeStudents,
      graduatedStudents,
      alumniCount,
      placements,
      internships,
      certifications,
      drives,
      departments,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { accountStatus: 'ACTIVE' } }),
      prisma.student.count({ where: { graduationStatus: 'GRADUATED' } }),
      prisma.student.count({ where: { currentStatus: StudentStatus.ALUMNI } }),
      prisma.placement.findMany({ select: { placementStatus: true, studentId: true } }),
      prisma.internship.count(),
      prisma.certification.count(),
      prisma.placement.findMany({ select: { placementDate: true } }),
      prisma.student.groupBy({
        by: ['courseId'],
        _count: { _all: true },
        where: { currentStatus: { notIn: [StudentStatus.ALUMNI] } },
      }),
    ]);

    const placedSet = new Set(
      placements
        .filter((p) => p.placementStatus === PlacementStatus.SELECTED || p.placementStatus === PlacementStatus.OFFER_RECEIVED)
        .map((p) => p.studentId)
    );
    const placementRate = totalStudents > 0 ? Math.round((placedSet.size / totalStudents) * 100) : 0;

    const byDepartment = await Promise.all(
      departments.map(async (d) => {
        const course = await prisma.course.findUnique({ where: { id: d.courseId } });
        return {
          courseId: d.courseId,
          department: course?.department || 'Unknown',
          courseName: course?.courseName || 'Unknown',
          studentCount: d._count._all,
        };
      })
    );

    return {
      totalStudents,
      activeStudents,
      graduatedStudents,
      alumniCount,
      placementRate,
      placedCount: placedSet.size,
      internshipCount: internships,
      certificationCount: certifications,
      activeDrives: drives.length,
      byDepartment,
    };
  },

  async studentDashboard(studentId: number) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        course: true,
        academicRecords: true,
        backlogs: true,
        skills: true,
        certifications: true,
        projects: true,
        internships: true,
        placements: { include: { rounds: true, offerLetter: true } },
      },
    });
    if (!student) throw new AppError('Student not found', 404);

    const latestAcademic = [...student.academicRecords].sort((a, b) => b.id - a.id)[0];
    const currentCgpa = latestAcademic ? Number(latestAcademic.cgpa) : null;
    const activeBacklogs = student.backlogs.filter((b) => !b.clearedDate).length;
    const offered = student.placements.filter((p) => p.offerLetter).length;
    const selected = student.placements.find((p) => p.placementStatus === PlacementStatus.SELECTED || p.placementStatus === PlacementStatus.OFFER_RECEIVED);

    const totalFields = 6; // academic, skills, certifications, projects, internships, personal profile
    let filledFields = 0;
    if (student.academicRecords.length > 0) filledFields++;
    if (student.skills.length > 0) filledFields++;
    if (student.certifications.length > 0) filledFields++;
    if (student.projects.length > 0) filledFields++;
    if (student.internships.length > 0) filledFields++;
    if (student.address || student.gender) filledFields++;
    const profileCompletion = Math.round((filledFields / totalFields) * 100);

    return {
      currentCgpa,
      currentSemester: student.currentSemester,
      activeBacklogs,
      skillCount: student.skills.length,
      certificationCount: student.certifications.length,
      projectCount: student.projects.length,
      internshipCount: student.internships.length,
      placementStatus: selected?.placementStatus || (student.placements.length ? 'IN_PROGRESS' : 'NONE'),
      offerCount: offered,
      profileCompletion,
      currentStatus: student.currentStatus,
    };
  },

  async placementHeadDashboard() {
    const [totalStudents, activeStudents, onPlacement] = await Promise.all([
      prisma.student.count({ where: { currentStatus: { notIn: [StudentStatus.ALUMNI] } } }),
      prisma.student.count({ where: { accountStatus: 'ACTIVE', currentStatus: { notIn: [StudentStatus.GRADUATED, StudentStatus.ALUMNI] } } }),
      prisma.student.count({ where: { currentStatus: StudentStatus.ON_PLACEMENT } }),
    ]);

    const placements = await prisma.placement.findMany({
      include: { offerLetter: true },
    });

    const placed = placements.filter((p) => p.placementStatus === PlacementStatus.SELECTED || p.placementStatus === PlacementStatus.OFFER_RECEIVED);
    const packages = placed
      .map((p) => (p.offerLetter ? Number(p.offerLetter.packageLpa) : Number(p.packageLpa)))
      .filter((n) => !isNaN(n));
    const avgPackage = packages.length ? Number((packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(2)) : 0;
    const highestPackage = packages.length ? Math.max(...packages) : 0;

    const byStatus = {
      APPLIED: placements.filter((p) => p.placementStatus === PlacementStatus.APPLIED).length,
      IN_PROGRESS: placements.filter((p) => p.placementStatus === PlacementStatus.IN_PROGRESS).length,
      SELECTED: placements.filter((p) => p.placementStatus === PlacementStatus.SELECTED).length,
      REJECTED: placements.filter((p) => p.placementStatus === PlacementStatus.REJECTED).length,
      OFFER_RECEIVED: placements.filter((p) => p.placementStatus === PlacementStatus.OFFER_RECEIVED).length,
    };

    const placementRate = activeStudents > 0 ? Math.round((placed.length / activeStudents) * 100) : 0;

    // active drives grouped by company/date/role
    const activeDrives = await prisma.placement.groupBy({
      by: ['companyName', 'jobRole', 'placementDate'],
      _count: { _all: true },
    });

    return {
      eligibleCount: activeStudents,
      participatingCount: placements.length,
      placedCount: placed.length,
      onPlacementCount: onPlacement,
      placementRate,
      avgPackage,
      highestPackage,
      byStatus,
      totalStudents,
      activeDrives: activeDrives.map((d) => ({
        companyName: d.companyName,
        jobRole: d.jobRole,
        placementDate: d.placementDate,
        count: d._count._all,
      })),
    };
  },

  async alumniDashboard(studentId: number) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        course: true,
        internships: true,
        careerHistory: { orderBy: { startDate: 'asc' } },
        placements: { include: { offerLetter: true, rounds: true } },
      },
    });
    if (!student) throw new AppError('Student not found', 404);

    const timeline = [
      { type: 'ADMISSION', title: `Admitted to ${student.course?.courseName || ''}`, date: student.admissionYear, currentJob: false },
      ...student.internships.map((i) => ({
        type: 'INTERNSHIP',
        title: `${i.role} at ${i.companyName}`,
        date: i.startDate.getFullYear(),
        currentJob: false,
      })),
      { type: 'GRADUATION', title: 'Graduated', date: student.expectedYear, currentJob: false },
      ...student.careerHistory.map((c) => ({
        type: 'CAREER',
        title: `${c.jobTitle} at ${c.companyName}`,
        date: c.startDate.getFullYear(),
        currentJob: c.currentJob,
      })),
    ].sort((a, b) => Number(a.date) - Number(b.date));

    return {
      currentStatus: student.currentStatus,
      admissionYear: student.admissionYear,
      expectedYear: student.expectedYear,
      course: student.course,
      internshipCount: student.internships.length,
      careerHistoryCount: student.careerHistory.length,
      placementCount: student.placements.length,
      currentJob: student.careerHistory.find((c) => c.currentJob) || null,
      timeline,
    };
  },

  async get(user: AuthUser) {
    if (user.role === Role.ADMIN) return this.adminDashboard();
    if (user.role === Role.PLACEMENT_HEAD) return this.placementHeadDashboard();
    if (user.studentId == null) throw new AppError('No student profile linked', 404);
    // STUDENT: if alumni status show alumni dashboard, else student dashboard
    const s = await prisma.student.findUnique({ where: { id: user.studentId }, select: { currentStatus: true } });
    if (s?.currentStatus === StudentStatus.ALUMNI) return this.alumniDashboard(user.studentId);
    return this.studentDashboard(user.studentId);
  },
};
