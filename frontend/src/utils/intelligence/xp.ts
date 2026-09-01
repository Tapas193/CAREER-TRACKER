// Deterministic Career XP engine.
// Awards XP from measurable profile signals (skills, certs, projects,
// internships, placements, backlogs cleared) plus client-side activity
// (mock interviews, roadmap, learning). Levels and achievements follow fixed
// thresholds so progress is explainable and reproducible.

import { asArray } from '../cn';
import { loadStored } from './storage';
import type { ReadinessData } from './readiness';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
}

const LEVELS = [
  { level: 1, min: 0, title: 'Explorer' },
  { level: 2, min: 200, title: 'Builder' },
  { level: 3, min: 500, title: 'Achiever' },
  { level: 4, min: 900, title: 'Specialist' },
  { level: 5, min: 1400, title: 'Expert' },
  { level: 6, min: 2000, title: 'Master' },
];

export interface XpActivity {
  mockAvgScore?: number;
  mockAttempts?: number;
  roadmapDone?: number;
  roadmapTotal?: number;
  learningDone?: number;
  learningTotal?: number;
}

export interface XpReport {
  totalXp: number;
  level: number;
  levelTitle: string;
  currentMin: number;
  nextMin: number | null;
  progressToNext: number; // 0-100
  breakdown: { label: string; xp: number; icon: string }[];
  achievements: Achievement[];
}

function levelFor(xp: number) {
  let current = LEVELS[0];
  let next = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].min) current = LEVELS[i];
    if (LEVELS[i + 1] && xp < LEVELS[i + 1].min) {
      next = LEVELS[i + 1];
      break;
    }
  }
  return { current, next };
}

function progressToNext(xp: number, currentMin: number, nextMin: number | null) {
  if (nextMin == null) return 100;
  const span = nextMin - currentMin;
  if (span <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round(((xp - currentMin) / span) * 100)));
}

export function computeXp(data: ReadinessData | null | undefined, activity?: XpActivity): XpReport {
  const backlogs = asArray<any>(data?.backlogs);
  const skillsCount = asArray<any>(data?.skills).length;
  const certCount = asArray<any>(data?.certifications).length;
  const projectCount = asArray<any>(data?.projects).length;
  const internshipCount = asArray<any>(data?.internships).length;
  const placements = asArray<any>(data?.placements);
  const clearedBacklogs = backlogs.filter((b) => b.clearedDate).length;
  const hasOffer = placements.some((p) => p.offerLetter);

  const breakdown = [
    { label: 'Profile', xp: 50, icon: '🪪' },
    { label: 'Skills', xp: skillsCount * 25, icon: '💡' },
    { label: 'Certifications', xp: certCount * 40, icon: '📜' },
    { label: 'Projects', xp: projectCount * 50, icon: '🛠️' },
    { label: 'Internships', xp: internshipCount * 80, icon: '🏢' },
    { label: 'Backlogs cleared', xp: clearedBacklogs * 30, icon: '✅' },
    { label: 'Placement activity', xp: placements.length * 20, icon: '🎯' },
    { label: 'Offer received', xp: hasOffer ? 150 : 0, icon: '🏆' },
  ];

  const act = activity || {};
  if (act.mockAttempts) breakdown.push({ label: 'Mock interviews', xp: act.mockAttempts * 25, icon: '🎤' });
  if (act.roadmapDone && act.roadmapDone > 0) breakdown.push({ label: 'Roadmap milestones', xp: act.roadmapDone * 20, icon: '🗺️' });
  if (act.learningDone && act.learningDone > 0) breakdown.push({ label: 'Learning activities', xp: act.learningDone * 15, icon: '📚' });

  const totalXp = breakdown.reduce((s, b) => s + b.xp, 0);
  const { current, next } = levelFor(totalXp);

  const achievements: Achievement[] = [
    {
      id: 'skills-5',
      title: 'Skill Collector',
      description: 'Add 5+ skills to your profile',
      icon: '💡',
      earned: skillsCount >= 5,
    },
    {
      id: 'certs-2',
      title: 'Certified',
      description: 'Complete 2+ certifications',
      icon: '📜',
      earned: certCount >= 2,
    },
    {
      id: 'projects-3',
      title: 'Project Builder',
      description: 'Build 3+ projects',
      icon: '🛠️',
      earned: projectCount >= 3,
    },
    {
      id: 'internship-1',
      title: 'Intern',
      description: 'Complete an internship',
      icon: '🏢',
      earned: internshipCount >= 1,
    },
    {
      id: 'backlog-1',
      title: 'Comeback',
      description: 'Clear at least one backlog',
      icon: '✅',
      earned: clearedBacklogs >= 1,
    },
    {
      id: 'offer-1',
      title: 'Placement Winner',
      description: 'Receive an offer letter',
      icon: '🏆',
      earned: hasOffer,
    },
    {
      id: 'mock-1',
      title: 'Interview Ready',
      description: 'Complete a mock interview',
      icon: '🎤',
      earned: (activity?.mockAttempts || 0) >= 1,
    },
    {
      id: 'roadmap-3',
      title: 'On Track',
      description: 'Complete 3+ roadmap milestones',
      icon: '🗺️',
      earned: (activity?.roadmapDone || 0) >= 3,
    },
  ];

  return {
    totalXp,
    level: current.level,
    levelTitle: current.title,
    currentMin: current.min,
    nextMin: next ? next.min : null,
    progressToNext: progressToNext(totalXp, current.min, next ? next.min : null),
    breakdown,
    achievements,
  };
}

export function loadXpActivity(): XpActivity {
  const mocks = loadStored<{ attempts: { score: number }[] }>('mock-interviews', { attempts: [] });
  const roadmap = loadStored<{ milestones: { done: boolean }[] }>('roadmap-progress', { milestones: [] });
  const learning = loadStored<{ courses: { done: boolean }[] }>('learning-progress', { courses: [] });
  const scores = mocks.attempts.map((a) => a.score).filter((s) => typeof s === 'number');
  return {
    mockAvgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : undefined,
    mockAttempts: mocks.attempts.length,
    roadmapDone: roadmap.milestones.filter((m) => m.done).length,
    roadmapTotal: roadmap.milestones.length,
    learningDone: learning.courses.filter((c) => c.done).length,
    learningTotal: learning.courses.length,
  };
}
