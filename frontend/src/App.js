import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Pages
import LoginPage from './pages/Login';
import Layout from './components/Layout';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import ImportData from './pages/admin/ImportData';
import TeamsManagement from './pages/admin/Teams';
import MentorsManagement from './pages/admin/Mentors';
import Mapping from './pages/admin/Mapping';
import RoundMapping from './pages/admin/RoundMapping';
import EvaluationMonitoring from './pages/admin/EvaluationMonitoring';
import EmailComposer from './pages/admin/EmailComposer';
import ReleaseResults from './pages/admin/ReleaseResults';
import AdminSettings from './pages/admin/Settings';

// Mentor
import MentorDashboard from './pages/mentor/Dashboard';
import MentorEvaluation from './pages/mentor/Evaluation';

// Team
import TeamDashboard from './pages/team/Dashboard';
import TeamSubmissions from './pages/team/Submissions';
import TeamResults from './pages/team/Results';
import RubricsSimple from './pages/team/RubricsSimple';

// Shared
import ChatPage from './pages/shared/ChatPage';
import Leaderboard from './pages/shared/Leaderboard';
import Rubrics from './pages/shared/Rubrics';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'mentor') return <Navigate to="/mentor" replace />;
    return <Navigate to="/team" replace />;
  }
  
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'mentor') return <Navigate to="/mentor" replace />;
    return <Navigate to="/team" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="import" element={<ImportData />} />
            <Route path="teams" element={<TeamsManagement />} />
            <Route path="mentors" element={<MentorsManagement />} />
            <Route path="round-mapping" element={<RoundMapping />} />
            <Route path="evaluations" element={<EvaluationMonitoring />} />
            <Route path="rubrics" element={<Rubrics />} />
            <Route path="email" element={<EmailComposer />} />
            <Route path="chat" element={<ChatPage isAdmin={true} />} />
            <Route path="release" element={<ReleaseResults />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="leaderboard" element={<Leaderboard />} />
          </Route>

          {/* Mentor Routes */}
          <Route path="/mentor" element={<ProtectedRoute allowedRoles={['mentor']}><Layout /></ProtectedRoute>}>
            <Route index element={<MentorDashboard />} />
            <Route path="evaluations" element={<MentorEvaluation />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="rubrics" element={<Rubrics />} />
            <Route path="leaderboard" element={<Leaderboard />} />
          </Route>

          {/* Team Routes */}
          <Route path="/team" element={<ProtectedRoute allowedRoles={['team']}><Layout /></ProtectedRoute>}>
            <Route index element={<TeamDashboard />} />
            <Route path="submissions" element={<TeamSubmissions />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="results" element={<TeamResults />} />
            <Route path="rubrics" element={<RubricsSimple />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
