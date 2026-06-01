import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DevelopersPage from './pages/DevelopersPage';
import PastRecruiters from './pages/PastRecruiters';
import DashboardShell from './components/DashboardShell';
import StudentDashboard from './components/StudentDashboard';
import CompanyDashboard from './components/CompanyDashboard';
import AdminDashboard from './components/AdminDashboard';
import ManageAnnouncements from './components/ManageAnnouncements';
import CompanyVerificationQueue from './components/CompanyVerificationQueue';
import StudentCalendarUpdate from './components/StudentCalendarUpdate';
import StudentCalendar from './components/StudentCalendar';
import AdminPowerAssignment from './components/AdminPowerAssignment';
import UserManagement from './components/UserManagement';
import ProtectedRoute from './components/ProtectedRoute';
import StudentVerificationForm from './components/StudentVerificationForm';
import StudentVerificationQueue from './components/StudentVerificationQueue';
import CompanyVerificationForm from './components/CompanyVerificationForm';
import StudentAnnouncements from './components/StudentAnnouncements';
import EditProfile from './pages/EditProfile';
import MyResumes from './pages/MyResumes';
import CompanyEvents from './components/CompanyEvents';
import AdminEventWorkflows from './components/AdminEventWorkflows';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/developers" element={<DevelopersPage />} />
          <Route path="/past-recruiters" element={<PastRecruiters />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardShell />
            </ProtectedRoute>
          }>
            <Route path="student" element={<StudentDashboard />} />
            <Route path="student/verify" element={<StudentVerificationForm />} />
            <Route path="student/announcements" element={<StudentAnnouncements />} />
            <Route path="student/calendar" element={<StudentCalendar />} />
            <Route path="student/resumes" element={<MyResumes />} />
            <Route path="student/profile" element={<EditProfile />} />
            <Route path="student/*" element={<Navigate to="/dashboard/student" replace />} />

            <Route path="company" element={<CompanyDashboard />} />
            <Route path="company/verify" element={<CompanyVerificationForm />} />
            <Route path="company/database" element={<CompanyDashboard />} />
            <Route path="company/events" element={<CompanyEvents />} />
            <Route path="company/profile" element={<EditProfile />} />
            <Route path="company/*" element={<Navigate to="/dashboard/company" replace />} />

            <Route path="admin" element={<AdminDashboard />}>
              <Route path="announcements" element={<ManageAnnouncements />} />
              <Route path="companies" element={<CompanyVerificationQueue />} />
              <Route path="students/verify" element={<StudentVerificationQueue />} />
              <Route path="calendar" element={<StudentCalendarUpdate />} />
              <Route path="event-workflows" element={<AdminEventWorkflows />} />
              <Route path="assign-powers" element={<AdminPowerAssignment />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="profile" element={<EditProfile />} />
              <Route index element={<Navigate to="announcements" replace />} />
            </Route>
            <Route path="admin/*" element={<Navigate to="/dashboard/admin" replace />} />
            {/* Redirect /dashboard to the correct sub-route based on role, handled in DashboardShell */}
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
