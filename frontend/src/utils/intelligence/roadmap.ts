// Deterministic Career Roadmap engine.
// Produces a semester-by-semester milestone plan driven by the student's real
// semester/course data and their chosen target role. Milestones fall into
// academic, career, skills, placement and personal-development tracks.
// Completion state + personal notes are stored in localStorage (client-only).

import { TargetRole } from './roles';

export interface RoadmapMilestone {
  id: string;
  semester: number;
  category: 'Academic' | 'Career' | 'Skills' | 'Projects' | 'Placement' | 'Growth';
  title: string;
  description: string;
  source: 'realtime' | 'plan';
}

export interface RoadmapSemester {
  semester: number;
  milestones: RoadmapMilestone[];
}

function mk(
  semester: number,
  category: RoadmapMilestone['category'],
  title: string,
  description: string,
  source: 'realtime' | 'plan' = 'plan'
): RoadmapMilestone {
  return {
    id: `sem${semester}-${category.toLowerCase()}-${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 48)}`,
    semester,
    category,
    title,
    description,
    source,
  };
}

export function buildRoadmap(
  _currentSemester: number,
  courseName?: string | null,
  role?: TargetRole
): RoadmapSemester[] {
  const plan: RoadmapMilestone[] = [];

  for (let sem = 1; sem <= 8; sem++) {
    if (sem === 1) {
      plan.push(mk(sem, 'Academic', 'Build a solid academic foundation', 'Maintain CGPA above the recommended threshold (6.0+).'));
      plan.push(mk(sem, 'Skills', 'Learn programming fundamentals', 'Pick up a core language and data structures basics.'));
      plan.push(mk(sem, 'Skills', 'Set up your developer toolkit', 'Learn Git and create a GitHub account to track early work.'));
      plan.push(mk(sem, 'Growth', 'Join a technical club', 'Build a network and learn from senior peers.'));
    } else if (sem === 2) {
      plan.push(mk(sem, 'Skills', 'Complete 1 online course', 'Take a certification in your target role domain.'));
      plan.push(mk(sem, 'Career', 'Write your first resume', 'Start a resume and list coursework + first projects.'));
      plan.push(mk(sem, 'Skills', 'Start your first project', 'Build a small project and host it on GitHub.'));
    } else if (sem === 3) {
      plan.push(mk(sem, 'Skills', 'Deepen into target-role skills', `Work toward ${role ? role.title : 'Software Engineer'} required skills.`));
      plan.push(mk(sem, 'Career', 'Refine your career profile', 'Keep skills, projects and certifications updated in your profile.'));
      plan.push(mk(sem, 'Academic', 'Clear backlogs early', 'Resolve any active backlogs before they compound.'));
    } else if (sem === 4) {
      plan.push(mk(sem, 'Skills', 'Reach 8+ relevant skills', 'Add the skills your target role requires.'));
      plan.push(mk(sem, 'Projects', 'Build 3+ solid projects', 'Complete a portfolio of 3+ meaningful projects.'));
      plan.push(mk(sem, 'Placement', 'Attend campus workshops', 'Attend aptitude, GD and interview readiness sessions.'));
    } else if (sem === 5) {
      plan.push(mk(sem, 'Career', 'Secure an internship', 'Gain real-world experience before placement season.'));
      plan.push(mk(sem, 'Placement', 'Start mock interviews', 'Begin practicing with mock interviews and track scores.'));
      plan.push(mk(sem, 'Academic', 'Keep CGPA competitive', `Maintain ≥ ${courseName ? 'your course' : '7.0'} competitive CGPA for placement filters.`));
    } else if (sem === 6) {
      plan.push(mk(sem, 'Placement', 'Prepare for placement season', 'Polish resume, brainstorm stories and practice DSA/aptitude.'));
      plan.push(mk(sem, 'Skills', 'Fill remaining skill gaps', 'Close gaps identified by skill-gap analysis.'));
      plan.push(mk(sem, 'Career', 'Build a strong portfolio', 'Ensure projects and certifications are showcased.'));
    } else if (sem === 7) {
      plan.push(mk(sem, 'Placement', 'Engage with placement drives', 'Apply to eligible drives and track applications.'));
      plan.push(mk(sem, 'Growth', 'Expand professional network', 'Connect with alumni and mentors for referrals and guidance.'));
      plan.push(mk(sem, 'Career', 'Refine interview skills', 'Work on aptitude, technical and soft-skill rounds.'));
    } else if (sem === 8) {
      plan.push(mk(sem, 'Placement', 'Evaluate offers', 'Compare packages, roles and growth before deciding.'));
      plan.push(mk(sem, 'Career', 'Finalise your profile', 'Ensure the profile is complete for future opportunities.'));
      plan.push(mk(sem, 'Growth', 'Plan post-graduation path', 'Decide on placement, higher studies or off-campus options.'));
    }
  }

  // Group by semester.
  return Array.from({ length: 8 }, (_, i) => {
    const semester = i + 1;
    return {
      semester,
      milestones: plan
        .filter((m) => m.semester === semester)
        .map((m) => ({ ...m, source: 'plan' as const })),
    };
  });
}
