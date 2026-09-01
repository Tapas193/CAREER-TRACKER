import { useEffect, useMemo, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardContent, Badge, EmptyState, Loading, Select } from '../../components/ui';
import { LocalNote } from '../../components/intelligence';
import { ScoreBar } from '../../components/intelligence';
import { buildRoadmap, RoadmapMilestone } from '../../utils/intelligence/roadmap';
import { defaultRole, TARGET_ROLES } from '../../utils/intelligence/roles';
import { loadStored, saveStored } from '../../utils/intelligence/storage';
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';

interface ProgressState {
  milestones: { id: string; done: boolean; note?: string }[];
}

const CATEGORY_TONES: Record<RoadmapMilestone['category'], 'green' | 'blue' | 'purple' | 'amber' | 'slate'> = {
  Academic: 'green',
  Career: 'blue',
  Skills: 'purple',
  Projects: 'slate',
  Placement: 'amber',
  Growth: 'slate',
};

export default function StudentRoadmap() {
  const { data: me, isLoading } = useApi<any>(['student-me'], '/api/students/me');

  const [roleId, setRoleId] = useState('swe');
  const [progress, setProgress] = useState<ProgressState>(() => loadStored<ProgressState>('roadmap-progress', { milestones: [] }));
  const [openSem, setOpenSem] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const loaded = loadStored<ProgressState>('roadmap-progress', { milestones: [] });
    const map: Record<string, string> = {};
    loaded.milestones.forEach((m) => { if (m.note) map[m.id] = m.note; });
    return map;
  });

  useEffect(() => {
    const merged = progress.milestones.map((m) => ({ ...m, note: notes[m.id] ?? m.note }));
    saveStored('roadmap-progress', { milestones: merged });
  }, [progress, notes]);

  const role = useMemo(() => defaultRole(roleId), [roleId]);
  const semesters = useMemo(() => (me ? buildRoadmap(1, me.course?.courseName, role) : []), [me, role]);

  if (!isLoading && !me) return <Loading label="Loading roadmap…" />;

  const doneIds = new Set(progress.milestones.filter((m) => m.done).map((m) => m.id));
  const allIds = semesters.flatMap((s) => s.milestones.map((m) => m.id));
  const doneCount = allIds.filter((id) => doneIds.has(id)).length;
  const pct = allIds.length ? Math.round((doneCount / allIds.length) * 100) : 0;

  const toggle = (id: string) => {
    setProgress((p) => {
      const existing = p.milestones.find((m) => m.id === id);
      const rest = p.milestones.filter((m) => m.id !== id);
      return { milestones: [...rest, { id, done: existing ? !existing.done : true, note: notes[id] }] };
    });
  };

  const handleNote = (id: string, value: string) => {
    setNotes((n) => ({ ...n, [id]: value }));
    setProgress((p) => ({
      milestones: p.milestones.some((m) => m.id === id)
        ? p.milestones.map((m) => (m.id === id ? { ...m, note: value } : m))
        : [...p.milestones, { id, done: false, note: value }],
    }));
  };

  if (semesters.length === 0) return <Loading label="Building roadmap…" />;

  return (
    <div>
      <PageHeader title="Career Roadmap" subtitle="A semester-by-semester plan tailored to your target role" />

      <Card className="mb-5">
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold tabular-nums text-primary">{pct}%</div>
              <div className="w-48">
                <ScoreBar value={pct} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Target role
              <Select value={roleId} onChange={(e) => setRoleId(e.target.value)} className="w-64" aria-label="Target role">
                {TARGET_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </Select>
            </label>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {doneCount} of {allIds.length} milestones completed for the {role.title} track.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {semesters.map((sem) => {
          const semDone = sem.milestones.filter((m) => doneIds.has(m.id)).length;
          const expanded = openSem === sem.semester;
          return (
            <Card key={sem.semester}>
              <button
                className="flex w-full items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpenSem(expanded ? null : sem.semester)}
                aria-expanded={expanded}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-foreground">Semester {sem.semester}</span>
                  <Badge tone="slate">{semDone}/{sem.milestones.length} done</Badge>
                </div>
                {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
              {expanded && (
                <CardContent>
                  <ul className="space-y-3">
                    {sem.milestones.map((m) => {
                      const done = doneIds.has(m.id);
                      return (
                        <li key={m.id} className="rounded-md border border-border p-3">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggle(m.id)}
                              className="mt-0.5"
                              aria-label={done ? `Mark "${m.title}" as not done` : `Mark "${m.title}" as done`}
                            >
                              {done ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                            </button>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-sm font-medium ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{m.title}</span>
                                <Badge tone={CATEGORY_TONES[m.category]}>{m.category}</Badge>
                              </div>
                              <p className="mt-0.5 text-xs text-muted-foreground">{m.description}</p>
                              <input
                                className="mt-2 w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
                                value={notes[m.id] || ''}
                                onChange={(e) => handleNote(m.id, e.target.value)}
                                placeholder="Add a personal note…"
                                aria-label={`Note for ${m.title}`}
                              />
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {allIds.length === 0 && <EmptyState title="No roadmap generated" message="Add academic data to generate a semester roadmap." />}

      <LocalNote className="mt-4" label="Milestone completion and notes are stored only in your browser." />
    </div>
  );
}
