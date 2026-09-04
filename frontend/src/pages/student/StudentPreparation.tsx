import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, Loading, Badge } from '../../components/ui';
import {
  Users,
  Cpu,
  MessageCircleQuestion,
  Calculator,
  Code2,
  Mic,
  FileText,
  MessagesSquare,
  Video,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { asArray } from '../../utils/cn';
import type { PreparationResource } from '../../types';

const CATEGORIES = [
  { key: 'Interview Preparation', label: 'Interview Preparation', description: 'Common interview questions, STAR method, etiquette and more.', icon: Users, to: '/student/preparation/interview' },
  { key: 'Technical Interview', label: 'Technical Interview', description: 'Core subject questions and technical interview practice.', icon: Cpu, to: '/student/preparation/technical' },
  { key: 'HR Interview', label: 'HR Interview', description: 'HR rounds, strengths, weaknesses and salary discussions.', icon: MessageCircleQuestion, to: '/student/preparation/hr' },
  { key: 'Aptitude', label: 'Aptitude', description: 'Quantitative, logical and verbal aptitude practice.', icon: Calculator, to: '/student/preparation/aptitude' },
  { key: 'Coding / DSA', label: 'Coding / DSA', description: 'Data structures, algorithms and competitive coding.', icon: Code2, to: '/student/preparation/dsa' },
  { key: 'Communication Skills', label: 'Communication Skills', description: 'English, soft skills and effective communication.', icon: Mic, to: '/student/preparation/communication' },
  { key: 'Resume Preparation', label: 'Resume Preparation', description: 'Build a strong resume and cover letter.', icon: FileText, to: '/student/preparation/resume' },
  { key: 'Group Discussion', label: 'Group Discussion', description: 'GD topics, frameworks and speaking tips.', icon: MessagesSquare, to: '/student/preparation/gd' },
  { key: 'Mock Interview', label: 'Mock Interview', description: 'Full-length mock interviews and feedback.', icon: Video, to: '/student/preparation/mock' },
];

export default function StudentPreparation() {
  const { data, isLoading } = useApi<{ items: PreparationResource[]; total: number }>(['preparation'], '/api/student/preparation');

  const items = asArray<PreparationResource>(data?.items);

  if (isLoading) return <Loading label="Loading preparation center…" />;

  const counts = CATEGORIES.map((c) => ({ key: c.key, count: items.filter((r) => r.category === c.key).length }));

  return (
    <div>
      <PageHeader
        title="Preparation"
        subtitle="Access curated resources to prepare for your campus placements"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => {
          const count = counts.find((x) => x.key === c.key)?.count ?? 0;
          return (
            <Link key={c.key} to={c.to} className="group block">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex h-full flex-col">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">{c.label}</h3>
                    <Badge tone={count > 0 ? 'blue' : 'slate'}>{count} resources</Badge>
                  </div>
                  <p className="mb-4 text-xs text-muted-foreground">{c.description}</p>
                  <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-primary">
                    Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="mt-5">
        <CardHeader title="How to use this section" subtitle="A few tips to get the most out of your preparation" />
        <CardContent>
          <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="rounded-md border border-border p-3">Pick one category and master it before moving on.</li>
            <li className="rounded-md border border-border p-3">Use a mix of videos, articles and practice questions.</li>
            <li className="rounded-md border border-border p-3">Rehearse answers out loud, not just in your head.</li>
            <li className="rounded-md border border-border p-3">Resources open in a new tab — return here to track your progress.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
