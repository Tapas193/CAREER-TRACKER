// Deterministic At-Risk Student Detection.
// Uses measurable signals from real student data to assign a risk level and
// score, with the underlying reasons always shown. No opaque or random labels.

import { asArray } from '../cn';
import type { ReadinessData } from './readiness';
import { computeReadiness } from './readiness';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskReport {
  score: number; // 0-100 (higher = more at risk)
  level: RiskLevel;
  reasons: string[];
  interventions: string[];
  readiness: number;
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function assessRisk(data: ReadinessData | null | undefined): RiskReport {
  const records = asArray<any>(data?.academicRecords).sort((a, b) => Number(a.semester) - Number(b.semester));
  const backlogs = asArray<any>(data?.backlogs);
  const skills = asArray<any>(data?.skills);
  const certifications = asArray<any>(data?.certifications);
  const projects = asArray<any>(data?.projects);
  const internships = asArray<any>(data?.internships);
  const placements = asArray<any>(data?.placements);

  const activeBacklogs = backlogs.filter((b) => !b.clearedDate).length;
  const latest = records[records.length - 1];
  const cgpa = latest ? Number(latest.cgpa) : 0;
  const skillsCount = skills.length;
  const hasProfile = !!(data?.firstName && data?.lastName);
  const hasCareer = skillsCount > 0 || certifications.length > 0 || projects.length > 0 || internships.length > 0;
  const readiness = computeReadiness(data).overall;

  const reasons: string[] = [];
  let score = 0;

  // CGPA
  if (records.length && cgpa) {
    if (cgpa < 6) { score += 25; reasons.push(`CGPA ${cgpa.toFixed(2)} is below the recommended threshold (6.0)`); }
    else if (cgpa < 7) { score += 10; reasons.push(`CGPA ${cgpa.toFixed(2)} is moderate`); }
  } else { score += 12; reasons.push('No academic records on file'); }

  // Backlogs
  if (activeBacklogs >= 2) { score += 25; reasons.push(`${activeBacklogs} active backlog(s)`); }
  else if (activeBacklogs === 1) { score += 12; reasons.push('1 active backlog'); }

  // Skills
  if (skillsCount === 0) { score += 15; reasons.push('No skills added to profile'); }
  else if (skillsCount < 4) { score += 8; reasons.push(`Only ${skillsCount} skills (below 4)`); }

  // Internship
  if (internships.length === 0) { score += 8; reasons.push('No internship experience'); }

  // Profile / resume
  if (!hasProfile) { score += 10; reasons.push('Incomplete personal profile'); }
  else if (!hasCareer) { score += 8; reasons.push('No career content (skills/projects/certs/internships)'); }

  // Placement activity
  if (placements.length === 0) { score += 8; reasons.push('No placement activity / applications'); }

  // Readiness cross-check
  if (readiness < 40) { score += 10; reasons.push(`Career readiness is low (${readiness}/100)`); }

  const level: RiskLevel = score >= 45 ? 'HIGH' : score >= 25 ? 'MEDIUM' : 'LOW';

  const interventions: string[] = [];
  if (level === 'HIGH') interventions.push('Assign a mentor', 'Schedule counseling', 'Recommend structured DSA/prep plan');
  if (activeBacklogs > 0) interventions.push('Plan backlog clearance with the academic office');
  if (skillsCount < 4) interventions.push('Add foundational skills to your profile');
  if (internships.length === 0) interventions.push('Explore internship opportunities');
  if (!hasCareer) interventions.push('Build out career profile sections');
  if (placements.length === 0) interventions.push('Start engaging with eligible placement drives');
  if (interventions.length === 0) interventions.push('Continue current progress; monitor readiness');

  return { score: clamp(score), level, reasons, interventions, readiness };
}
