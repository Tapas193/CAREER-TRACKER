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
const PlacementDashboard = lazy(() => import('./pages/placement/PlacementDashboard'));
const PlacementDrives = lazy(() => import('./pages/placement/PlacementDrives'));
const PlacementList = lazy(() => import('./pages/placement/PlacementList'));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'));
const StudentAcademics = lazy(() => import('./pages/student/StudentAcademics'));
const StudentBacklogs = lazy(() => import('./pages/student/StudentBacklogs'));
const StudentSkills = lazy(() => import('./pages/student/StudentSkills'));
const StudentCertifications = lazy(() => import('./pages/student/StudentCertifications'));
const StudentProjects = lazy(() => import('./pages/student/StudentProjects'));
const StudentInternships = lazy(() => import('./pages/student/StudentInternships'));
const StudentPlacements = lazy(() => import('./pages/student/StudentPlacements'));
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
          <Route path="/placement" element={<RoleGate panel="placement"><PlacementDashboard /></RoleGate>} />
          <Route path="/placement/drives" element={<RoleGate panel="placement"><PlacementDrives /></RoleGate>} />
          <Route path="/placement/placements" element={<RoleGate panel="placement"><PlacementList /></RoleGate>} />
          <Route path="/student" element={<RoleGate panel="student"><StudentDashboard /></RoleGate>} />
          <Route path="/student/profile" element={<RoleGate panel="student"><StudentProfile /></RoleGate>} />
          <Route path="/student/academics" element={<RoleGate panel="student"><StudentAcademics /></RoleGate>} />
          <Route path="/student/backlogs" element={<RoleGate panel="student"><StudentBacklogs /></RoleGate>} />
          <Route path="/student/skills" element={<RoleGate panel="student"><StudentSkills /></RoleGate>} />
          <Route path="/student/certifications" element={<RoleGate panel="student"><StudentCertifications /></RoleGate>} />
          <Route path="/student/projects" element={<RoleGate panel="student"><StudentProjects /></RoleGate>} />
          <Route path="/student/internships" element={<RoleGate panel="student"><StudentInternships /></RoleGate>} />
          <Route path="/student/placements" element={<RoleGate panel="student"><StudentPlacements /></RoleGate>} />
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
