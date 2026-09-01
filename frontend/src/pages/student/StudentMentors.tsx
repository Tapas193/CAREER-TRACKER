import { FormEvent, useMemo, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, StatCard, Badge, Button, Select, Textarea, EmptyState } from '../../components/ui';
import { LocalNote } from '../../components/intelligence';
import { analyzeSkillGap } from '../../utils/intelligence/skillGap';
import { defaultRole } from '../../utils/intelligence/roles';
import { computeReadiness } from '../../utils/intelligence/readiness';
import { loadStored, saveStored } from '../../utils/intelligence/storage';
import { UserRound, Handshake, Sparkles } from 'lucide-react';

interface Request {
  id: string;
  date: string;
  area: string;
  message: string;
  status: 'Requested' | 'Matched' | 'Completed';
}

export default function StudentMentors() {
  const { data: me } = useApi<any>(['student-me'], '/api/students/me');
  const [area, setArea] = useState('Career guidance');
  const [message, setMessage] = useState('');
  const [requests, setRequests] = useState<Request[]>(() => loadStored<Request[]>('mentor-requests', []));

  const gaps = useMemo(() => {
    if (!me) return [];
    const role = defaultRole();
    const analysis = analyzeSkillGap(me.skills, role);
    return analysis.missingRequired;
  }, [me]);

  const readiness = useMemo(() => (me ? computeReadiness(me).overall : 0), [me]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const req: Request = {
      id: Date.now().toString(36),
      date: new Date().toISOString(),
      area,
      message: message.trim(),
      status: 'Requested',
    };
    const next = [req, ...requests];
    setRequests(next);
    saveStored('mentor-requests', next);
    setMessage('');
  };

  return (
    <div>
      <PageHeader title="Mentor System" subtitle="Request guidance matched to your real skill needs" />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Active requests" value={requests.filter((r) => r.status === 'Requested').length} sub="Pending matching" icon={<Handshake className="h-4 w-4" />} />
        <StatCard label="Suggested focus areas" value={gaps.length} sub="From your skill gaps" icon={<Sparkles className="h-4 w-4" />} />
        <StatCard label="Readiness" value={`${readiness}%`} sub="Your overall readiness" icon={<UserRound className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Request a mentor" subtitle="A mentor request will be routed to the placement office" />
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-foreground">Mentorship area</span>
                <Select value={area} onChange={(e) => setArea(e.target.value)}>
                  {['Career guidance', 'Technical (DSA/Programming)', 'Resume & interviews', 'Placement strategy', 'Internship search', 'Higher studies'].map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </Select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-foreground">Message</span>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe the guidance you're looking for…" />
              </label>
              <Button type="submit" disabled={!message.trim()}>Submit request</Button>
            </form>
            <p className="mt-4 text-xs text-muted-foreground">
              Mentors are matched and assigned by the placement office. No public mentor roster is published yet, so requests are queued for matching.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Suggested focus areas" subtitle="Derived from your target-role skill gaps" />
            <CardContent>
              {gaps.length ? (
                <ul className="space-y-2">
                  {gaps.map((g, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <Badge tone="blue">{g}</Badge>
                      <span>Could benefit from a mentor's guidance</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No skill gaps detected" message="Your profile covers the requirements for this role." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Your mentorship requests" />
            <CardContent>
              {requests.length ? (
                <ul className="space-y-3">
                  {requests.map((r) => (
                    <li key={r.id} className="rounded-md border border-border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">{r.area}</span>
                        <Badge tone={r.status === 'Completed' ? 'green' : r.status === 'Matched' ? 'blue' : 'amber'}>{r.status}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{r.message}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No requests yet" message="Submit a mentorship request to begin." />
              )}
              <LocalNote className="mt-3" label="Requests are stored only in your browser and are not sent to the server." />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
