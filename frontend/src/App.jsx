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
import useCursorGlow from './hooks/useCursorGlow';

function App() {
  useCursorGlow();

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

function Placeholder({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-slate-500 animate-[fade-in-up_0.5s_ease-out] dark:text-slate-400">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 dark:bg-slate-800">
        <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
      </div>
      <h2 className="text-xl font-bold text-slate-700 mb-2 dark:text-slate-200">{title}</h2>
      <p className="text-sm dark:text-slate-400">This feature is scheduled for development in the next phase.</p>
    </div>
  );
}
