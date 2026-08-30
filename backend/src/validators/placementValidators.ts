import { z } from 'zod';
import { dateString, money, rating } from './common';
import { PlacementStatus, RoundType, RoundResult } from '@prisma/client';

// ===== Placement =====

export const createPlacementSchema = z.object({
  companyName: z.string().min(1).max(150),
  jobRole: z.string().min(1).max(100),
  placementDate: dateString,
  packageLpa: money,
  placementStatus: z.nativeEnum(PlacementStatus).default(PlacementStatus.APPLIED),
  location: z.string().max(100).nullable().optional(),
  studentId: z.coerce.number().int().positive(),
});

export const updatePlacementSchema = z.object({
  companyName: z.string().min(1).max(150).optional(),
  jobRole: z.string().min(1).max(100).optional(),
  placementDate: dateString.optional(),
  packageLpa: money.optional(),
  placementStatus: z.nativeEnum(PlacementStatus).optional(),
  location: z.string().max(100).nullable().optional(),
  studentId: z.coerce.number().int().positive().optional(),
});

// Placement Head creates placements for MULTIPLE students in one drive (Decision 2)
export const createDrivePlacementsSchema = z.object({
  companyName: z.string().min(1).max(150),
  jobRole: z.string().min(1).max(100),
  placementDate: dateString,
  packageLpa: money,
  location: z.string().max(100).nullable().optional(),
  studentIds: z.array(z.coerce.number().int().positive()).min(1),
});

export type CreatePlacementInput = z.infer<typeof createPlacementSchema>;
export type UpdatePlacementInput = z.infer<typeof updatePlacementSchema>;
export type CreateDrivePlacementsInput = z.infer<typeof createDrivePlacementsSchema>;

// ===== Placement Round =====

export const createPlacementRoundSchema = z.object({
  placementId: z.coerce.number().int().positive(),
  roundNumber: z.coerce.number().int().min(1),
  roundType: z.nativeEnum(RoundType),
  roundDate: dateString,
  result: z.nativeEnum(RoundResult).default(RoundResult.PENDING),
  remark: z.string().nullable().optional(),
});

export const updatePlacementRoundSchema = z.object({
  roundNumber: z.coerce.number().int().min(1).optional(),
  roundType: z.nativeEnum(RoundType).optional(),
  roundDate: dateString.optional(),
  result: z.nativeEnum(RoundResult).optional(),
  remark: z.string().nullable().optional(),
  studentComment: z.string().nullable().optional(),
});

// ===== Round Feedback (Placement Head writes) =====

export const createRoundFeedbackSchema = z.object({
  placementRoundId: z.coerce.number().int().positive(),
  rating,
  feedbackDate: dateString,
  comments: z.string().nullable().optional(),
});

export const updateRoundFeedbackSchema = z.object({
  rating: rating.optional(),
  feedbackDate: dateString.optional(),
  comments: z.string().nullable().optional(),
});

// ===== Offer Letter =====

export const createOfferLetterSchema = z.object({
  placementId: z.coerce.number().int().positive(),
  companyName: z.string().min(1).max(150),
  packageLpa: money,
  offerDate: dateString,
  joiningDate: dateString.nullable().optional(),
  designation: z.string().max(100).nullable().optional(),
  location: z.string().max(45).nullable().optional(),
  documentUrl: z.string().max(500).nullable().optional(),
});

export const updateOfferLetterSchema = z.object({
  companyName: z.string().min(1).max(150).optional(),
  packageLpa: money.optional(),
  offerDate: dateString.optional(),
  joiningDate: dateString.nullable().optional(),
  designation: z.string().max(100).nullable().optional(),
  location: z.string().max(45).nullable().optional(),
  documentUrl: z.string().max(500).nullable().optional(),
});
