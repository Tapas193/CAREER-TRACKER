// Deterministic Learning Recommendations.
// Derives course recommendations from the student's real skill gap and chosen
// target role. The course knowledge base is a static curriculum registry; the
// recommendation logic selects resources only for skills the student is
// actually missing. Completion is tracked in localStorage (client-only).

import { loadStored, saveStored } from './storage';
import { analyzeSkillGap } from './skillGap';
import { defaultRole, TARGET_ROLES } from './roles';

export interface Course {
  id: string;
  title: string;
  provider: string;
  platform: string;
  skill: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  hours: number;
}

const COURSES: Course[] = [
  { id: 'c-dsa', title: 'Data Structures & Algorithms', provider: 'University Course', platform: 'College', skill: 'Data Structures', level: 'Intermediate', hours: 40 },
  { id: 'c-python', title: 'Python for Everyone', provider: 'Coursera', platform: 'Online', skill: 'Python', level: 'Beginner', hours: 20 },
  { id: 'c-java', title: 'Java Programming Masterclass', provider: 'Udemy', platform: 'Online', skill: 'Java', level: 'Beginner', hours: 60 },
  { id: 'c-sql', title: 'SQL for Data Analysis', provider: 'Coursera', platform: 'Online', skill: 'SQL', level: 'Beginner', hours: 15 },
  { id: 'c-react', title: 'React - The Complete Guide', provider: 'Udemy', platform: 'Online', skill: 'React', level: 'Intermediate', hours: 50 },
  { id: 'c-js', title: 'JavaScript from Scratch', provider: 'freeCodeCamp', platform: 'Online', skill: 'JavaScript', level: 'Beginner', hours: 30 },
  { id: 'c-node', title: 'Node.js & Express API Course', provider: 'Udemy', platform: 'Online', skill: 'Node.js', level: 'Intermediate', hours: 25 },
  { id: 'c-rest', title: 'REST API Design & Integration', provider: 'Coursera', platform: 'Online', skill: 'REST APIs', level: 'Intermediate', hours: 12 },
  { id: 'c-ml', title: 'Machine Learning Specialization', provider: 'Coursera', platform: 'Online', skill: 'Machine Learning', level: 'Intermediate', hours: 45 },
  { id: 'c-pandas', title: 'Data Analysis with Python & Pandas', provider: 'Coursera', platform: 'Online', skill: 'Pandas', level: 'Intermediate', hours: 18 },
  { id: 'c-docker', title: 'Docker for Beginners', provider: 'Udemy', platform: 'Online', skill: 'Docker', level: 'Beginner', hours: 10 },
  { id: 'c-aws', title: 'AWS Cloud Practitioner', provider: 'AWS', platform: 'Online', skill: 'AWS', level: 'Beginner', hours: 15 },
  { id: 'c-git', title: 'Git & GitHub Basics', provider: 'Atlassian', platform: 'Online', skill: 'Git', level: 'Beginner', hours: 6 },
  { id: 'c-linux', title: 'Linux Command Line Fundamentals', provider: 'Coursera', platform: 'Online', skill: 'Linux', level: 'Beginner', hours: 12 },
  { id: 'c-stat', title: 'Statistics & Probability for Data', provider: 'Khan Academy', platform: 'Online', skill: 'Statistics', level: 'Beginner', hours: 20 },
  { id: 'c-system', title: 'System Design Primer', provider: 'Community', platform: 'Online', skill: 'System Design', level: 'Advanced', hours: 30 },
];

export function courseForSkill(skill: string): Course | undefined {
  return COURSES.find((c) => c.skill.toLowerCase() === skill.toLowerCase());
}

export interface Recommendation {
  course: Course;
  reason: string;
  required: boolean;
}

export function getLearningRecommendations(skillsRaw: any[] | undefined, roleId?: string): Recommendation[] {
  const role = defaultRole(roleId);
  const gap = analyzeSkillGap(skillsRaw, role);

  const recs: Recommendation[] = [];

  for (const skill of gap.missingRequired) {
    const course = courseForSkill(skill);
    if (course) recs.push({ course, reason: `Required for ${role.title} — you are missing this skill.`, required: true });
  }
  for (const skill of gap.missingPreferred) {
    const course = courseForSkill(skill);
    if (course && !recs.some((r) => r.course.skill === skill)) {
      recs.push({ course, reason: `Preferred for ${role.title} — adding it improves your fit.`, required: false });
    }
  }
  return recs;
}

export function getAllRolesForPicker(): typeof TARGET_ROLES {
  return TARGET_ROLES;
}

interface LearningState {
  courses: { courseId: string; done: boolean; addedAt: string }[];
}

const KEY = 'learning-progress';

export function loadLearningState(courseIds: string[]): LearningState {
  const state = loadStored<LearningState>(KEY, { courses: [] });
  // Ensure every recommended course has a stub so completion can be toggled.
  const ids = state.courses.map((c) => c.courseId);
  for (const id of courseIds) {
    if (!ids.includes(id)) {
      state.courses.push({ courseId: id, done: false, addedAt: new Date().toISOString() });
    }
  }
  return state;
}

export function toggleCourseDone(courseId: string, done: boolean): LearningState {
  const state = loadLearningState([]);
  const found = state.courses.find((c) => c.courseId === courseId);
  if (found) found.done = done;
  else state.courses.push({ courseId, done, addedAt: new Date().toISOString() });
  saveStored(KEY, state);
  return state;
}
