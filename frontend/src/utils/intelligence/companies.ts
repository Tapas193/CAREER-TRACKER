// Smart Company Recommendations (derived, deterministic).
//
// This feature works ONLY from real data:
//  - Companies the student has actually engaged with come from their real
//    placement / offer records (companyName, status, packageLpa).
//  - Suggested target companies are derived from the student's chosen target
//    role taxonomy sample companies, scored against the student's skill-gap
//    coverage and readiness. These are clearly labelled as guidance — the
//    platform never fabricates company eligibility or offers.
//
// No company inventory exists in the database, so we never invent companies.

import { TargetRole } from './roles';
import { asArray } from '../cn';
import { analyzeSkillGap } from './skillGap';

export interface EngagedCompany {
  companyName: string;
  jobRole?: string | null;
  packageLpa?: number | null;
  status?: string | null;
  location?: string | null;
}

export interface RecommendedCompany {
  companyName: string;
  source: string; // e.g. 'target role track'
  match: string; // label: Strong / Moderate / Explore
  score: number; // 0-100
  reasons: string[];
}

export interface CompanyRecommendations {
  engaged: EngagedCompany[];
  recommended: RecommendedCompany[];
  hasEngagement: boolean;
}

export function computeCompanyRecommendations(
  data: {
    placements?: any[];
    skills?: any[];
  } | null | undefined,
  role: TargetRole,
  readinessScore: number
): CompanyRecommendations {
  const placements = asArray<any>(data?.placements);
  const engaged: EngagedCompany[] = placements.map((p) => ({
    companyName: p.companyName,
    jobRole: p.jobRole,
    packageLpa: p.packageLpa != null ? Number(p.packageLpa) : null,
    status: p.placementStatus,
    location: p.location,
  }));

  const skillGap = analyzeSkillGap(data?.skills, role);
  const coverage = skillGap.overall;
  const engagedMatches = engaged.map((e) => e.companyName.toLowerCase());

  const recommended: RecommendedCompany[] = role.sampleCompanies
    // never re-list companies the student already engaged with
    .filter((name) => !engagedMatches.includes(name.toLowerCase()))
    .map((name) => {
      // Deterministic scoring from coverage + readiness (no randomness).
      const score = Math.min(100, Math.round(coverage * 0.6 + readinessScore * 0.4));
      const match = score >= 75 ? 'Strong' : score >= 50 ? 'Moderate' : 'Explore';
      const reasons: string[] = [];
      if (coverage >= 60) reasons.push(`Your skill coverage for ${role.title} is strong (${coverage}%).`);
      else reasons.push(`Improve ${role.title} skill coverage (currently ${coverage}%) to strengthen fit.`);
      if (readinessScore >= 60) reasons.push(`Career readiness is healthy (${readinessScore}/100).`);
      else reasons.push(`Career readiness is ${readinessScore}/100 — build it before applying.`);
      if (reasons.length === 0) reasons.push('Consider researching role requirements and company hiring patterns.');
      return { companyName: name, source: `${role.title} track`, match, score, reasons };
    })
    .sort((a, b) => b.score - a.score);

  return { engaged, recommended, hasEngagement: placements.length > 0 };
}
