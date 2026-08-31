import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, Badge, Loading, EmptyState, StatCard } from '../../components/ui';
import { Award, Sparkles, Code2, Database, Globe } from 'lucide-react';
import type { StudentSkill } from '../../types';
import { asArray } from '../../utils/cn';

const CATEGORY_ICONS: Record<string, typeof Award> = {
  Programming: Code2,
  Database: Database,
  Web: Globe,
};

export default function StudentSkillDevelopment() {
  const { data, isLoading } = useApi<StudentSkill[]>(['student-skills'], '/api/student-skills');

  if (isLoading) return <Loading label="Loading skills…" />;

  const items = asArray<any>(data);
  const skills = items
    .map((s) => ({ id: s.skillId, name: s.skill?.skillName ?? 'Skill', category: s.skill?.category ?? 'General' }))
    .filter((s) => s.name);

  const byCategory: [string, typeof skills][] = [];
  for (const s of skills) {
    const group = byCategory.find(([cat]) => cat === s.category);
    if (group) {
      group[1].push(s);
    } else {
      byCategory.push([s.category, [s]]);
    }
  }

  return (
    <div>
      <PageHeader title="Skill Development" subtitle="Your technical and professional skill profile" />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Total Skills" value={skills.length} icon={<Award className="h-4 w-4" />} />
        <StatCard label="Categories" value={byCategory.length} icon={<Sparkles className="h-4 w-4" />} />
      </div>

      {skills.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              title="No skills added yet"
              message="Add skills from the Skills catalogue to build your professional profile."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {byCategory.map(([category, list]) => {
            const Icon = CATEGORY_ICONS[category] ?? Award;
            return (
              <Card key={category}>
                <CardHeader
                  title={
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" /> {category}
                    </span>
                  }
                  subtitle={`${list.length} skill${list.length > 1 ? 's' : ''}`}
                />
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {list.map((s) => (
                      <Badge key={s.id} tone="slate" className="px-2.5 py-1">{s.name}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
