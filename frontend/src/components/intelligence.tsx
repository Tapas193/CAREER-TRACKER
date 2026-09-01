import { ReactNode } from 'react';
import { cn } from '../utils/cn';

// Reusable widgets for the Career Intelligence feature pages.
// All are deterministic / presentational; they never fabricate data.

const ringColors: Record<string, string> = {
  green: 'text-green-600',
  blue: 'text-blue-600',
  amber: 'text-amber-600',
  red: 'text-red-600',
  purple: 'text-purple-600',
  slate: 'text-slate-600',
};

// SVG progress ring (0-100).
export function ScoreRing({
  value,
  label,
  color = 'blue',
  size = 120,
  thickness = 10,
  children,
}: {
  value: number;
  label?: string;
  color?: keyof typeof ringColors;
  size?: number;
  thickness?: number;
  children?: ReactNode;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" role="img" aria-label={label ? `${label}: ${clamped}%` : undefined}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={thickness} className="stroke-slate-200" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className={cn('transition-all duration-500', ringColors[color])}
            stroke="currentColor"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold tabular-nums text-foreground">{Math.round(clamped)}</span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label || 'score'}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

// Horizontal proportional bar.
export function ScoreBar({
  value,
  color = 'bg-blue-600',
  showValue = true,
  className,
}: {
  value: number;
  color?: string;
  showValue?: boolean;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(clamped)} aria-valuemin={0} aria-valuemax={100}>
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${clamped}%` }} />
      </div>
      {showValue && <span className="w-10 text-right text-xs font-medium tabular-nums text-muted-foreground">{Math.round(clamped)}%</span>}
    </div>
  );
}

// Label reminding the user that a value lives only in the browser.
export function LocalNote({ label = 'Local change — not synced to server', className }: { label?: string; className?: string }) {
  return (
    <p className={cn('text-xs text-muted-foreground', className)}>
      <span className="mr-1">🔒</span>
      {label}
    </p>
  );
}
