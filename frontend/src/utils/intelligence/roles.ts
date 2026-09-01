// Deterministic role -> skill taxonomy used by the Skill Gap Analysis, Smart
// Company Recommendations and Learning Recommendations features. This is a
// static skill taxonomy (common industry expectations), NOT fabricated student
// or company data. It enables explainable, deterministic matching.

export interface TargetRole {
  id: string;
  title: string;
  summary: string;
  requiredSkills: string[];
  preferredSkills: string[];
  sampleCompanies: string[];
}

export const TARGET_ROLES: TargetRole[] = [
  {
    id: 'swe',
    title: 'Software Engineer',
    summary: 'Design, build and maintain software applications.',
    requiredSkills: ['Java', 'Python', 'Data Structures', 'Algorithms', 'SQL', 'Git', 'Operating Systems', 'DBMS'],
    preferredSkills: ['System Design', 'Docker', 'REST APIs', 'JavaScript', 'AWS'],
    sampleCompanies: ['TCS', 'Infosys', 'Wipro', 'Accenture'],
  },
  {
    id: 'frontend',
    title: 'Frontend Developer',
    summary: 'Build responsive and accessible user interfaces.',
    requiredSkills: ['JavaScript', 'HTML', 'CSS', 'React'],
    preferredSkills: ['TypeScript', 'Redux', 'Testing', 'Performance Optimization', 'Git'],
    sampleCompanies: ['Cognizant', 'Mindtree', 'Tech Mahindra'],
  },
  {
    id: 'fullstack',
    title: 'Full Stack Developer',
    summary: 'Work across frontend and backend systems.',
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'SQL', 'REST APIs'],
    preferredSkills: ['TypeScript', 'MongoDB', 'Docker', 'AWS', 'System Design'],
    sampleCompanies: ['TCS', 'Infosys', 'Wipro'],
  },
  {
    id: 'data',
    title: 'Data Analyst',
    summary: 'Analyse data to support business decisions.',
    requiredSkills: ['SQL', 'Excel', 'Python', 'Statistics'],
    preferredSkills: ['Data Visualization', 'Power BI', 'Tableau', 'Machine Learning', 'Pandas'],
    sampleCompanies: ['Deloitte', 'Accenture', 'Capgemini'],
  },
  {
    id: 'ds',
    title: 'Data Scientist',
    summary: 'Build models to extract insight from data.',
    requiredSkills: ['Python', 'Statistics', 'Machine Learning', 'SQL', 'Pandas'],
    preferredSkills: ['Deep Learning', 'TensorFlow', 'NLP', 'Data Visualization', 'Docker'],
    sampleCompanies: ['Deloitte', 'Accenture', 'Infosys'],
  },
  {
    id: 'devops',
    title: 'DevOps Engineer',
    summary: 'Automate and manage deployment infrastructure.',
    requiredSkills: ['Linux', 'Docker', 'Git', 'CI/CD', 'Networking'],
    preferredSkills: ['Kubernetes', 'AWS', 'Terraform', 'Bash', 'Monitoring'],
    sampleCompanies: ['Amazon', 'Microsoft', 'Wipro'],
  },
];

const skillAliases: Record<string, string[]> = {
  Java: ['core java', 'java'],
  Python: ['python'],
  'Data Structures': ['dsa', 'data structures and algorithms', 'data structures'],
  Algorithms: ['algorithms', 'algorithm', 'dsa'],
  SQL: ['sql', 'mysql', 'sql server', 'postgresql', 'postgres', 'database'],
  Git: ['git', 'github', 'git/github'],
  'Operating Systems': ['operating system', 'os'],
  DBMS: ['dbms', 'database management system'],
  JavaScript: ['javascript', 'js', 'node'],
  HTML: ['html'],
  CSS: ['css', 'tailwind', 'bootstrap'],
  React: ['react', 'reactjs', 'react.js'],
  TypeScript: ['typescript', 'ts'],
  Redux: ['redux'],
  Testing: ['testing', 'jest', 'unit testing', 'selenium'],
  'Performance Optimization': ['performance', 'optimization'],
  'Node.js': ['node.js', 'nodejs', 'node'],
  'REST APIs': ['rest api', 'rest apis', 'rest', 'api'],
  MongoDB: ['mongodb', 'mongo'],
  Docker: ['docker'],
  AWS: ['aws', 'amazon web services'],
  'System Design': ['system design'],
  Excel: ['excel', 'ms excel'],
  Statistics: ['statistics', 'stats', 'probability'],
  'Data Visualization': ['data visualization', 'visualization', 'data viz'],
  'Power BI': ['power bi', 'powerbi'],
  Tableau: ['tableau'],
  'Machine Learning': ['machine learning', 'ml'],
  Pandas: ['pandas'],
  'Deep Learning': ['deep learning', 'dl'],
  TensorFlow: ['tensorflow'],
  NLP: ['nlp', 'natural language processing'],
  Linux: ['linux', 'unix'],
  'CI/CD': ['ci/cd', 'cicd', 'jenkins'],
  Networking: ['computer networks', 'networking', 'cn'],
  Kubernetes: ['kubernetes', 'k8s'],
  Terraform: ['terraform'],
  Bash: ['bash', 'shell'],
  Monitoring: ['monitoring', 'grafana', 'prometheus'],
};

const aliasToSkill = new Map<string, string>();
for (const [canonical, aliases] of Object.entries(skillAliases)) {
  aliasToSkill.set(canonical.toLowerCase(), canonical);
  for (const a of aliases) aliasToSkill.set(a.toLowerCase(), canonical);
}

export function normalizeSkill(name: string): string {
  const key = name.trim().toLowerCase();
  return aliasToSkill.get(key) || name.trim();
}

export function matchSkill(studentSkill: string, targetSkills: string[]): boolean {
  const normalized = normalizeSkill(studentSkill).toLowerCase();
  return targetSkills.some((t) => t.toLowerCase() === normalized);
}

export function getRole(roleId: string): TargetRole | undefined {
  return TARGET_ROLES.find((r) => r.id === roleId);
}

export function defaultRole(roleId?: string): TargetRole {
  return getRole(roleId || 'swe') || TARGET_ROLES[0];
}
