// Deterministic Resume / Career Profile Analyzer.
// Scores the student's real profile across ATS-style dimensions
// (academics, skills, projects, certifications, internships, work history,
// contact completeness) and returns explainable strengths, gaps and tips.
// There is no file-upload parsing here — analysis is derived from the data the
// student has already recorded (this is the platform's career profile, which
// backs their downloadable resume).

import { asArray } from '../cn';
import type { ReadinessData } from './readiness';

export interface ResumeDimension {
  key: string;
  label: string;
  score: number; // 0-100
  suggestion: string;
  presentCount: number;
  targetCount: number;
}

export interface ResumeAnalysis {
  overall: number;
  level: string;
  dimensions: ResumeDimension[];
  strengths: string[];
  gaps: string[];
  tips: string[];
  updatedAt: string | null;
}

const DIM_TARGETS = {
  contact: 1,
  academic: 1,
  skills: 4,
  projects: 2,
  certifications: 1,
  internship: 1,
  work: 1,
};

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function analyzeResume(data: ReadinessData | null | undefined): ResumeAnalysis {
  const hasContacts = !!(data?.firstName && data?.lastName && (data?.email || data?.user?.email));
  const records = asArray<any>(data?.academicRecords);
  const skills = asArray<any>(data?.skills).filter((s) => s.skill?.skillName || s.skillName);
  const projects = asArray<any>(data?.projects);
  const certifications = asArray<any>(data?.certifications);
  const internships = asArray<any>(data?.internships);
  const workHistory = asArray<any>(data?.careerHistory);

  const dims: ResumeDimension[] = [
    {
      key: 'contact',
      label: 'Contact & identity',
      score: hasContacts ? 100 : 40,
      suggestion: 'Ensure your name, email, phone and university details are complete.',
      presentCount: hasContacts ? 1 : 0,
      targetCount: DIM_TARGETS.contact,
    },
    {
      key: 'academic',
      label: 'Academic summary',
      score: records.length ? clamp((records[records.length - 1].cgpa as number) / 10 * 100) : 40,
      suggestion: 'Add your CGPA and course details for placement filters.',
      presentCount: records.length ? 1 : 0,
      targetCount: DIM_TARGETS.academic,
    },
    {
      key: 'skills',
      label: 'Skills',
      score: clamp((skills.length / DIM_TARGETS.skills) * 100),
      suggestion: 'List at least 4 relevant skills, ideally matching your target role.',
      presentCount: skills.length,
      targetCount: DIM_TARGETS.skills,
    },
    {
      key: 'projects',
      label: 'Projects',
      score: clamp((projects.length / DIM_TARGETS.projects) * 100),
      suggestion: 'Include at least 2 substantial projects with your role outlined.',
      presentCount: projects.length,
      targetCount: DIM_TARGETS.projects,
    },
    {
      key: 'certifications',
      label: 'Certifications',
      score: clamp((certifications.length / DIM_TARGETS.certifications) * 100),
      suggestion: 'Add relevant certifications to strengthen credibility.',
      presentCount: certifications.length,
      targetCount: DIM_TARGETS.certifications,
    },
    {
      key: 'internship',
      label: 'Internships',
      score: clamp((internships.length / DIM_TARGETS.internship) * 100),
      suggestion: 'Add internship experience with role and dates.',
      presentCount: internships.length,
      targetCount: DIM_TARGETS.internship,
    },
    {
      key: 'work',
      label: 'Work experience',
      score: clamp(workHistory.length / DIM_TARGETS.work * 100),
      suggestion: 'Add any work or volunteering experience, with responsibilities and dates.',
      presentCount: workHistory.length,
      targetCount: DIM_TARGETS.work,
    },
  ];

  const weights: Record<string, number> = {
    contact: 0.1,
    academic: 0.15,
    skills: 0.25,
    projects: 0.2,
    certifications: 0.1,
    internship: 0.1,
    work: 0.1,
  };

  const overall = clamp(dims.reduce((s, d) => s + d.score * (weights[d.key] ?? 0.15), 0));
  const level = overall >= 75 ? 'Strong' : overall >= 50 ? 'Developing' : 'Needs Work';

  const strengths = dims.filter((d) => d.score >= 70).map((d) => d.label);
  const gaps = dims.filter((d) => d.score < 50).map((d) => d.label);
  if (strengths.length === 0) strengths.push('Profile is taking shape — keep adding career content.');
  if (gaps.length === 0) gaps.push('None — your profile looks well-rounded.');

  const tips = dims
    .filter((d) => d.score < 70)
    .map((d) => d.suggestion)
    .slice(0, 4);

  let updatedAt: string | null = null;
  const allDates = [
    ...skills.map((s) => s.skill?.updatedAt ?? s.updatedAt),
    ...projects.map((p) => p.updatedAt),
    ...certifications.map((c) => c.updatedAt),
    ...internships.map((i) => i.updatedAt),
  ].filter(Boolean) as string[];
  if (allDates.length) updatedAt = allDates.sort().slice(-1)[0];

  return { overall, level, dimensions: dims, strengths, gaps, tips, updatedAt };
}
