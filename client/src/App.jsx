import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ExploreProjectsPage from './pages/ExploreProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import CreateEditProjectPage from './pages/CreateEditProjectPage';
import MyProjectsPage from './pages/MyProjectsPage';
import MyTeamsPage from './pages/MyTeamsPage';
import ResourceHubPage from './pages/ResourceHubPage';
import TaskBoardPage from './pages/TaskBoardPage';
import DiscussionsPage from './pages/DiscussionsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] text-xs text-slate-400">
        Loading workspace session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] text-xs text-slate-400">
        Authenticating administrative privileges...
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#172B4D',
              color: '#fff',
              fontSize: '12px',
              borderRadius: '8px',
            },
          }}
        />
        <Routes>
          {/* Public Layout Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Authenticated Workspace AppLayout Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/explore" element={<ExploreProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
            <Route path="/projects/create" element={<CreateEditProjectPage />} />
            <Route path="/projects/edit/:id" element={<CreateEditProjectPage />} />
            <Route path="/my-projects" element={<MyProjectsPage />} />
            <Route path="/teams" element={<MyTeamsPage />} />
            <Route path="/resources" element={<ResourceHubPage />} />
            <Route path="/tasks" element={<TaskBoardPage />} />
            <Route path="/discussions" element={<DiscussionsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin Route */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
