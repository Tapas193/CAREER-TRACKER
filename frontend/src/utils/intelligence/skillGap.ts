// Deterministic Skill Gap Analysis.
// Compares the student's real skills against the required/preferred skills of
// a chosen target role, producing an explainable gap list and coverage score.

import { matchSkill, normalizeSkill, TargetRole } from './roles';
import { asArray } from '../cn';

export interface SkillGapResult {
  role: TargetRole;
  studentSkills: string[];
  coverage: number; // 0-100
  requiredCoverage: number;
  missingRequired: string[];
  missingPreferred: string[];
  presentRequired: string[];
  suggestions: string[];
  overall: number;
}

export function analyzeSkillGap(skillsRaw: any[] | undefined, role: TargetRole): SkillGapResult {
  const studentSkills = asArray<any>(skillsRaw)
    .map((s) => s.skill?.skillName ?? s.skillName)
    .filter(Boolean)
    .map((s: string) => normalizeSkill(s));

  const presentRequired = role.requiredSkills.filter((r) => matchSkillIn(r, studentSkills));
  const missingRequired = role.requiredSkills.filter((r) => !matchSkillIn(r, studentSkills));
  const missingPreferred = role.preferredSkills.filter((p) => !matchSkillIn(p, studentSkills));

  const requiredCoverage = role.requiredSkills.length
    ? Math.round((presentRequired.length / role.requiredSkills.length) * 100)
    : 0;

  // Overall weights required skills more than preferred skills.
  const totalRelevant = role.requiredSkills.length + role.preferredSkills.length || 1;
  const presentCount =
    presentRequired.length + role.preferredSkills.filter((p) => matchSkillIn(p, studentSkills)).length;
  const overall = Math.round((presentCount / totalRelevant) * 100);

  const suggestions: string[] = [];
  if (missingRequired.length) {
    suggestions.push(`Prioritise these required skills: ${missingRequired.join(', ')}.`);
    suggestions.push('Add these skills to your profile and demonstrate them in projects.');
  }
  if (missingPreferred.length) {
    suggestions.push(`Nice-to-have skills to add: ${missingPreferred.join(', ')}.`);
  }
  if (missingRequired.length === 0 && missingPreferred.length === 0) {
    suggestions.push('You fully cover this target role. Keep sharpening with real-world projects.');
  }

  return {
    role,
    studentSkills,
    coverage: overall,
    requiredCoverage,
    missingRequired,
    missingPreferred,
    presentRequired,
    suggestions,
    overall,
  };
}

// Match a role skill against normalized student skills (both normalized).
function matchSkillIn(roleSkill: string, studentSkills: string[]): boolean {
  return studentSkills.some((s) => s.toLowerCase() === roleSkill.toLowerCase() || matchSkill(s, [roleSkill]));
}
