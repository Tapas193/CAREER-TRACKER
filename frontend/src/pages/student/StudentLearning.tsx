import { useMemo, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardContent, Badge, Loading, EmptyState, Select } from '../../components/ui';
import { LocalNote, ScoreBar } from '../../components/intelligence';
import { getLearningRecommendations, loadLearningState, toggleCourseDone, getAllRolesForPicker } from '../../utils/intelligence/learning';
import { GraduationCap, CheckCircle2, Clock, BookOpen } from 'lucide-react';

export default function StudentLearning() {
  const { data: me, isLoading } = useApi<any>(['student-me'], '/api/students/me');
  const [roleId, setRoleId] = useState('swe');
  const [version, setVersion] = useState(0);

  const recs = useMemo(() => (me ? getLearningRecommendations(me.skills, roleId) : []), [me, roleId]);
  const courseIds = recs.map((r) => r.course.id);
  // `version` intentionally triggers a reload after a toggle.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const state = useMemo(() => loadLearningState(courseIds), [courseIds, version]);
  void version;

  const toggle = (id: string, done: boolean) => {
    toggleCourseDone(id, done);
    setVersion((v) => v + 1);
  };

  if (isLoading || !me) return <Loading label="Loading learning recommendations…" />;

  const doneCourses = state.courses.filter((c) => c.done && courseIds.includes(c.courseId)).length;
  const progress = courseIds.length ? Math.round((doneCourses / courseIds.length) * 100) : 0;

  return (
    <div>
      <PageHeader title="Learning Recommendations" subtitle="Courses selected from your real skill gaps for your target role" />

      <Card className="mb-5">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-primary" />
            <div className="w-48"><ScoreBar value={progress} /></div>
            <span className="text-sm text-muted-foreground">{doneCourses}/{courseIds.length} completed</span>
          </div>
          <Select value={roleId} onChange={(e) => setRoleId(e.target.value)} className="w-72" aria-label="Target role">
            {getAllRolesForPicker().map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </Select>
        </CardContent>
      </Card>

      {recs.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recs.map((r) => {
            const entry = state.courses.find((c) => c.courseId === r.course.id);
            const done = !!entry?.done;
            return (
              <Card key={r.course.id} className={done ? 'border-green-200' : undefined}>
                <CardContent>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <Badge tone={r.required ? 'green' : 'slate'}>{r.required ? 'Required skill' : 'Preferred skill'}</Badge>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-foreground">{r.course.title}</h3>
                  <p className="text-xs text-muted-foreground">{r.course.provider} · {r.course.platform}</p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {r.course.hours}h · {r.course.level}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">{r.reason}</p>
                  <button
                    onClick={() => toggle(r.course.id, !done)}
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      done ? 'border-green-200 bg-green-50 text-green-700' : 'border-border text-foreground hover:bg-accent'
                    }`}
                    aria-pressed={done}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {done ? 'Completed' : 'Mark as done'}
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent>
            <EmptyState title="No learning recommendations" message="Great — you cover the skills for this role. Try a different target role." />
          </CardContent>
        </Card>
      )}

      <LocalNote className="mt-4" label="Completion tracking is stored only in your browser." />
    </div>
  );
}
