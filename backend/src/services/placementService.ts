import { prisma } from '../config/prisma';
import { AppError } from '../utils/http';
import { PlacementStatus, Role, StudentStatus, NotificationType } from '@prisma/client';
import { AuthUser } from '../types';
import { notificationService } from './notificationService';

const placementInclude = {
  student: true,
  rounds: { include: { feedback: true }, orderBy: { roundNumber: 'asc' } },
  offerLetter: true,
} as const;

/**
 * Authorization helper: a PLACEMENT_HEAD/ADMIN can access any placement; a STUDENT
 * can only access placements that belong to them. Round_feedback and Offer_letter
 * writes are PLACEMENT_HEAD/ADMIN only (Section 9 / 3.3).
 */
function assertCanAccess(user: AuthUser, studentId: number | null) {
  if (user.role === Role.ADMIN || user.role === Role.PLACEMENT_HEAD) return;
  if (user.studentId === null || studentId === null || user.studentId !== studentId) {
    throw new AppError('Forbidden: you can only access your own placement records', 403);
  }
}

export const placementService = {
  async list(params: { studentId?: number; status?: string; companyName?: string; drive?: string; page?: number; pageSize?: number }) {
    const where: any = {};
    if (params.studentId) where.studentId = Number(params.studentId);
    if (params.status) where.placementStatus = params.status;
    if (params.companyName) where.companyName = { contains: params.companyName, mode: 'insensitive' };
    const page = params.page || 1;
    const pageSize = params.pageSize || 50;
    const [items, total] = await Promise.all([
      prisma.placement.findMany({
        where,
        include: placementInclude,
        orderBy: [{ placementDate: 'desc' }, { companyName: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.placement.count({ where }),
    ]);
    return { items, total };
  },

  async listDrives() {
    // Group by (companyName, placementDate, jobRole) — Decision 2
    const items = await prisma.placement.findMany({ where: {}, include: placementInclude });
    const map = new Map<string, any>();
    for (const p of items) {
      const key = `${p.companyName}::${p.placementDate.toISOString()}::${p.jobRole}`;
      if (!map.has(key)) {
        map.set(key, {
          companyName: p.companyName,
          jobRole: p.jobRole,
          placementDate: p.placementDate,
          packageLpa: p.packageLpa,
          location: p.location,
          participants: [],
        });
      }
      map.get(key).participants.push(p);
    }
    return Array.from(map.values())
      .sort((a, b) => new Date(b.placementDate).getTime() - new Date(a.placementDate).getTime())
      .map((d) => ({ ...d, participantCount: d.participants.length }));
  },

  async getById(id: number, user: AuthUser) {
    const placement = await prisma.placement.findUnique({ where: { id }, include: placementInclude });
    if (!placement) throw new AppError('Placement not found', 404);
    assertCanAccess(user, placement.studentId);
    return placement;
  },

  async create(data: any, user: AuthUser) {
    assertCanAccess(user, data.studentId);
    return prisma.placement.create({ data, include: placementInclude });
  },

  // Decision 2: create one Placement row per eligible student for a drive
  async createDrive(data: any) {
    const { studentIds, ...driveFields } = data;
    const created = await prisma.$transaction(
      studentIds.map((sid: number) =>
        prisma.placement.create({
          data: { ...driveFields, studentId: sid, placementStatus: PlacementStatus.APPLIED },
        })
      )
    );

    // A drive for eligible students is a meaningful event -> notify each participant.
    await notificationService.notifyStudents(studentIds, {
      type: NotificationType.PLACEMENT_DRIVE,
      title: 'New placement drive',
      message: `${driveFields.companyName} has opened a new placement opportunity for ${driveFields.jobRole}.`,
      relatedType: 'PlacementDrive',
    });

    return created;
  },

  async update(id: number, data: any, user: AuthUser) {
    const existing = await this.getById(id, user);
    assertCanAccess(user, existing.studentId);
    return prisma.placement.update({ where: { id }, data, include: placementInclude });
  },

  async remove(id: number, user: AuthUser) {
    const existing = await this.getById(id, user);
    assertCanAccess(user, existing.studentId);
    await prisma.placement.delete({ where: { id } });
  },

  async eligibleStudents() {
    // Students eligible to be placed: not graduated/alumni, active account
    const students = await prisma.student.findMany({
      where: {
        accountStatus: 'ACTIVE',
        currentStatus: { notIn: [StudentStatus.GRADUATED, StudentStatus.ALUMNI] },
      },
      include: { course: true },
      orderBy: { firstName: 'asc' },
    });
    return students;
  },

  // ===== Rounds =====

  async createRound(data: any, user: AuthUser) {
    const placement = await this.getById(data.placementId, user);
    assertCanAccess(user, placement.studentId);
    if (user.role !== Role.PLACEMENT_HEAD && user.role !== Role.ADMIN) {
      throw new AppError('Only a Placement Head or Admin can create placement rounds', 403);
    }
    const round = await prisma.placementRound.create({ data, include: { feedback: true } });

    await notificationService.notifyStudent(placement.studentId, {
      type: NotificationType.PLACEMENT_ROUND,
      title: `New ${placement.companyName} round scheduled`,
      message: `Round ${round.roundNumber} (${round.roundType}) for ${placement.companyName} is scheduled on ${round.roundDate.toISOString().split('T')[0]}.`,
      relatedId: round.id,
      relatedType: 'PlacementRound',
    });

    return round;
  },

  async getRounds(placementId: number, user: AuthUser) {
    const placement = await this.getById(placementId, user);
    assertCanAccess(user, placement.studentId);
    return prisma.placementRound.findMany({
      where: { placementId },
      include: { feedback: true },
      orderBy: { roundNumber: 'asc' },
    });
  },

  async getRoundById(id: number, user: AuthUser) {
    const round = await prisma.placementRound.findUnique({
      where: { id },
      include: { placement: true, feedback: true },
    });
    if (!round) throw new AppError('Placement round not found', 404);
    assertCanAccess(user, round.placement.studentId);
    return round;
  },

  async updateRound(id: number, data: any, user: AuthUser) {
    const round = await this.getRoundById(id, user);
    assertCanAccess(user, round.placement.studentId);
    if (user.role !== Role.PLACEMENT_HEAD && user.role !== Role.ADMIN) {
      throw new AppError('Only a Placement Head or Admin can update rounds', 403);
    }
    return prisma.placementRound.update({ where: { id }, data, include: { feedback: true } });
  },

  async removeRound(id: number, user: AuthUser) {
    const round = await this.getRoundById(id, user);
    assertCanAccess(user, round.placement.studentId);
    if (user.role !== Role.PLACEMENT_HEAD && user.role !== Role.ADMIN) {
      throw new AppError('Only a Placement Head or Admin can delete rounds', 403);
    }
    await prisma.placementRound.delete({ where: { id } });
  },

  // ===== Round Feedback (Placement Head writes, Decision 3.3) =====

  async createFeedback(data: any, user: AuthUser) {
    if (user.role !== Role.PLACEMENT_HEAD && user.role !== Role.ADMIN) {
      throw new AppError('Only a Placement Head or Admin can write round feedback', 403);
    }
    const round = await prisma.placementRound.findUnique({ where: { id: data.placementRoundId }, include: { placement: true } });
    if (!round) throw new AppError('Placement round not found', 404);
    assertCanAccess(user, round.placement.studentId);
    const existing = await prisma.roundFeedback.findUnique({ where: { placementRoundId: data.placementRoundId } });
    if (existing) throw new AppError('Feedback already exists for this round', 409);
    const feedback = await prisma.roundFeedback.create({ data });

    await notificationService.notifyStudent(round.placement.studentId, {
      type: NotificationType.ROUND_FEEDBACK,
      title: `Feedback available for ${round.placement.companyName}`,
      message: `Feedback for round ${round.roundNumber} (${round.roundType}) at ${round.placement.companyName} has been published.`,
      relatedId: feedback.id,
      relatedType: 'RoundFeedback',
    });

    return feedback;
  },

  async updateFeedback(id: number, data: any, user: AuthUser) {
    if (user.role !== Role.PLACEMENT_HEAD && user.role !== Role.ADMIN) {
      throw new AppError('Only a Placement Head or Admin can update round feedback', 403);
    }
    const fb = await prisma.roundFeedback.findUnique({ where: { id }, include: { placementRound: { include: { placement: true } } } });
    if (!fb) throw new AppError('Round feedback not found', 404);
    assertCanAccess(user, fb.placementRound.placement.studentId);
    return prisma.roundFeedback.update({ where: { id }, data });
  },

  // ===== Offer Letter =====

  async getOfferByPlacement(placementId: number, user: AuthUser) {
    const placement = await this.getById(placementId, user);
    assertCanAccess(user, placement.studentId);
    return prisma.offerLetter.findUnique({ where: { placementId } });
  },

  async getOfferById(id: number, user: AuthUser) {
    const offer = await prisma.offerLetter.findUnique({ where: { id }, include: { placement: true } });
    if (!offer) throw new AppError('Offer letter not found', 404);
    assertCanAccess(user, offer.placement.studentId);
    return offer;
  },

  async createOffer(data: any, user: AuthUser) {
    if (user.role !== Role.PLACEMENT_HEAD && user.role !== Role.ADMIN) {
      throw new AppError('Only a Placement Head or Admin can upload offer letters', 403);
    }
    const placement = await this.getById(data.placementId, user);
    assertCanAccess(user, placement.studentId);
    const existing = await prisma.offerLetter.findUnique({ where: { placementId: data.placementId } });
    if (existing) throw new AppError('This placement already has an offer letter', 409);
    const offer = await prisma.offerLetter.create({ data });

    await notificationService.notifyStudent(placement.studentId, {
      type: NotificationType.OFFER_LETTER,
      title: `Offer letter received from ${placement.companyName}`,
      message: `Your offer letter for ${placement.jobRole} at ${placement.companyName} has been uploaded.`,
      relatedId: offer.id,
      relatedType: 'OfferLetter',
    });

    return offer;
  },

  async updateOffer(id: number, data: any, user: AuthUser) {
    if (user.role !== Role.PLACEMENT_HEAD && user.role !== Role.ADMIN) {
      throw new AppError('Only a Placement Head or Admin can update offer letters', 403);
    }
    const offer = await this.getOfferById(id, user);
    assertCanAccess(user, offer.placement.studentId);
    return prisma.offerLetter.update({ where: { id }, data });
  },
};
