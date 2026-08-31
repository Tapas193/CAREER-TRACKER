import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardContent, Loading, EmptyState, Badge } from '../../components/ui';
import { Bell, GraduationCap, Briefcase, Building2, Award, CalendarClock } from 'lucide-react';
import { asArray, formatDate } from '../../utils/cn';

const CATEGORY_TONE: Record<string, 'blue' | 'green' | 'amber' | 'purple' | 'slate'> = {
  Academic: 'blue',
  Placement: 'green',
  Internship: 'amber',
  Certification: 'purple',
  System: 'slate',
};

export default function StudentNotifications() {
  const { data: me, isLoading } = useApi<any>(['student-me'], '/api/students/me');

  if (isLoading || !me) return <Loading label="Loading notifications…" />;

  const notifications: { id: string; category: string; title: string; time: string; icon: typeof Bell }[] = [];

  for (const c of asArray<any>(me.certifications)) {
    if (c.issuingDate) notifications.push({ id: `c-${c.id}`, category: 'Certification', title: `You earned "${c.certificationName}" from ${c.issuingOrganisation}`, time: c.issuingDate, icon: Award });
  }
  for (const p of asArray<any>(me.placements)) {
    const d = p.placementDate;
    notifications.push({ id: `p-${p.id}`, category: 'Placement', title: `Your application for ${p.jobRole} at ${p.companyName} is ${(p.placementStatus ?? 'PENDING').toLowerCase().replace('_', ' ')}`, time: d, icon: Briefcase });
  }
  for (const i of asArray<any>(me.internships)) {
    if (i.startDate) notifications.push({ id: `i-${i.id}`, category: 'Internship', title: `An internship was added at ${i.companyName} as ${i.role}`, time: i.startDate, icon: Building2 });
  }
  for (const ch of asArray<any>(me.careerHistory)) {
    if (ch.startDate) notifications.push({ id: `ch-${ch.id}`, category: 'Internship', title: `Career history entry added: ${ch.jobTitle} at ${ch.companyName}`, time: ch.startDate, icon: Building2 });
  }
  for (const r of asArray<any>(me.academicRecords)) {
    if (r.academicYear) notifications.push({ id: `a-${r.id}`, category: 'Academic', title: `Semester ${r.semester} result recorded (CGPA ${Number(r.cgpa).toFixed(2)})`, time: `${r.academicYear}-01-01`, icon: GraduationCap });
  }

  notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Updates derived from your activity on the platform" />

      {notifications.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState title="No notifications" message="You have no notifications yet. New updates will appear here as they occur." />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <ul className="divide-y divide-border">
              {notifications.map((n) => {
                const Icon = n.icon;
                return (
                  <li key={n.id} className="flex items-start gap-3 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">{n.title}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarClock className="h-3 w-3" /> {formatDate(n.time)}
                      </p>
                    </div>
                    <Badge tone={CATEGORY_TONE[n.category] ?? 'slate'}>{n.category}</Badge>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
