import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  BellOff,
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCheck,
  FileCheck2,
  GraduationCap,
  ListChecks,
  Loader2,
  MessageSquare,
  ScrollText,
} from 'lucide-react';
import { Button } from '../ui';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '../../hooks/useNotifications';
import { useNotificationSound } from '../../hooks/useNotificationSound';
import { cn, timeAgo } from '../../utils/cn';
import type { AppNotification, NotificationType } from '../../types';

const TYPE_ICON: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  PLACEMENT_DRIVE: Briefcase,
  PLACEMENT_ROUND: CalendarDays,
  ROUND_FEEDBACK: MessageSquare,
  OFFER_LETTER: FileCheck2,
  PREPARATION_RESOURCE: BookOpen,
  ACADEMIC: ScrollText,
  BACKLOG: ListChecks,
  GRADUATION: GraduationCap,
  SYSTEM: Bell,
};

function NotificationIcon({ type, className }: { type: NotificationType; className?: string }) {
  const Icon = TYPE_ICON[type] ?? Bell;
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Icon className={cn('h-4 w-4', className)} />
    </span>
  );
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const { data: unreadData } = useUnreadNotificationCount();
  const unread = unreadData?.unreadCount;
  const { soundEnabled, toggleSound } = useNotificationSound(unread);

  const { data: recentData, isFetching } = useNotifications({ page: 1, pageSize: 8, enabled: open });
  const markAll = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const items = recentData?.items ?? [];

  return (
    <div ref={ref} className="relative inline-block">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-4 w-4" />
        {Boolean(unread) && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unread && unread > 99 ? '99+' : unread}
          </span>
        )}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-30 mt-1 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-border bg-card shadow-xl"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <Button
              variant="ghost"
              size="sm"
              disabled={!unread}
              onClick={() => markAll.mutate()}
              title="Mark all as read"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {isFetching && items.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-sm text-muted-foreground" role="status">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading…
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">You're all caught up.</div>
            ) : (
              items.map((n: AppNotification) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    if (!n.isRead) markRead.mutate(n.id);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-start gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-accent/40',
                    !n.isRead && 'bg-primary/[0.04]'
                  )}
                >
                  <NotificationIcon type={n.type} />
                  <div className="min-w-0 flex-1">
                    <p className={cn('truncate text-sm', n.isRead ? 'font-medium text-foreground' : 'font-semibold text-foreground')}>
                      {n.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{n.message}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground/70">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                </button>
              ))
            )}
            {items.length > 0 && (
              <Link
                to="/notifications"
                className="block border-t border-border bg-muted/30 px-4 py-2.5 text-center text-xs font-medium text-primary hover:bg-accent/40"
              >
                View all notifications
              </Link>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2">
            <button
              type="button"
              onClick={toggleSound}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {soundEnabled ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
              {soundEnabled ? 'Sound on' : 'Sound muted'}
            </button>
            <p className="text-[11px] text-muted-foreground/70">{unread ? `${unread} unread` : 'No unread'}</p>
          </div>
        </div>
      )}
    </div>
  );
}