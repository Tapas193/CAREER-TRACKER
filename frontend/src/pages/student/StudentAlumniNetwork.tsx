import { FormEvent, useMemo, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, StatCard, Badge, Loading, EmptyState, Textarea, Button, Select } from '../../components/ui';
import { LocalNote } from '../../components/intelligence';
import { computeReadiness } from '../../utils/intelligence/readiness';
import { loadStored, saveStored } from '../../utils/intelligence/storage';
import { asArray } from '../../utils/cn';
import { Users, MessageSquare, GraduationCap, Send } from 'lucide-react';

interface Ask {
  id: string;
  date: string;
  topic: string;
  message: string;
  status: 'Pending' | 'Open';
}

function alumniName(raw: any): string {
  const s = raw?.student;
  if (s?.firstName && s?.lastName) return `${s.firstName} ${s.lastName}`;
  if (s?.firstName) return s.firstName;
  const email = s?.user?.email || s?.email;
  if (email) return email.split('@')[0];
  return 'Alumnus';
}

export default function StudentAlumniNetwork() {
  const { data: me } = useApi<any>(['student-me'], '/api/students/me');
  const { data: feedback, isLoading: feedLoading } = useApi<any[]>(['alumni-feedback'], '/api/alumni-feedback');

  const [topic, setTopic] = useState('Career guidance');
  const [message, setMessage] = useState('');
  const [asks, setAsks] = useState<Ask[]>(() => loadStored<Ask[]>('alumni-asks', []));

  const readiness = useMemo(() => (me ? computeReadiness(me).overall : 0), [me]);
  const alumni = asArray<any>(feedback);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const entry: Ask = { id: Date.now().toString(36), date: new Date().toISOString(), topic, message: message.trim(), status: 'Pending' };
    const next = [entry, ...asks];
    setAsks(next);
    saveStored('alumni-asks', next);
    setMessage('');
  };

  return (
    <div>
      <PageHeader title="Alumni Network" subtitle="Connect with alumni and get mentorship guidance" />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Alumni on platform" value={alumni.length} sub="From real alumni feedback" icon={<GraduationCap className="h-4 w-4" />} />
        <StatCard label="Open asks" value={asks.filter((a) => a.status === 'Open').length} sub="In progress" icon={<MessageSquare className="h-4 w-4" />} />
        <StatCard label="Your readiness" value={`${readiness}%`} sub="Career readiness" icon={<Users className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Send an alumni ask" subtitle="Post a question for alumni guidance" />
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-foreground">Topic</span>
                <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
                  {['Career guidance', 'Interview experience', 'Internship search', 'Offer evaluation', 'Higher studies', 'Industry insights'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-foreground">Message</span>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What would you like to ask alumni?…" />
              </label>
              <Button type="submit" disabled={!message.trim()}><Send className="mr-1 h-4 w-4" />Post ask</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Alumni on platform" subtitle="Real alumni who have shared feedback" />
            <CardContent>
              {feedLoading ? (
                <Loading label="Loading alumni…" />
              ) : alumni.length ? (
                <ul className="space-y-2">
                  {alumni.slice(0, 10).map((a, i) => (
                    <li key={a.id ?? i} className="flex items-center gap-3 rounded-md border border-border p-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                        {alumniName(a)[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{alumniName(a)}</p>
                        <p className="text-xs text-muted-foreground">Shared alumni feedback</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No alumni yet" message="Alumni appear here once they share feedback on the platform." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Your alumni asks" />
            <CardContent>
              {asks.length ? (
                <ul className="space-y-3">
                  {asks.map((a) => (
                    <li key={a.id} className="rounded-md border border-border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">{a.topic}</span>
                        <Badge tone={a.status === 'Open' ? 'green' : 'amber'}>{a.status}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{a.message}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No asks yet" message="Post an ask to receive alumni guidance." />
              )}
              <LocalNote className="mt-3" label="Asks are stored only in your browser and are not sent to the server." />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
