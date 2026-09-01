import { useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, StatCard, Loading, EmptyState } from '../../components/ui';
import { ScoreBar, LocalNote } from '../../components/intelligence';
import { computeXp, loadXpActivity } from '../../utils/intelligence/xp';
import { Trophy, Zap, Flame, Coins } from 'lucide-react';

export default function StudentCareerXp() {
  const { data: me, isLoading } = useApi<any>(['student-me'], '/api/students/me');

  const xp = useMemo(() => (me ? computeXp(me, loadXpActivity()) : null), [me]);

  if (isLoading || !xp) return <Loading label="Calculating your career XP…" />;

  return (
    <div>
      <PageHeader title="Career XP" subtitle="Level up by adding to your real career profile and completing activities" />

      <div className="mb-5 flex flex-col items-center gap-6 lg:flex-row">
        <Card className="flex flex-col items-center justify-center px-8 py-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-4xl font-bold text-white shadow-lg">
            {xp.level}
          </div>
          <p className="mt-3 text-lg font-bold text-foreground">{xp.levelTitle}</p>
          <p className="text-3xl font-bold tabular-nums text-primary">{xp.totalXp} XP</p>
          {xp.nextMin != null && <p className="mt-1 text-xs text-muted-foreground">{xp.nextMin - xp.totalXp} XP to Level {xp.level + 1}</p>}
        </Card>

        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <StatCard label="Total XP" value={xp.totalXp} sub={`Level ${xp.level} · ${xp.levelTitle}`} icon={<Coins className="h-4 w-4" />} />
          <StatCard label="Milestones earned" value={xp.achievements.filter((a) => a.earned).length} sub={`of ${xp.achievements.length}`} icon={<Trophy className="h-4 w-4" />} />
          <StatCard label="Categories" value={xp.breakdown.length} sub="XP sources" icon={<Zap className="h-4 w-4" />} />
        </div>
      </div>

      <div className="mb-5">
        <Card>
          <CardContent>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Progress to next level</span>
              <span className="text-muted-foreground">{xp.progressToNext}%</span>
            </div>
            <ScoreBar value={xp.progressToNext} color="bg-gradient-to-r from-blue-600 to-indigo-600" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="XP breakdown" subtitle="How your XP is earned" />
          <CardContent>
            <ul className="space-y-2">
              {xp.breakdown.filter((b) => b.xp > 0).map((b, i) => (
                <li key={i} className="flex items-center justify-between rounded-md border border-border p-2.5 text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    <span>{b.icon}</span>{b.label}
                  </span>
                  <span className="font-semibold tabular-nums text-primary">{b.xp} XP</span>
                </li>
              ))}
            </ul>
            {xp.breakdown.filter((b) => b.xp > 0).length === 0 && <EmptyState title="No XP yet" message="Start building your profile to earn XP." />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Achievements" subtitle="Unlock milestones from real activity" />
          <CardContent>
            <ul className="space-y-2">
              {xp.achievements.map((a) => (
                <li key={a.id} className={`flex items-start gap-3 rounded-md border p-3 ${a.earned ? 'border-green-200 bg-green-50' : 'border-border'}`}>
                  <span className="text-xl">{a.icon}</span>
                  <div>
                    <p className={`text-sm font-semibold ${a.earned ? 'text-green-800' : 'text-muted-foreground'}`}>{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                  </div>
                  {a.earned && <Flame className="ml-auto h-4 w-4 text-green-600" />}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <LocalNote className="mt-4" label="Mock interview, roadmap and learning XP come from browser-stored activity only." />
    </div>
  );
}
