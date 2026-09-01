// Deterministic, explainable Career Readiness scoring engine.
// Computes a 0-100 readiness score from the student's REAL profile data
// (academic records, backlogs, skills, certifications, projects, internships,
// placements) plus optional client-side activity (mock interviews, roadmap,
// learning) stored in localStorage. Every category is explainable and
// contributes a documented weight. No random values.

import { asArray } from '../cn';
import { loadStored } from './storage';

export interface ReadinessData {
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  email?: string | null;
  user?: { email?: string | null } | null;
  course?: { courseName?: string | null } | null;
  academicRecords?: any[];
  backlogs?: any[];
  skills?: any[];
  certifications?: any[];
  projects?: any[];
  internships?: any[];
  placements?: any[];
  careerHistory?: any[];
}

export interface CategoryScore {
  id: string;
  label: string;
  score: number; // 0-100
  weight: number; // 0..1
  note: string;
}

export interface ReadinessReport {
  overall: number; // 0-100
  level: string;
  categories: CategoryScore[];
  strengths: string[];
  weaknesses: string[];
  actions: string[];
  history: { label: string; score: number }[];
}

export interface ActivityInput {
  mockAvgScore?: number; // 0-100 average across attempts
  mockAttempts?: number;
  roadmapDone?: number;
  roadmapTotal?: number;
  learningDone?: number;
  learningTotal?: number;
}

// Target baselines used to scale raw counts into 0-100 (explainable).
const TARGETS = {
  skills: 8,
  certifications: 2,
  projects: 3,
  internships: 1,
};

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function scale(raw: number, target: number): number {
  return clamp((raw / target) * 100);
}

export function computeReadiness(data: ReadinessData | null | undefined, activity?: ActivityInput): ReadinessReport {
  const records = asArray<any>(data?.academicRecords).sort((a, b) => Number(a.semester) - Number(b.semester));
  const backlogs = asArray<any>(data?.backlogs);
  const skills = asArray<any>(data?.skills);
  const certifications = asArray<any>(data?.certifications);
  const projects = asArray<any>(data?.projects);
  const internships = asArray<any>(data?.internships);
  const placements = asArray<any>(data?.placements);

  const latest = records[records.length - 1];
  const cgpa = latest ? Number(latest.cgpa) : 0;
  const activeBacklogs = backlogs.filter((b) => !b.clearedDate).length;
  const skillsArr = skills.map((s) => s.skill?.skillName ?? s.skillName).filter(Boolean);

  // --- Academic (25%) ---
  let academic = cgpa ? clamp((cgpa / 10) * 100) : 30;
  if (activeBacklogs > 0) academic = clamp(academic - activeBacklogs * 15);
  const academicNote = latest
    ? `CGPA ${cgpa.toFixed(2)}${activeBacklogs ? ` with ${activeBacklogs} active backlog(s)` : ''}`
    : 'No academic records yet.';

  // --- Skills (15%) ---
  const skillsScore = scale(skillsArr.length, TARGETS.skills);
  const skillsNote = `${skillsArr.length}/${TARGETS.skills} target skills added.`;

  // --- Certifications (10%) ---
  const certScore = scale(certifications.length, TARGETS.certifications);
  const certNote = `${certifications.length}/${TARGETS.certifications} target certifications.`;

  // --- Projects (15%) ---
  const projectScore = scale(projects.length, TARGETS.projects);
  const projectNote = `${projects.length}/${TARGETS.projects} target projects.`;

  // --- Internship (10%) ---
  const internshipScore = scale(Math.min(internships.length, TARGETS.internships * ((internships.length && 1) || 0) + (internships.length ? 1 : 0)), 1);
  const internshipNote = internships.length ? `${internships.length} internship(s) completed.` : 'No internship experience yet.';

  // --- Resume / Career profile (10%) ---
  let resumeScore = 0;
  const hasProfile = !!(data?.firstName && data?.lastName && (data?.user?.email || data?.email));
  const hasAnyCareer = skillsArr.length > 0 || certifications.length > 0 || projects.length > 0 || internships.length > 0;
  if (hasProfile) resumeScore += 50;
  if (hasAnyCareer) resumeScore += 50;
  const resumeNote = `${hasProfile ? 'Profile complete' : 'Profile incomplete'}; ${hasAnyCareer ? 'career sections populated' : 'no career content yet'}.`;

  // --- Placement Preparation (10%) ---
  let placementScore = 0;
  const placementSignals = bootstrapPlacementSignals(placements, skillsArr.length, projects.length, internshipScore);
  placementScore = placementSignals.basic + placementSignals.progress;
  const placementNote = placements.length
    ? `${placements.length} placement record(s); status ${placements[placements.length - 1]?.placementStatus ?? 'N/A'}.`
    : 'No placement activity yet.';

  // --- Interview prep (5%) ---
  const mockScore = activity?.mockAvgScore != null ? activity.mockAvgScore : 0;
  const interviewScore = clamp(mockScore);
  const interviewNote = activity?.mockAttempts
    ? `Avg mock interview score ${interviewScore}% across ${activity.mockAttempts} attempt(s).`
    : 'No mock interviews completed yet.';

  // --- Learning / Roadmap bonus (optional, folded into overall small bonus) ---
  const roadmapProgress = activity?.roadmapTotal ? (activity.roadmapDone || 0) / activity.roadmapTotal : 0;
  const learningProgress = activity?.learningTotal ? (activity.learningDone || 0) / activity.learningTotal : 0;
  const activityBonus = clamp(roadmapProgress * 20 + learningProgress * 10);

  const cats: CategoryScore[] = [
    { id: 'academic', label: 'Academic', score: academic, weight: 0.25, note: academicNote },
    { id: 'skills', label: 'Skills', score: skillsScore, weight: 0.15, note: skillsNote },
    { id: 'projects', label: 'Projects', score: projectScore, weight: 0.15, note: projectNote },
    { id: 'certifications', label: 'Certifications', score: certScore, weight: 0.1, note: certNote },
    { id: 'internship', label: 'Internship', score: internshipScore, weight: 0.1, note: internshipNote },
    { id: 'resume', label: 'Resume / Profile', score: resumeScore, weight: 0.1, note: resumeNote },
    { id: 'interview', label: 'Interview Prep', score: interviewScore, weight: 0.05, note: interviewNote },
    { id: 'placement', label: 'Placement Prep', score: placementScore, weight: 0.1, note: placementNote },
  ];

  const weighted = cats.reduce((sum, c) => sum + c.score * c.weight, 0);
  // Activities give a small, capped bonus on top of the weighted base.
  const overall = clamp(weighted + activityBonus * 0.1);

  // Identify strengths / weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  for (const c of cats) {
    if (c.score >= 70) strengths.push(`${c.label} (${c.score}%)`);
    else if (c.score < 50) weaknesses.push(`${c.label} (${c.score}%)`);
  }
  if (activeBacklogs > 0) weaknesses.push(`Clear ${activeBacklogs} active backlog(s)`);
  if (strengths.length === 0 && cats.length) strengths.push('Building your profile — keep adding skills, projects and certifications.');

  // Recommended actions (explainable)
  const actions: string[] = [];
  if (activeBacklogs > 0) actions.push('Clear your active backlogs — they lower your academic readiness.');
  if (skillsArr.length < TARGETS.skills) actions.push(`Add ${TARGETS.skills - skillsArr.length} more relevant skills to strengthen your skill readiness.`);
  if (certifications.length < TARGETS.certifications) actions.push(`Complete ${TARGETS.certifications - certifications.length} more certification(s) to improve your profile.`);
  if (projects.length < TARGETS.projects) actions.push(`Build ${TARGETS.projects - projects.length} more project(s) to reach the target.`);
  if (!internships.length) actions.push('Gain an internship for significant readiness improvement.');
  if (!placements.length) actions.push('Start applying to eligible placement drives to build preparation.');
  if (activity?.mockAttempts === 0 || activity == null) actions.push('Take a mock interview to establish your interview readiness baseline.');
  if (actions.length === 0) actions.push('Keep up the great momentum — your readiness is strong.');

  // Historical readiness proxy: reconstruct from semester records when possible.
  const history = buildHistory(records, skillsArr.length, certifications.length, projects.length, internships.length);

  const level = overall >= 80 ? 'Strong' : overall >= 60 ? 'Developing' : overall >= 40 ? 'Needs Attention' : 'At Risk';

  return { overall, level, categories: cats, strengths, weaknesses, actions, history };
}

