import { useState } from 'react';
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
  MessageSquare,
  ScrollText,
  Trash2,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  Loading,
  PageHeader,
  Pagination,
  Tabs,
} from '../components/ui';
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../hooks/useNotifications';
import { useNotificationSound } from '../hooks/useNotificationSound';
import { cn, timeAgo } from '../utils/cn';
import type { NotificationType } from '../types';

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

const TYPE_LABEL: Record<NotificationType, string> = {
  PLACEMENT_DRIVE: 'Placement Drive',
  PLACEMENT_ROUND: 'Placement Round',
  ROUND_FEEDBACK: 'Round Feedback',
  OFFER_LETTER: 'Offer Letter',
  PREPARATION_RESOURCE: 'Preparation Resource',
  ACADEMIC: 'Academic',
  BACKLOG: 'Backlog',
  GRADUATION: 'Graduation',
  SYSTEM: 'System',
};

type Tab = 'all' | 'unread' | 'read';

export default function NotificationsPage() {
  const [tab, setTab] = useState<Tab>('all');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const isRead = tab === 'read' ? true : tab === 'unread' ? false : undefined;
  const { data, isLoading, isError, refetch } = useNotifications({ page, pageSize: 10, isRead });
  const markAll = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();
  const deleteNotif = useDeleteNotification();

  const { soundEnabled, toggleSound } = useNotificationSound(data?.unreadCount);

  const total = data?.total ?? 0;
  const unread = data?.unreadCount ?? 0;
  const items = data?.items ?? [];

  const confirmDelete = () => {
    if (deleteId != null) deleteNotif.mutate(deleteId);
    setDeleteId(null);
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Updates on placement drives, rounds, feedback, offers, academics, backlogs and graduation."
        action={
          <>
            <Button variant="outline" size="sm" onClick={toggleSound}>
              {soundEnabled ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
              {soundEnabled ? 'Sound on' : 'Sound muted'}
            </Button>
            <Button size="sm" disabled={!unread} onClick={() => markAll.mutate()}>
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader title="" />
        <Tabs
          active={tab}
          onChange={(key) => {
            setTab(key as Tab);
            setPage(1);
          }}
          tabs={[
            { key: 'all', label: 'All', count: total },
            { key: 'unread', label: 'Unread', count: unread },
            { key: 'read', label: 'Read', count: total - unread },
          ]}
        />
        <CardContent className="p-0">
          {isLoading ? (
            <Loading label="Loading notifications…" />
          ) : isError ? (
            <EmptyState
              title="Unable to load notifications"
              message="There was a problem fetching your notifications."
              action={<Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>}
            />
          ) : items.length === 0 ? (
            <EmptyState title="No notifications" message="You have no notifications in this view yet." />
          ) : (
            <ul className="divide-y divide-border">
              {items.map((n) => {
                const Icon = TYPE_ICON[n.type] ?? Bell;
                return (
                  <li
                    key={n.id}
                    className={cn('flex items-start gap-3 px-5 py-4 transition-colors hover:bg-accent/30', !n.isRead && 'bg-primary/[0.03]')}
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                        n.isRead ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <p className={cn('text-sm', n.isRead ? 'font-medium text-foreground' : 'font-semibold text-foreground')}>{n.title}</p>
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {TYPE_LABEL[n.type]}
                        </span>
                        {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />}
                      </div>
                      <p className="mt-0.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{n.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground/70">{timeAgo(n.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {!n.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markRead.mutate(n.id)}
                          title="Mark as read"
                          aria-label="Mark as read"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-red-600"
                        onClick={() => setDeleteId(n.id)}
                        title="Delete notification"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <Pagination page={page} pageSize={10} total={total} onPage={setPage} />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteId != null}
        destructive
        title="Delete notification?"
        message="This notification will be permanently removed. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleteNotif.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}