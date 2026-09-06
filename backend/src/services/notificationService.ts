import { prisma } from '../config/prisma';
import { notificationRepo, NotificationCreateInput } from '../repositories/notificationRepo';
import { AppError } from '../utils/http';
import { AuthUser } from '../types';

export const notificationService = {
  async list(user: AuthUser, query: { page?: number; pageSize?: number; isRead?: boolean }) {
    const [{ items, total }, unreadCount] = await Promise.all([
      notificationRepo.findForUser({
        recipientId: user.userId,
        page: query.page,
        pageSize: query.pageSize,
        isRead: query.isRead,
      }),
      notificationRepo.countUnread(user.userId),
    ]);
    return { items, total, unreadCount };
  },

  async unreadCount(user: AuthUser) {
    const unreadCount = await notificationRepo.countUnread(user.userId);
    return { unreadCount };
  },

  async markRead(id: number, user: AuthUser) {
    if (!Number.isInteger(id)) throw new AppError('Invalid notification id', 400);
    const notification = await notificationRepo.markRead(id, user.userId);
    if (!notification) throw new AppError('Notification not found', 404);
    return notification;
  },

  async markAllRead(user: AuthUser) {
    return notificationRepo.markAllRead(user.userId);
  },

  async remove(id: number, user: AuthUser) {
    if (!Number.isInteger(id)) throw new AppError('Invalid notification id', 400);
    const deleted = await notificationRepo.deleteOne(id, user.userId);
    if (!deleted) throw new AppError('Notification not found', 404);
  },

  // ===== Internal (best-effort) dispatchers — NOT exposed via routes =====
  // Notifications are created only by trusted backend business events, never
  // through a public user API. Failures here are logged and must never break
  // the originating business operation.

  async activeStudentIds() {
    const users = await prisma.user.findMany({
      where: { accountStatus: 'ACTIVE', role: 'STUDENT' },
      select: { studentId: true },
    });
    return users.map((u) => u.studentId).filter((id): id is number => id != null);
  },

  async notifyStudents(studentIds: number[], input: NotificationCreateInput) {
    const unique = [...new Set(studentIds.filter((id): id is number => Number.isInteger(id)))];
    if (unique.length === 0) return;
    try {
      const users = await prisma.user.findMany({
        where: { studentId: { in: unique }, accountStatus: 'ACTIVE', role: 'STUDENT' },
        select: { id: true },
      });
      await notificationRepo.createManyForUsers(users.map((u) => u.id), input);
    } catch (err) {
      console.error('[notifications] dispatch failed:', err);
    }
  },

  async notifyStudent(studentId: number | null | undefined, input: NotificationCreateInput) {
    if (!studentId) return;
    return this.notifyStudents([studentId], input);
  },

  async notifyUser(userId: number, input: NotificationCreateInput) {
    if (!Number.isInteger(userId)) return;
    try {
      await notificationRepo.createForUser(userId, input);
    } catch (err) {
      console.error('[notifications] dispatch failed:', err);
    }
  },
};