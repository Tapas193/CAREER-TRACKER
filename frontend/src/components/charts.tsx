import type { ReactNode } from 'react';
import { Card, CardHeader, CardContent, EmptyState, Loading } from './ui';
import { cn } from '../utils/cn';

// Consistent professional chart palette used across the whole application.
export const CHART_COLORS = ['#2563eb', '#059669', '#7c3aed', '#d97706', '#dc2626', '#0891b2', '#64748b', '#db2777'];

// Shared tooltip styling so every chart looks consistent.
export const CHART_TOOLTIP_STYLE = {
  borderRadius: 8,
  border: '1px solid hsl(var(--border))',
  fontSize: 12,
  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  background: 'hsl(var(--card))',
  color: 'hsl(var(--foreground))',
} as const;

const AXIS_TICK = { fontSize: 11, fill: 'hsl(var(--muted-foreground))' } as const;
const GRID_STROKE = 'hsl(var(--border))';

// Shared axis helpers so pages can reuse identical, readable axis styling.
export const chartAxis = { tick: AXIS_TICK };
export const chartGrid = { stroke: GRID_STROKE };

export function formatNumber(n: number | string | null | undefined): string {
  const num = Number(n);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('en-IN').format(num);
}

export function ChartCard({
  title,
  description,
  loading = false,
  empty,
  children,
  className,
  footer,
}: {
  title: ReactNode;
  description?: ReactNode;
  loading?: boolean;
  empty?: ReactNode;
  children?: ReactNode;
  className?: string;
  footer?: ReactNode;
}) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader title={title} subtitle={description} />
      <CardContent className="flex flex-1 flex-col">
        {loading ? (
          <Loading label="Loading chart…" />
        ) : empty ? (
          empty
        ) : (
          <div className="h-64 w-full sm:h-72">{children}</div>
        )}
        {footer}
      </CardContent>
    </Card>
  );
}

export function ChartEmpty({ title = 'No data available', message }: { title?: string; message?: string }) {
  return <EmptyState title={title} message={message} />;
}

type TooltipEntry = { name?: string; value?: number | string; color?: string; dataKey?: string | number };
type TooltipPayload = { payload?: TooltipEntry[] };

// A consistent, label-friendly tooltip shared by all charts. Recharts injects the
// shape via `content`; we accept a generic `any` to stay framework-compatible.
export function ChartTooltip({ active, payload, label, valueFormatter }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      {label != null && <p className="mb-1 font-semibold text-foreground">{label}</p>}
      <div className="space-y-1">
        {(payload as TooltipPayload['payload'] ?? []).map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: entry.color || CHART_COLORS[0] }} />
            <span className="capitalize">{entry.name ?? entry.dataKey}</span>
            <span className="ml-auto pl-4 font-semibold tabular-nums text-foreground">
              {valueFormatter ? valueFormatter(entry.value, entry.name) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
