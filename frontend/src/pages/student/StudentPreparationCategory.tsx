import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { PageHeader, Loading, Badge, Input, Select, FilterBar, EmptyState } from '../../components/ui';
import { ArrowLeft, Youtube, FileText, BookOpen, FileSpreadsheet, ClipboardList, Link2, Search } from 'lucide-react';
import { asArray } from '../../utils/cn';
import type { PreparationResource, PreparationResourceType, PreparationDifficulty } from '../../types';

const CATEGORY_LABELS: Record<string, string> = {
  technical: 'Technical Interview',
  hr: 'HR Interview',
  aptitude: 'Aptitude',
  dsa: 'Coding / DSA',
  communication: 'Communication Skills',
  resume: 'Resume Preparation',
  gd: 'Group Discussion',
  mock: 'Mock Interview',
};

const TYPE_META: Record<PreparationResourceType, { label: string; icon: any; tone: any }> = {
  YOUTUBE: { label: 'YouTube', icon: Youtube, tone: 'red' },
  ARTICLE: { label: 'Article', icon: FileText, tone: 'blue' },
  PDF: { label: 'PDF', icon: BookOpen, tone: 'amber' },
  DOCUMENT: { label: 'Document', icon: FileSpreadsheet, tone: 'purple' },
  PRACTICE: { label: 'Practice', icon: ClipboardList, tone: 'teal' },
  OTHER: { label: 'Other', icon: Link2, tone: 'slate' },
};

const DIFF_LABEL: Record<PreparationDifficulty, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

const DIFF_TONE: Record<PreparationDifficulty, any> = {
  BEGINNER: 'green',
  INTERMEDIATE: 'amber',
  ADVANCED: 'red',
};

function ResourceCard({ r }: { r: PreparationResource }) {
  const meta = TYPE_META[r.resourceType];
  const Icon = meta.icon;
  return (
    <div className="flex flex-col rounded-lg border border-border p-4">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-foreground">{r.title}</h4>
          {r.duration && <p className="mt-0.5 text-xs text-muted-foreground">{r.duration}</p>}
        </div>
      </div>
      {r.description && <p className="mb-3 line-clamp-3 text-xs text-muted-foreground">{r.description}</p>}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone={meta.tone}>{meta.label}</Badge>
        {r.difficulty && <Badge tone={DIFF_TONE[r.difficulty]}>{DIFF_LABEL[r.difficulty]}</Badge>}
      </div>
      <a
        href={r.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Open Resource
      </a>
    </div>
  );
}

export default function StudentPreparationCategory() {
  const { category } = useParams<{ category: string }>();
  const label = CATEGORY_LABELS[category ?? ''] ?? 'Preparation';
  const [search, setSearch] = useState('');
  const [types, setTypes] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');

  const { data, isLoading } = useApi<{ items: PreparationResource[]; total: number }>(
    ['preparation', category ?? ''],
    category ? `/api/student/preparation?category=${encodeURIComponent(label)}` : null
  );

  const items = asArray<PreparationResource>(data?.items);

  const topics = useMemo(() => Array.from(new Set(items.map((r) => r.topic))), [items]);
  const [activeTopic, setActiveTopic] = useState<string>('All topics');

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.topic.toLowerCase().includes(search.toLowerCase())) return false;
      if (types !== 'all' && r.resourceType !== types) return false;
      if (difficulty !== 'all' && r.difficulty !== difficulty) return false;
      if (activeTopic !== 'All topics' && r.topic !== activeTopic) return false;
      return true;
    });
  }, [items, search, types, difficulty, activeTopic]);

  if (isLoading) return <Loading label={`Loading ${label}…`} />;

  return (
    <div>
      <PageHeader
        title={label}
        subtitle="Curated resources to prepare for this area"
      />

      <Link to="/student/preparation" className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Preparation
      </Link>

      {topics.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTopic('All topics')}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTopic === 'All topics' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:bg-accent'
            }`}
          >
            All topics
          </button>
          {topics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTopic(t)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTopic === t ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:bg-accent'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="mb-5">
        <FilterBar onReset={() => { setSearch(''); setTypes('all'); setDifficulty('all'); setActiveTopic('All topics'); }}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search resources…" className="w-56 pl-8" aria-label="Search resources" />
          </div>
          <Select value={types} onChange={(e) => setTypes(e.target.value)} className="w-44" aria-label="Resource type">
            <option value="all">All types</option>
            <option value="YOUTUBE">YouTube</option>
            <option value="ARTICLE">Article</option>
            <option value="PDF">PDF</option>
            <option value="DOCUMENT">Document</option>
            <option value="PRACTICE">Practice</option>
            <option value="OTHER">Other</option>
          </Select>
          <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-40" aria-label="Difficulty">
            <option value="all">All difficulties</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </Select>
        </FilterBar>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={items.length === 0 ? `No resources yet for ${label}` : 'No resources found'}
          message={items.length === 0 ? 'Resources added by the administration will appear here.' : 'Try adjusting your search or filters.'}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((r) => (
            <ResourceCard key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}
