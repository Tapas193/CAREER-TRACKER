import { Request, Response } from 'express';
import { placementService } from '../services/placementService';
import { success, asyncHandler } from '../utils/http';

export const placementController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const params: any = { ...req.query };
    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'PLACEMENT_HEAD' && req.user!.studentId) {
      params.studentId = req.user!.studentId;
    }
    const data = await placementService.list(params);
    return success(res, data, 'Placements fetched');
  }),

  listDrives: asyncHandler(async (req: Request, res: Response) => {
    const drives = await placementService.listDrives();
    return success(res, drives, 'Placement drives fetched');
  }),

  eligibleStudents: asyncHandler(async (req: Request, res: Response) => {
    const students = await placementService.eligibleStudents();
    return success(res, students, 'Eligible students fetched');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const placement = await placementService.getById(Number(req.params.id), req.user!);
    return success(res, placement, 'Placement fetched');
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const placement = await placementService.create(req.validated, req.user!);
    return success(res, placement, 'Placement created', 201);
  }),

  createDrive: asyncHandler(async (req: Request, res: Response) => {
    const created = await placementService.createDrive(req.validated);
    return success(res, created, `Drive created for ${created.length} student(s)`, 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const placement = await placementService.update(Number(req.params.id), req.validated, req.user!);
    return success(res, placement, 'Placement updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await placementService.remove(Number(req.params.id), req.user!);
    return success(res, null, 'Placement deleted');
  }),

  // ===== Rounds =====

  createRound: asyncHandler(async (req: Request, res: Response) => {
    const round = await placementService.createRound(req.validated, req.user!);
    return success(res, round, 'Round created', 201);
  }),

  getRounds: asyncHandler(async (req: Request, res: Response) => {
    const rounds = await placementService.getRounds(Number(req.params.placementId), req.user!);
    return success(res, rounds, 'Rounds fetched');
  }),

  getRoundById: asyncHandler(async (req: Request, res: Response) => {
    const round = await placementService.getRoundById(Number(req.params.roundId), req.user!);
    return success(res, round, 'Round fetched');
  }),

  updateRound: asyncHandler(async (req: Request, res: Response) => {
    const round = await placementService.updateRound(Number(req.params.roundId), req.validated, req.user!);
    return success(res, round, 'Round updated');
  }),

  removeRound: asyncHandler(async (req: Request, res: Response) => {
    await placementService.removeRound(Number(req.params.roundId), req.user!);
    return success(res, null, 'Round deleted');
  }),

  // ===== Round Feedback =====

  createFeedback: asyncHandler(async (req: Request, res: Response) => {
    const fb = await placementService.createFeedback(req.validated, req.user!);
    return success(res, fb, 'Round feedback created', 201);
  }),

  updateFeedback: asyncHandler(async (req: Request, res: Response) => {
    const fb = await placementService.updateFeedback(Number(req.params.feedbackId), req.validated, req.user!);
    return success(res, fb, 'Round feedback updated');
  }),

  // ===== Offer Letter =====

  getOfferByPlacement: asyncHandler(async (req: Request, res: Response) => {
    const offer = await placementService.getOfferByPlacement(Number(req.params.placementId), req.user!);
    return success(res, offer, 'Offer letter fetched');
  }),

  getOfferById: asyncHandler(async (req: Request, res: Response) => {
    const offer = await placementService.getOfferById(Number(req.params.offerId), req.user!);
    return success(res, offer, 'Offer letter fetched');
  }),

  createOffer: asyncHandler(async (req: Request, res: Response) => {
    const offer = await placementService.createOffer(req.validated, req.user!);
    return success(res, offer, 'Offer letter created', 201);
  }),

  updateOffer: asyncHandler(async (req: Request, res: Response) => {
    const offer = await placementService.updateOffer(Number(req.params.offerId), req.validated, req.user!);
    return success(res, offer, 'Offer letter updated');
  }),
};
