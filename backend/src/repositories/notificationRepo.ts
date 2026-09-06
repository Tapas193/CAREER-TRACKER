import { prisma } from '../config/prisma';
import { Prisma, NotificationType } from '@prisma/client';

export interface NotificationCreateInput {
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: number | null;
  relatedType?: string | null;
}

export interface NotificationListParams {
  recipientId: number;
  page?: number;
  pageSize?: number;
  isRead?: boolean;
}

export const notificationRepo = {
  async findForUser(params: NotificationListParams) {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(50, Math.max(1, params.pageSize || 20));
    const where: Prisma.NotificationWhereInput = { recipientId: params.recipientId };
    if (params.isRead !== undefined) where.isRead = params.isRead;
    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notification.count({ where }),
    ]);
    return { items, total, unreadCount: 0 };
  },

  countUnread(recipientId: number) {
    return prisma.notification.count({ where: { recipientId, isRead: false } });
  },

  async markRead(id: number, recipientId: number) {
    const updated = await prisma.notification.updateMany({
      where: { id, recipientId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    if (updated.count === 0) return null;
    return prisma.notification.findUnique({ where: { id } });
  },

  async markAllRead(recipientId: number) {
    const updated = await prisma.notification.updateMany({
      where: { recipientId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { updated: updated.count };
  },

  async deleteOne(id: number, recipientId: number) {
    const deleted = await prisma.notification.deleteMany({ where: { id, recipientId } });
    return deleted.count > 0;
  },

  createForUser(recipientId: number, data: NotificationCreateInput) {
    const base: Prisma.NotificationCreateManyInput = {
      recipientId,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedId: data.relatedId ?? null,
      relatedType: data.relatedType ?? null,
    };
    return prisma.notification.create({ data: base });
  },

  createManyForUsers(recipientIds: number[], data: NotificationCreateInput) {
    if (recipientIds.length === 0) return Promise.resolve({ count: 0 });
    const rows: Prisma.NotificationCreateManyInput[] = recipientIds.map((recipientId) => ({
      recipientId,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedId: data.relatedId ?? null,
      relatedType: data.relatedType ?? null,
    }));
    return prisma.notification.createMany({ data: rows });
  },
};