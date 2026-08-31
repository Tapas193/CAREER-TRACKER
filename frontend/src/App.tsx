import { lazy, Suspense, ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AppLayout from './layouts/AppLayout';
import type { AuthUser } from './types';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminStudents = lazy(() => import('./pages/admin/AdminStudents'));
const AdminStudentDetail = lazy(() => import('./pages/admin/AdminStudentDetail'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses'));
const AdminSkills = lazy(() => import('./pages/admin/AdminSkills'));
const AdminPlacements = lazy(() => import('./pages/admin/AdminPlacements'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const PlacementDashboard = lazy(() => import('./pages/placement/PlacementDashboard'));
const PlacementDrives = lazy(() => import('./pages/placement/PlacementDrives'));
const PlacementList = lazy(() => import('./pages/placement/PlacementList'));
const PlacementDriveDetail = lazy(() => import('./pages/placement/PlacementDriveDetail'));
const PlacementPipeline = lazy(() => import('./pages/placement/PlacementPipeline'));
const PlacementStudentProfile = lazy(() => import('./pages/placement/PlacementStudentProfile'));
const PlacementReports = lazy(() => import('./pages/placement/PlacementReports'));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const StudentOverview = lazy(() => import('./pages/student/StudentOverview'));
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'));
const StudentAcademics = lazy(() => import('./pages/student/StudentAcademics'));
const StudentBacklogs = lazy(() => import('./pages/student/StudentBacklogs'));
const StudentAcademicProgress = lazy(() => import('./pages/student/StudentAcademicProgress'));
const StudentAttendance = lazy(() => import('./pages/student/StudentAttendance'));
const StudentSkillDevelopment = lazy(() => import('./pages/student/StudentSkillDevelopment'));
const StudentCareerProfile = lazy(() => import('./pages/student/StudentCareerProfile'));
const StudentResumeCenter = lazy(() => import('./pages/student/StudentResumeCenter'));
const StudentAchievements = lazy(() => import('./pages/student/StudentAchievements'));
const StudentCareerGoals = lazy(() => import('./pages/student/StudentCareerGoals'));
const StudentPlacementPreparation = lazy(() => import('./pages/student/StudentPlacementPreparation'));
const StudentNotifications = lazy(() => import('./pages/student/StudentNotifications'));
const StudentSupport = lazy(() => import('./pages/student/StudentSupport'));
const StudentSkills = lazy(() => import('./pages/student/StudentSkills'));
const StudentCertifications = lazy(() => import('./pages/student/StudentCertifications'));
const StudentProjects = lazy(() => import('./pages/student/StudentProjects'));
const StudentInternships = lazy(() => import('./pages/student/StudentInternships'));
const StudentPlacements = lazy(() => import('./pages/student/StudentPlacements'));
const StudentDocumentCenter = lazy(() => import('./pages/student/StudentDocumentCenter'));
const StudentPlacementTracker = lazy(() => import('./pages/student/StudentPlacementTracker'));
const StudentCareerTimeline = lazy(() => import('./pages/student/StudentCareerTimeline'));
const AlumniDashboard = lazy(() => import('./pages/alumni/AlumniDashboard'));
const AlumniProfile = lazy(() => import('./pages/alumni/AlumniProfile'));
const AlumniCareer = lazy(() => import('./pages/alumni/AlumniCareer'));
const AlumniFeedback = lazy(() => import('./pages/alumni/AlumniFeedback'));

const homeFor = (u: AuthUser): string => {
  if (u.role === 'STUDENT') {
    return u.currentStatus === 'ALUMNI' ? '/alumni' : '/student';
  }
  if (u.role === 'PLACEMENT_HEAD') return '/placement';
  if (u.role === 'ADMIN') return '/admin';
  return '/login';
};

function Loading() {
  return <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">Loading...</div>;
}

type Panel = 'admin' | 'placement' | 'student' | 'alumni';

function RoleGate({ children, panel }: { children: ReactNode; panel: Panel }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;

  const isAlumni = user.role === 'STUDENT' && user.currentStatus === 'ALUMNI';
  const role = user.role;

  if (panel === 'admin' || panel === 'placement') {
    const required = panel === 'admin' ? 'ADMIN' : 'PLACEMENT_HEAD';
    if (role !== required) {
      // Alumni must land on /alumni, not /student, even when blocked from admin/placement
      return <Navigate to={homeFor(user)} replace />;
    }
    return <>{children}</>;
  }

  // panel is student or alumni -> only STUDENT role
  if (role !== 'STUDENT') return <Navigate to={homeFor(user)} replace />;

  if (panel === 'student' && isAlumni) return <Navigate to="/alumni" replace />;
  if (panel === 'alumni' && !isAlumni) return <Navigate to="/student" replace />;
  return <>{children}</>;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homeFor(user)} replace />;
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RootRedirect />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/admin" element={<RoleGate panel="admin"><AdminDashboard /></RoleGate>} />
          <Route path="/admin/students" element={<RoleGate panel="admin"><AdminStudents /></RoleGate>} />
          <Route path="/admin/students/:id" element={<RoleGate panel="admin"><AdminStudentDetail /></RoleGate>} />
          <Route path="/admin/users" element={<RoleGate panel="admin"><AdminUsers /></RoleGate>} />
          <Route path="/admin/courses" element={<RoleGate panel="admin"><AdminCourses /></RoleGate>} />
          <Route path="/admin/skills" element={<RoleGate panel="admin"><AdminSkills /></RoleGate>} />
          <Route path="/admin/placements" element={<RoleGate panel="admin"><AdminPlacements /></RoleGate>} />
          <Route path="/admin/reports" element={<RoleGate panel="admin"><AdminReports /></RoleGate>} />
          <Route path="/placement" element={<RoleGate panel="placement"><PlacementDashboard /></RoleGate>} />
          <Route path="/placement/drives" element={<RoleGate panel="placement"><PlacementDrives /></RoleGate>} />
          <Route path="/placement/drive-detail" element={<RoleGate panel="placement"><PlacementDriveDetail /></RoleGate>} />
          <Route path="/placement/pipeline" element={<RoleGate panel="placement"><PlacementPipeline /></RoleGate>} />
          <Route path="/placement/student-profiles" element={<RoleGate panel="placement"><PlacementStudentProfile /></RoleGate>} />
          <Route path="/placement/reports" element={<RoleGate panel="placement"><PlacementReports /></RoleGate>} />
          <Route path="/placement/placements" element={<RoleGate panel="placement"><PlacementList /></RoleGate>} />
          <Route path="/student" element={<RoleGate panel="student"><StudentDashboard /></RoleGate>} />
          <Route path="/student/overview" element={<RoleGate panel="student"><StudentOverview /></RoleGate>} />
          <Route path="/student/profile" element={<RoleGate panel="student"><StudentProfile /></RoleGate>} />
          <Route path="/student/academics" element={<RoleGate panel="student"><StudentAcademics /></RoleGate>} />
          <Route path="/student/backlogs" element={<RoleGate panel="student"><StudentBacklogs /></RoleGate>} />
          <Route path="/student/academic-progress" element={<RoleGate panel="student"><StudentAcademicProgress /></RoleGate>} />
          <Route path="/student/attendance" element={<RoleGate panel="student"><StudentAttendance /></RoleGate>} />
          <Route path="/student/skill-development" element={<RoleGate panel="student"><StudentSkillDevelopment /></RoleGate>} />
          <Route path="/student/career-profile" element={<RoleGate panel="student"><StudentCareerProfile /></RoleGate>} />
          <Route path="/student/resume" element={<RoleGate panel="student"><StudentResumeCenter /></RoleGate>} />
          <Route path="/student/achievements" element={<RoleGate panel="student"><StudentAchievements /></RoleGate>} />
          <Route path="/student/career-goals" element={<RoleGate panel="student"><StudentCareerGoals /></RoleGate>} />
          <Route path="/student/placement-preparation" element={<RoleGate panel="student"><StudentPlacementPreparation /></RoleGate>} />
          <Route path="/student/notifications" element={<RoleGate panel="student"><StudentNotifications /></RoleGate>} />
          <Route path="/student/support" element={<RoleGate panel="student"><StudentSupport /></RoleGate>} />
          <Route path="/student/skills" element={<RoleGate panel="student"><StudentSkills /></RoleGate>} />
          <Route path="/student/certifications" element={<RoleGate panel="student"><StudentCertifications /></RoleGate>} />
          <Route path="/student/projects" element={<RoleGate panel="student"><StudentProjects /></RoleGate>} />
          <Route path="/student/internships" element={<RoleGate panel="student"><StudentInternships /></RoleGate>} />
          <Route path="/student/placements" element={<RoleGate panel="student"><StudentPlacements /></RoleGate>} />
          <Route path="/student/tracker" element={<RoleGate panel="student"><StudentPlacementTracker /></RoleGate>} />
          <Route path="/student/documents" element={<RoleGate panel="student"><StudentDocumentCenter /></RoleGate>} />
          <Route path="/student/timeline" element={<RoleGate panel="student"><StudentCareerTimeline /></RoleGate>} />
          <Route path="/alumni" element={<RoleGate panel="alumni"><AlumniDashboard /></RoleGate>} />
          <Route path="/alumni/profile" element={<RoleGate panel="alumni"><AlumniProfile /></RoleGate>} />
          <Route path="/alumni/career" element={<RoleGate panel="alumni"><AlumniCareer /></RoleGate>} />
          <Route path="/alumni/feedback" element={<RoleGate panel="alumni"><AlumniFeedback /></RoleGate>} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout />;
}
