export type Role = 'ADMIN' | 'STUDENT' | 'PLACEMENT_HEAD';

export interface User {
  id: number;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  phone?: string | null;
  role: Role;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  studentId?: number | null;
}

export interface AuthUser {
  userId: number;
  email: string;
  role: Role;
  studentId: number | null;
  currentStatus?: 'ADMITTED' | 'ACTIVE' | 'ON_PLACEMENT' | 'GRADUATED' | 'ALUMNI' | null;
  graduationStatus?: 'IN_PROGRESS' | 'GRADUATED' | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: { path?: string; message: string }[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
}

export interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  department: string;
  degree: string;
  durationYears: number;
  totalSemesters: number;
}

export interface Student {
  id: number;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  enrollmentNo: string;
  rollNumber: string;
  admissionNo: string;
  admissionYear: number;
  expectedYear: number;
  currentSemester: number;
  currentStatus: 'ADMITTED' | 'ACTIVE' | 'ON_PLACEMENT' | 'GRADUATED' | 'ALUMNI';
  graduationStatus: 'IN_PROGRESS' | 'GRADUATED';
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  address?: string | null;
  courseId: number;
  course?: Course;
  user?: User | null;
  academicRecords?: AcademicRecord[];
  backlogs?: Backlog[];
  skills?: StudentSkill[];
  certifications?: Certification[];
  projects?: Project[];
  internships?: Internship[];
  placements?: Placement[];
  careerHistory?: CareerHistory[];
  alumniFeedback?: AlumniFeedback[];
}

export interface AcademicRecord {
  id: number;
  studentId: number;
  semester: number;
  academicYear: number;
  sgpa: number | string;
  cgpa: number | string;
  creditsEarned: number | string;
  totalCredits: number | string;
  resultStatus: 'PASS' | 'FAIL';
}

export interface Backlog {
  id: number;
  studentId: number;
  attemptedNo: number;
  semester: number;
  subject: string;
  status: string;
  clearedDate?: string | null;
  attemptedAgain?: boolean;
}

export interface Skill {
  id: number;
  skillName: string;
  category?: string | null;
}

export interface StudentSkill {
  studentId: number;
  skillId: number;
  skill?: Skill;
}

export interface Certification {
  id: number;
  studentId: number;
  certificationName: string;
  issuingOrganisation: string;
  issuingDate: string;
  expiryDate?: string | null;
  certificationUrl?: string | null;
}

export interface Project {
  id: number;
  studentId: number;
  projectTitle: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  technologyUsed?: string | null;
  projectUrl?: string | null;
  teamSize: number;
}

export interface Internship {
  id: number;
  studentId: number;
  companyName: string;
  role: string;
  startDate: string;
  endDate?: string | null;
  stipend?: number | string | null;
  certificateUrl?: string | null;
}

export type PlacementStatus = 'APPLIED' | 'IN_PROGRESS' | 'SELECTED' | 'REJECTED' | 'OFFER_RECEIVED';
export type RoundType = 'APPLICATION' | 'APTITUDE' | 'TECHNICAL' | 'INTERVIEW_HR';
export type RoundResult = 'PENDING' | 'PASS' | 'FAIL' | 'SELECTED' | 'REJECTED';

export interface RoundFeedback {
  id: number;
  placementRoundId: number;
  rating: number;
  feedbackDate: string;
  comments?: string | null;
}

export interface PlacementRound {
  id: number;
  placementId: number;
  roundNumber: number;
  roundType: RoundType;
  roundDate: string;
  result: RoundResult;
  remark?: string | null;
  feedback?: RoundFeedback | null;
}

export interface OfferLetter {
  id: number;
  placementId: number;
  companyName: string;
  packageLpa: number | string;
  offerDate: string;
  joiningDate?: string | null;
  designation?: string | null;
  location?: string | null;
  documentUrl?: string | null;
}

export interface Placement {
  id: number;
  companyName: string;
  jobRole: string;
  placementDate: string;
  packageLpa: number | string;
  placementStatus: PlacementStatus;
  location?: string | null;
  studentId: number;
  student?: Student;
  rounds?: PlacementRound[];
  offerLetter?: OfferLetter | null;
}

export interface CareerHistory {
  id: number;
  studentId: number;
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate?: string | null;
  role?: string | null;
  location?: string | null;
  currentJob: boolean;
}

export interface AlumniFeedback {
  id: number;
  studentId: number;
  rating: number;
  comment?: string | null;
  feedback?: string | null;
  feedbackDate: string;
}

export type PreparationResourceType = 'YOUTUBE' | 'ARTICLE' | 'PDF' | 'DOCUMENT' | 'PRACTICE' | 'OTHER';
export type PreparationDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface PreparationResource {
  id: number;
  title: string;
  description?: string | null;
  category: string;
  topic: string;
  resourceType: PreparationResourceType;
  url: string;
  thumbnailUrl?: string | null;
  duration?: string | null;
  difficulty?: PreparationDifficulty | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
