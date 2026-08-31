import { asArray } from './cn';

export interface CareerReadinessData {
  hasRecords: boolean;
  skillsCount: number;
  certificationsCount: number;
  projectsCount: number;
  internshipsCount: number;
  hasOffer: boolean;
}

export function careerReadiness(me: Record<string, any> | null | undefined): CareerReadinessData {
  const records = asArray<any>(me?.academicRecords);
  const skills = asArray<any>(me?.skills);
  const certs = asArray<any>(me?.certifications);
  const projects = asArray<any>(me?.projects);
  const internships = asArray<any>(me?.internships);
  const placements = asArray<any>(me?.placements);
  const hasOffer = placements.some((p) => !!p.offerLetter);
  return {
    hasRecords: records.length > 0,
    skillsCount: skills.length,
    certificationsCount: certs.length,
    projectsCount: projects.length,
    internshipsCount: internships.length,
    hasOffer,
  };
}

export interface CompletionItem {
  id: string;
  label: string;
  done: boolean;
}

export function careerProfileCompletion(me: Record<string, any> | null | undefined): CompletionItem[] {
  const r = careerReadiness(me);
  return [
    { id: 'profile', label: 'Profile', done: !!me?.firstName && !!me?.lastName },
    { id: 'academics', label: 'Academics', done: r.hasRecords },
    { id: 'skills', label: 'Skills', done: r.skillsCount > 0 },
    { id: 'projects', label: 'Projects', done: r.projectsCount > 0 },
    { id: 'internship', label: 'Internship', done: r.internshipsCount > 0 },
    { id: 'certifications', label: 'Certifications', done: r.certificationsCount > 0 },
  ];
}

export function careerProfilePercent(me: Record<string, any> | null | undefined): number {
  const items = careerProfileCompletion(me);
  const done = items.filter((i) => i.done).length;
  return items.length ? Math.round((done / items.length) * 100) : 0;
}