function bootstrapPlacementSignals(
  placements: any[],
  skillsCount: number,
  projectsCount: number,
  internshipScore: number
): { basic: number; progress: number } {
  let basic = 30; // baseline engagement
  if (skillsCount >= 4) basic += 15;
  if (projectsCount >= 1) basic += 15;
  if (internshipScore >= 100) basic += 10;
  const hasOffered = placements.some((p) => p.offerLetter);
  const last = placements[placements.length - 1];
  const progress = last ? (last.placementStatus === 'OFFER_RECEIVED' || last.placementStatus === 'SELECTED' ? 80 : 50) : 0;
  return { basic, progress: hasOffered ? 90 : progress };
}

function buildHistory(
  records: any[],
  skillsCount: number,
  certCount: number,
  projectCount: number,
  internCount: number
): { label: string; score: number }[] {
  if (!records.length) return [{ label: 'Now', score: 0 }];
  return records.map((r, i) => {
    const semesterFactor = Math.min(1, (i + 1) / records.length);
    const academic = r.cgpa ? clamp((Number(r.cgpa) / 10) * 100) : 30;
    const profile = clamp(
      scale(skillsCount * semesterFactor, TARGETS.skills) * 0.3 +
      scale(certCount * semesterFactor, TARGETS.certifications) * 0.2 +
      scale(projectCount * semesterFactor, TARGETS.projects) * 0.3 +
      (internCount ? 100 : 0) * 0.2
    );
    return { label: `Sem ${r.semester}`, score: clamp(academic * 0.6 + profile * 0.4) };
  });
}

// Load optional client-side activity (mock interviews, roadmap, learning) used
// to reward engagement in the readiness score. Stored only in the browser.
export function loadReadinessActivity(): ActivityInput {
  const mocks = loadStored<{ attempts: { score: number }[] }>('mock-interviews', { attempts: [] });
  const roadmap = loadStored<{ milestones: { done: boolean }[] }>('roadmap-progress', { milestones: [] });
  const learning = loadStored<{ courses: { done: boolean }[] }>('learning-progress', { courses: [] });
  const scores = mocks.attempts.map((a) => a.score).filter((s) => typeof s === 'number');
  return {
    mockAvgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : undefined,
    mockAttempts: mocks.attempts.length,
    roadmapDone: roadmap.milestones.filter((m) => m.done).length,
    roadmapTotal: roadmap.milestones.length || undefined,
    learningDone: learning.courses.filter((c) => c.done).length,
    learningTotal: learning.courses.length || undefined,
  };
}
