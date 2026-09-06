import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { AppNotification, NotificationListResponse, UnreadCountResponse } from '../types';

/**
 * Notifications are owned by the authenticated user on the backend
 * (recipientId = req.user.userId) — the client never sends an owner id.
 */

export function useNotifications(params?: { page?: number; pageSize?: number; isRead?: boolean; enabled?: boolean }) {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const search = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (typeof params?.isRead === 'boolean') search.set('isRead', String(params.isRead));
  return useQuery<NotificationListResponse>({
    queryKey: ['notifications', 'list', { page, pageSize, isRead: params?.isRead }],
    queryFn: () => api.get<NotificationListResponse>(`/api/notifications?${search.toString()}`),
    enabled: params?.enabled ?? true,
  });
}

export function useUnreadNotificationCount() {
  return useQuery<UnreadCountResponse>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.get<UnreadCountResponse>('/api/notifications/unread-count'),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation<AppNotification, Error, number>({
    mutationFn: (id) => api.patch<AppNotification>(`/api/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation<{ updated: number }, Error, void>({
    mutationFn: () => api.patch<{ updated: number }>('/api/notifications/read-all'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation<null, Error, number>({
    mutationFn: (id) => api.delete<null>(`/api/notifications/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}