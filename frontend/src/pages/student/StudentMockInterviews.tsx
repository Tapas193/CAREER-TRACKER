import { FormEvent, useMemo, useState } from 'react';
import { PageHeader, Card, CardHeader, CardContent, StatCard, Badge, Button, Select, Textarea, EmptyState } from '../../components/ui';
import { ScoreBar, LocalNote } from '../../components/intelligence';
import {
  buildQuestionBank,
  loadMockState,
  saveMockAttempt,
  resetMockState,
  pointsForAnswer,
  MockQuestion,
} from '../../utils/intelligence/mockInterview';
import { Microscope, Trophy, TrendingUp, RotateCcw } from 'lucide-react';

const TYPE_LABEL: Record<string, string> = { software: 'Software / Core', data: 'Data & Analytics' };

export default function StudentMockInterviews() {
  const [type, setType] = useState<'software' | 'data'>('software');
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string; pointsEarned: number }[]>([]);
  const [draft, setDraft] = useState('');
  const [stateVersion, setStateVersion] = useState(0);

  const questions = useMemo(() => buildQuestionBank(type), [type]);
  // `stateVersion` intentionally triggers a refresh of the history after saves/resets.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const history = useMemo(() => loadMockState(), [stateVersion]);
  const scores = history.attempts.map((a) => a.score);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const best = scores.length ? Math.max(...scores) : 0;

  const question: MockQuestion = questions[idx];
  const { points, max } = question ? pointsForAnswer(draft.length) : { points: 0, max: 3 };

  const start = () => {
    setAnswers([]);
    setDraft('');
    setIdx(0);
    setStarted(true);
  };

  const next = (e: FormEvent) => {
    e.preventDefault();
    setAnswers((prev) => [...prev, { questionId: question.id, answer: draft, pointsEarned: points }]);
    setDraft('');
    if (idx + 1 < questions.length) setIdx(idx + 1);
    else {
      const current = [...answers, { questionId: question.id, answer: draft, pointsEarned: points }];
      const total = current.length * 3;
      saveMockAttempt(type, current, total);
      setStarted(false);
      setStateVersion((v) => v + 1);
    }
  };

  const reset = () => {
    resetMockState();
    setStateVersion((v) => v + 1);
  };

  return (
    <div>
      <PageHeader title="Mock Interviews" subtitle="Practice with self-scored technical, behavioral and HR questions" />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Attempts" value={history.attempts.length} sub="Completed sessions" icon={<Microscope className="h-4 w-4" />} />
        <StatCard label="Average score" value={avg ? `${avg}%` : '—'} sub="Across attempts" icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Best score" value={best ? `${best}%` : '—'} sub="Personal best" icon={<Trophy className="h-4 w-4" />} />
      </div>

      <Card className="mb-5">
        <CardContent>
          {!started ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <Microscope className="h-10 w-10 text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Ready to practice?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Answer the questions, then self-score based on how much of each answer you complete. Scores are saved in your browser.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <Select value={type} onChange={(e) => setType(e.target.value as 'software' | 'data')} className="w-56" aria-label="Question bank type">
                  {Object.entries(TYPE_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Select>
                <Button onClick={start}>Start interviews ({questions.length} questions)</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={next} className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge tone="blue">Question {idx + 1} of {questions.length}</Badge>
                <Badge tone={question.category === 'Technical' ? 'purple' : question.category === 'Behavioral' ? 'blue' : 'slate'}>{question.category}</Badge>
              </div>
              <div className="mb-2">
                <ScoreBar value={(idx / questions.length) * 100} showValue={false} />
              </div>
              <h3 className="text-base font-medium text-foreground">{question.question}</h3>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-foreground">Your answer</span>
                <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type your answer…" />
              </label>
              <p className="text-xs text-muted-foreground">
                Self-score: answer length now yields {points}/{max} points. Aim for a fuller answer.
              </p>
              <div className="flex items-center justify-between">
                <Button type="button" variant="ghost" onClick={() => { setStarted(false); setAnswers([]); setDraft(''); }}>Cancel</Button>
                <Button type="submit" disabled={draft.trim().length === 0}>
                  {idx + 1 < questions.length ? 'Next question' : 'Finish & save score'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Attempt history" action={history.attempts.length ? <Button variant="ghost" size="sm" onClick={reset}><RotateCcw className="mr-1 h-4 w-4" />Reset</Button> : undefined} />
        <CardContent>
          {history.attempts.length ? (
            <ul className="space-y-3">
              {[...history.attempts].reverse().map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{TYPE_LABEL[a.roleId === 'data' ? 'data' : 'software']} · {new Date(a.date).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">{a.answers.length} questions · {a.total} points available</p>
                  </div>
                  <Badge tone={a.score >= 70 ? 'green' : a.score >= 50 ? 'amber' : 'red'}>{a.score}%</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No attempts yet" message="Complete a mock interview to build your history." />
          )}
          <LocalNote className="mt-3" label="Attempt history is stored only in your browser." />
        </CardContent>
      </Card>
    </div>
  );
}
