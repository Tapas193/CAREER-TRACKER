import { Request, Response } from 'express';
import { notificationService } from '../services/notificationService';
import { success, asyncHandler } from '../utils/http';

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.validated || {};
    const data = await notificationService.list(req.user!, query);
    return success(res, data, 'Notifications fetched');
  }),

  unreadCount: asyncHandler(async (req: Request, res: Response) => {
    const data = await notificationService.unreadCount(req.user!);
    return success(res, data, 'Unread count fetched');
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.markRead(Number(req.params.id), req.user!);
    return success(res, notification, 'Notification marked as read');
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    const data = await notificationService.markAllRead(req.user!);
    return success(res, data, 'All notifications marked as read');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await notificationService.remove(Number(req.params.id), req.user!);
    return success(res, null, 'Notification deleted');
  }),
};