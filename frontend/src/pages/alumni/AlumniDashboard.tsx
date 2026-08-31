import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, StatCard, Loading, EmptyState } from '../../components/ui';
import { Briefcase, History, Star, Users } from 'lucide-react';
import { formatDate, asArray } from '../../utils/cn';
import type { CareerHistory, AlumniFeedback, Placement } from '../../types';

export default function AlumniDashboard() {
  const { data: career, isLoading: loadingCareer } = useApi<CareerHistory[]>(['career-alumni'], '/api/career-history');
  const { data: feedback } = useApi<AlumniFeedback[]>(['alumni-feedback'], '/api/alumni-feedback');
  const { data: placements } = useApi<Placement[]>(['alumni-placements'], '/api/placements');

  const careers = asArray<any>(career).sort((a, b) => new Date(b.startDate ?? 0).getTime() - new Date(a.startDate ?? 0).getTime());
  const feedbacks = asArray<any>(feedback);
  const pls = asArray<any>(placements);

  const current = careers.find((c) => c.currentJob);
  const avgRating = feedbacks.length ? (feedbacks.reduce((s, f) => s + Number(f.rating), 0) / feedbacks.length).toFixed(1) : '—';

  return (
    <div>
      <PageHeader title="Alumni Dashboard" subtitle="Your career after graduation" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Career Entries" value={careers.length} icon={<History className="h-4 w-4" />} />
        <StatCard label="Current Job" value={current ? current.companyName : '—'} sub={current?.jobTitle} icon={<Briefcase className="h-4 w-4" />} />
        <StatCard label="Placements" value={pls.length} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Avg Feedback" value={avgRating} icon={<Star className="h-4 w-4" />} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Career Timeline" subtitle="Post-graduation employment" />
          <div className="p-5">
            {loadingCareer ? (
              <Loading label="Loading career history…" />
            ) : careers.length === 0 ? (
              <EmptyState title="No career history" message="Add your post-graduation employment via the Career tab." />
            ) : (
              <div className="relative ml-1 border-l-2 border-border pl-5">
                {careers.slice(0, 6).map((c) => (
                  <div key={c.id} className="relative pb-5 last:pb-0">
                    <span className="absolute -left-[25px] flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-4 ring-background" />
                    <p className="text-sm font-semibold text-foreground">
                      {c.companyName}
                      {c.currentJob && <span className="ml-2 rounded-md bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-200">Current</span>}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{c.jobTitle}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(c.startDate)} — {c.endDate ? formatDate(c.endDate) : 'Present'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Latest Feedback" subtitle="Alumni feedback you've shared" />
          <div className="p-5">
            {feedbacks.length === 0 ? (
              <EmptyState title="No feedback" message="Share feedback about the placement process from the Feedback tab." />
            ) : (
              <ul className="divide-y divide-border">
                {feedbacks.slice(0, 5).map((f) => (
                  <li key={f.id} className="py-2.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{Number(f.rating)} / 5</span>
                      <span className="text-xs tabular-nums text-muted-foreground">{formatDate(f.feedbackDate)}</span>
                    </div>
                    {f.comment && <p className="mt-1 text-sm text-muted-foreground">{f.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
