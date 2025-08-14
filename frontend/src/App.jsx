import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AuthInitializer from './components/Auth/AuthInitializer';
import AccountBlocked from './components/Auth/AccountBlocked';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import CardsPage from './pages/Cards/CardsPage';
import AddCard from './pages/Cards/AddCard';
import EditCard from './pages/Cards/EditCard';
import CardDetail from './pages/Cards/CardDetail';
import DiscoverCards from './pages/Cards/DiscoverCards';
import PopularCards from './pages/Cards/PopularCards';
import RecentCards from './pages/Cards/RecentCards';
import SearchPage from './pages/SearchPage';
import ViewCard from './pages/ViewCard';
import LibraryPage from './pages/Library/LibraryPage';
import ProfilePage from './pages/Profile/ProfilePage';
import AboutPage from './pages/AboutPage';
import Contact from './pages/Contact';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import TemplateManagement from './pages/Admin/TemplateManagement';
import AnalyticsDashboard from './pages/Admin/AnalyticsDashboard';
import TemplateBuilder from './pages/Admin/TemplateBuilder';
import UserManagement from './pages/Admin/UserManagement';
import CardManagement from './pages/Admin/CardManagement';
import AccessRequests from './pages/Admin/AccessRequests';
import Settings from './pages/Admin/Settings';
import UserAccessRequests from './pages/User/AccessRequests';
import Notifications from './pages/User/Notifications';
import AdminRoute from './components/Admin/AdminRoute';
import TestCardFeatures from './components/TestCardFeatures';

function App() {

  const [isLoading, setIsLoading] = useState(false);

  // Add loading state management
  useEffect(() => {
    setIsLoading(true);
    // Simulate loading time
    setTimeout(() => setIsLoading(false), 1000);
  }, []);
  
  return (
    <AuthInitializer>
      <div className="App">
        <Routes>
          {/* Public Routes with Layout */}
          <Route index element={<HomePage />} />
          <Route path="/" element={<Layout />}>
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="view/:cardId" element={<ViewCard />} />
            <Route path="c/:shortLink" element={<ViewCard />} />
            <Route path="test-features" element={<TestCardFeatures />} />
            <Route path="discover" element={<DiscoverCards />} />
            <Route path="discover/popular" element={<PopularCards />} />
            <Route path="discover/recent" element={<RecentCards />} />
            
            {/* Protected User Routes */}
            <Route path="dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="cards" element={
              <ProtectedRoute>
                <CardsPage />
              </ProtectedRoute>
            } />
            <Route path="cards/add" element={
              <ProtectedRoute>
                <AddCard />
              </ProtectedRoute>
            } />
            <Route path="create" element={
              <ProtectedRoute>
                <AddCard />
              </ProtectedRoute>
            } />
            <Route path="cards/edit/:cardId" element={
              <ProtectedRoute>
                <EditCard />
              </ProtectedRoute>
            } />
            <Route path="cards/:cardId" element={
              <ProtectedRoute>
                <CardDetail />
              </ProtectedRoute>
            } />
            <Route path="search" element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            } />
            <Route path="library" element={
              <ProtectedRoute>
                <LibraryPage />
              </ProtectedRoute>
            } />

            <Route path="access-requests" element={
              <ProtectedRoute>
                <UserAccessRequests />
              </ProtectedRoute>
            } />

            <Route path="notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />

            <Route path="profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Admin Routes */}
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="admin/templates" element={
            <AdminRoute>
              <TemplateManagement />
            </AdminRoute>
          } />
          <Route path="admin/templates/builder" element={
            <AdminRoute>
              <TemplateBuilder />
            </AdminRoute>
          } />
          <Route path="admin/cards" element={
            <AdminRoute>
              <CardManagement />
            </AdminRoute>
          } />
          <Route path="admin/access-requests" element={
            <AdminRoute>
              <AccessRequests />
            </AdminRoute>
          } />
          <Route path="admin/analytics" element={
            <AdminRoute>
              <AnalyticsDashboard />
            </AdminRoute>
          } />
          <Route path="admin/users" element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          } />
          <Route path="admin/settings" element={
            <AdminRoute>
              <Settings />
            </AdminRoute>
          } />

          {/* Account Blocked Route */}
          <Route path="blocked" element={<AccountBlocked />} />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </AuthInitializer>
  );
}

export default App;
