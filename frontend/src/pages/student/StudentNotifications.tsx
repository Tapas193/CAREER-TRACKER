import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardContent, Loading, EmptyState, Badge } from '../../components/ui';
import { Bell, GraduationCap, Briefcase, Building2, Award, CalendarClock, ShieldAlert, Gauge, Lightbulb } from 'lucide-react';
import { asArray, formatDate } from '../../utils/cn';
import { computeReadiness } from '../../utils/intelligence/readiness';
import { assessRisk } from '../../utils/intelligence/risk';
import { analyzeSkillGap } from '../../utils/intelligence/skillGap';
import { defaultRole } from '../../utils/intelligence/roles';

const CATEGORY_TONE: Record<string, 'blue' | 'green' | 'amber' | 'purple' | 'slate' | 'red'> = {
  Academic: 'blue',
  Placement: 'green',
  Internship: 'amber',
  Certification: 'purple',
  System: 'slate',
  AtRisk: 'red',
  Skill: 'purple',
  Readiness: 'blue',
};

type Notif = { id: string; category: string; title: string; time: string; icon: typeof Bell; tier: 'activity' | 'smart' };

export default function StudentNotifications() {
  const { data: me, isLoading } = useApi<any>(['student-me'], '/api/students/me');

  if (isLoading || !me) return <Loading label="Loading notifications…" />;

  const notifications: Notif[] = [];

  for (const c of asArray<any>(me.certifications)) {
    if (c.issuingDate) notifications.push({ id: `c-${c.id}`, category: 'Certification', title: `You earned "${c.certificationName}" from ${c.issuingOrganisation}`, time: c.issuingDate, icon: Award, tier: 'activity' });
  }
  for (const p of asArray<any>(me.placements)) {
    const d = p.placementDate;
    notifications.push({ id: `p-${p.id}`, category: 'Placement', title: `Your application for ${p.jobRole} at ${p.companyName} is ${(p.placementStatus ?? 'PENDING').toLowerCase().replace('_', ' ')}`, time: d, icon: Briefcase, tier: 'activity' });
  }
  for (const i of asArray<any>(me.internships)) {
    if (i.startDate) notifications.push({ id: `i-${i.id}`, category: 'Internship', title: `An internship was added at ${i.companyName} as ${i.role}`, time: i.startDate, icon: Building2, tier: 'activity' });
  }
  for (const ch of asArray<any>(me.careerHistory)) {
    if (ch.startDate) notifications.push({ id: `ch-${ch.id}`, category: 'Internship', title: `Career history entry added: ${ch.jobTitle} at ${ch.companyName}`, time: ch.startDate, icon: Building2, tier: 'activity' });
  }
  for (const r of asArray<any>(me.academicRecords)) {
    if (r.academicYear) notifications.push({ id: `a-${r.id}`, category: 'Academic', title: `Semester ${r.semester} result recorded (CGPA ${Number(r.cgpa).toFixed(2)})`, time: `${r.academicYear}-01-01`, icon: GraduationCap, tier: 'activity' });
  }

  // ---- Smart / intelligence tier (derived, prioritized) ----
  const readiness = computeReadiness(me);
  const risk = assessRisk(me);
  const gap = analyzeSkillGap(me.skills, defaultRole());
  const now = new Date().toISOString();

  if (risk.level === 'HIGH' || risk.level === 'MEDIUM') {
    notifications.push({
      id: 'smart-risk',
      category: 'AtRisk',
      title: `You have ${risk.level.toLowerCase()} at-risk indicators (${risk.score}/100). Review the At-Risk Overview and recommended supports.`,
      time: now,
      icon: ShieldAlert,
      tier: 'smart',
    });
  }
  if (readiness.overall < 60) {
    notifications.push({
      id: 'smart-readiness',
      category: 'Readiness',
      title: `Career readiness is ${Math.round(readiness.overall)}/100. Focus on: ${readiness.actions[0] || 'building your profile.'}`,
      time: now,
      icon: Gauge,
      tier: 'smart',
    });
  }
  if (gap.missingRequired.length > 0) {
    notifications.push({
      id: 'smart-gap',
      category: 'Skill',
      title: `Missing ${gap.missingRequired.length} required ${gap.role.title} skill(s): ${gap.missingRequired.join(', ')}. See Skill Gap Analysis and Learning Recommendations.`,
      time: now,
      icon: Lightbulb,
      tier: 'smart',
    });
  }

  notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  const smartCount = notifications.filter((n) => n.tier === 'smart').length;

  return (
    <div>
      <PageHeader title="Smart Notifications" subtitle="Personalized alerts derived from your real activity and readiness signals" action={<Badge tone="blue">{smartCount} smart alerts</Badge>} />

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
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground ${n.tier === 'smart' ? 'bg-blue-50 text-blue-600' : 'bg-muted'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm text-foreground">{n.title}</p>
                        {n.tier === 'smart' && <Badge tone="blue">Smart</Badge>}
                      </div>
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
