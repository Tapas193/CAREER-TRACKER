export type BadgeTone = 'slate' | 'green' | 'red' | 'amber' | 'blue' | 'purple' | 'teal';

const STATUS_TONE: Record<string, BadgeTone> = {
  ADMITTED: 'blue',
  ACTIVE: 'green',
  ON_PLACEMENT: 'amber',
  GRADUATED: 'purple',
  ALUMNI: 'teal',
  PLACED: 'green',
  SELECTED: 'green',
  REJECTED: 'red',
  PENDING: 'amber',
  IN_PROGRESS: 'blue',
  APPLIED: 'blue',
  OFFER_RECEIVED: 'green',
  PASS: 'green',
  FAIL: 'red',
  CLEARED: 'green',
  ACTIVE_ACCOUNT: 'green',
  INACTIVE: 'slate',
  SUSPENDED: 'red',
  PROBATION: 'amber',
};

export function statusTone(status?: string | null): BadgeTone {
  if (!status) return 'slate';
  return STATUS_TONE[status.toUpperCase()] ?? 'slate';
}

export function statusLabel(status?: string | null): string {
  if (!status) return '—';
  return status.replace(/_/g, ' ');
}