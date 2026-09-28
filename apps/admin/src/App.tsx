import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/admin-auth-context';
import { AdminLayout } from './components/AdminLayout';
import { DashboardPage } from './pages/Dashboard';
import { EditorPage } from './pages/Editor';
import { ArticlesPage } from './pages/Articles';
import { MediaPage } from './pages/Media';
import { CommentsPage } from './pages/Comments';
import { SubscribersPage } from './pages/Subscribers';
import { SettingsPage } from './pages/Settings';
import { ProfilePage } from './pages/Profile';
import { ChannelsPage } from './pages/Channels';
import { ChannelDetailPage } from './pages/ChannelDetail';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { ForgotPasswordPage } from './pages/ForgotPassword';

function ProtectedAdminRoutes() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-slate-400 text-xs">
        Authenticating staff credentials...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/comments" element={<CommentsPage />} />
        <Route path="/subscribers" element={<SubscribersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/channels" element={<ChannelsPage />} />
        <Route path="/channels/:channelId" element={<ChannelDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminLayout>
  );
}

export function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter basename="/admin">
        <Routes>
          {/* Standalone Authentication routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/forget-password" element={<ForgotPasswordPage />} />

          {/* Protected CMS workspace */}
          <Route path="/*" element={<ProtectedAdminRoutes />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}
