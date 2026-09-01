// Deterministic Mock Interview engine.
// Provides standard technical + behavioral + HR question banks and a self-scored
// interview flow. Attempt history is persisted to localStorage (client-only,
// clearly marked "not synced to server").

import { loadStored, saveStored } from './storage';

export interface MockQuestion {
  id: string;
  category: 'Technical' | 'Behavioral' | 'HR';
  question: string;
  optimalPoints: string[];
}

const TECHNICAL: MockQuestion[] = [
  { id: 't1', category: 'Technical', question: 'Explain time and space complexity. When would you choose an array over a linked list?', optimalPoints: ['Big-O concept', 'Array: O(1) index access, contiguous', 'Linked list: easier insertion/deletion', 'Cache locality trade-off'] },
  { id: 't2', category: 'Technical', question: 'Difference between SQL and NoSQL databases. When would you pick each?', optimalPoints: ['SQL: structured, ACID, relations', 'NoSQL: flexible schema, scale-out', 'Use case comparison'] },
  { id: 't3', category: 'Technical', question: 'What is a REST API? List the common HTTP methods and their use.', optimalPoints: ['Representational state transfer', 'GET/POST/PUT/PATCH/DELETE', 'Statelessness, resources & endpoints'] },
  { id: 't4', category: 'Technical', question: 'Explain Object-Oriented Programming pillars with a short example.', optimalPoints: ['Encapsulation, inheritance, polymorphism, abstraction', 'Real-world example', 'Benefits'] },
  { id: 't5', category: 'Technical', question: 'What is Git and how do you resolve a merge conflict?', optimalPoints: ['Version control', 'Branches & commits', 'Identify conflict markers, resolve, commit'] },
  { id: 't6', category: 'Technical', question: 'How would you find the second-largest number in an array?', optimalPoints: ['Single pass O(n)', 'Track max and secondMax', 'Edge cases: duplicates, small arrays'] },
];

const DATA_TECH: MockQuestion[] = [
  { id: 'd1', category: 'Technical', question: 'What is the difference between structured and unstructured data?', optimalPoints: ['Defined schema vs flexible', 'Examples', 'Analytics implications'] },
  { id: 'd2', category: 'Technical', question: 'Explain primary key vs foreign key with an example.', optimalPoints: ['Uniquely identifies row (PK)', 'References another table (FK)', 'Relational integrity'] },
  { id: 'd3', category: 'Technical', question: 'What does an inner join do vs a left join?', optimalPoints: ['Only matching rows (inner)', 'All left rows + matches (left)', 'Result-set size difference'] },
];

const BEHAVIORAL: MockQuestion[] = [
  { id: 'b1', category: 'Behavioral', question: 'Tell me about a time you worked in a team to solve a problem.', optimalPoints: ['Situation', 'Task', 'Action', 'Result (STAR)'] },
  { id: 'b2', category: 'Behavioral', question: 'Describe a project you are proud of and your contribution.', optimalPoints: ['Clear role', 'Technical + outcome', 'What you learned'] },
  { id: 'b3', category: 'Behavioral', question: 'How do you handle a tight deadline or pressure?', optimalPoints: ['Prioritisation', 'Communication', 'Calm approach'] },
];

const HR: MockQuestion[] = [
  { id: 'h1', category: 'HR', question: 'Walk me through your resume and background.', optimalPoints: ['Concise story', 'Education', 'Key experience & strengths'] },
  { id: 'h2', category: 'HR', question: 'Where do you see yourself in 3-5 years?', optimalPoints: ['Career vision', 'Skill growth', 'Aligned with role'] },
  { id: 'h3', category: 'HR', question: 'Do you have any questions for us?', optimalPoints: ['Thoughtful questions', 'Shows interest', 'About role/team/growth'] },
];

export function buildQuestionBank(roleCategory: 'software' | 'data' = 'software'): MockQuestion[] {
  const tech = roleCategory === 'data' ? DATA_TECH : TECHNICAL;
  return [...tech, ...BEHAVIORAL, ...HR];
}

export interface MockAttempt {
  id: string;
  date: string; // ISO
  roleId: string;
  score: number; // 0-100
  total: number;
  answers: { questionId: string; answer: string; pointsEarned: number }[];
}

export interface MockState {
  attempts: MockAttempt[];
}

const KEY = 'mock-interviews';

export function loadMockState(): MockState {
  return loadStored<MockState>(KEY, { attempts: [] });
}

export function saveMockAttempt(
  roleId: string,
  answers: { questionId: string; answer: string; pointsEarned: number }[],
  total: number
): MockAttempt {
  const state = loadMockState();
  const earned = answers.reduce((s, a) => s + a.pointsEarned, 0);
  const score = total ? Math.round((earned / total) * 100) : 0;
  const attempt: MockAttempt = {
    id: Date.now().toString(36),
    date: new Date().toISOString(),
    roleId,
    score,
    total,
    answers,
  };
  state.attempts.push(attempt);
  saveStored(KEY, state);
  return attempt;
}

export function resetMockState(): void {
  saveStored<MockState>(KEY, { attempts: [] });
}

// Deterministic per-question self-scoring rubric (0-3 points per answer length,
// capped at question max).
export function pointsForAnswer(charCount: number): { points: number; max: number } {
  if (charCount < 20) return { points: 0, max: 3 };
  if (charCount < 80) return { points: 1, max: 3 };
  if (charCount < 200) return { points: 2, max: 3 };
  return { points: 3, max: 3 };
}
