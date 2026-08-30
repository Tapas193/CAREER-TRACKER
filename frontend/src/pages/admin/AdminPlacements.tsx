import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, DataTable, StatusBadge, Loading } from '../../components/ui';
import { asArray, formatLpa } from '../../utils/cn';
import type { Placement } from '../../types';

export default function AdminPlacements() {
  const { data, isLoading, refetch } = useApi<{ items: Placement[]; total: number }>(['admin-placements'], '/api/placements');
  const items = asArray<any>(data);

  if (isLoading) return <Loading label="Loading placements…" />;

  return (
    <div>
      <PageHeader title="Placements" subtitle={`${(data as any)?.total ?? items.length} placement records`} />

      <Card>
        <DataTable
          columns={[
            { header: 'Student', render: (p: any) => <span className="font-medium">{p.student ? `${p.student.firstName} ${p.student.lastName}` : p.studentId}</span> },
            { header: 'Company', render: (p: any) => p.companyName },
            { header: 'Role', render: (p: any) => p.jobRole },
            { header: 'Package', render: (p: any) => <span className="font-medium tabular-nums">{formatLpa(p.packageLpa)}</span> },
            { header: 'Status', render: (p: any) => <StatusBadge status={p.placementStatus} /> },
            { header: 'Rounds', render: (p: any) => <span className="tabular-nums">{p.rounds?.length ?? 0}</span> },
          ]}
          data={items}
          loading={isLoading}
          onRetry={refetch}
          emptyTitle="No placements"
          emptyMessage="No placement records exist yet."
        />
      </Card>
    </div>
  );
}