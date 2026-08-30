import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, DataTable, StatCard, Loading, Badge } from '../../components/ui';
import { Briefcase, History, Star, Users } from 'lucide-react';
import { formatDate, asArray } from '../../utils/cn';
import type { CareerHistory, AlumniFeedback, Placement } from '../../types';

export default function AlumniDashboard() {
  const { data: career, isLoading: loadingCareer } = useApi<CareerHistory[]>(['career-alumni'], '/api/career-history');
  const { data: feedback } = useApi<AlumniFeedback[]>(['alumni-feedback'], '/api/alumni-feedback');
  const { data: placements } = useApi<Placement[]>(['alumni-placements'], '/api/placements');

  const careers = asArray<any>(career);
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

      {loadingCareer ? (
        <Loading label="Loading career history…" />
      ) : (
        <Card className="mt-5">
          <CardHeader title="Career History" subtitle="Post-graduation employment" />
          <div className="p-0">
            <DataTable
              columns={[
                {
                  header: 'Company',
                  render: (c: any) => (
                    <span className="font-medium text-foreground">
                      {c.companyName} {c.currentJob && <Badge tone="green" className="ml-1.5">Current</Badge>}
                    </span>
                  ),
                },
                { header: 'Role', render: (c: any) => c.jobTitle },
                { header: 'From', render: (c: any) => formatDate(c.startDate) },
                { header: 'To', render: (c: any) => (c.endDate ? formatDate(c.endDate) : 'Present') },
              ]}
              data={careers}
              emptyTitle="No career history"
              emptyMessage="Add your post-graduation employment via the Career tab."
            />
          </div>
        </Card>
      )}
    </div>
  );
}