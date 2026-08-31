import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AuthInitializer from './components/Auth/AuthInitializer';
import AccountBlocked from './components/Auth/AccountBlocked';
import AdminRoute from './components/Admin/AdminRoute';
import ErrorBoundary from './components/ui/ErrorBoundary';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import VerifyEmail from './pages/Auth/VerifyEmail';
import ViewCard from './pages/ViewCard';
import AboutPage from './pages/AboutPage';
import Contact from './pages/Contact';
import NotFoundPage from './pages/NotFoundPage';
import AdminLogin from './pages/Admin/AdminLogin';
import PolicyPage from './pages/PolicyPage';
import MaintenancePage from './pages/MaintenancePage';
import CookieConsent from './components/ui/CookieConsent';
import PolicyAgreement from './components/ui/PolicyAgreement';
import MaintenanceGuard from './components/Auth/MaintenanceGuard';
import BrandLoader from './components/ui/BrandLoader';

const PageLoader = () => (
  <div className="min-h-[50vh]">
    <BrandLoader label="Loading page…" />
  </div>
);

const lazyPage = (factory) => lazy(factory);

const DashboardPage = lazyPage(() => import('./pages/Dashboard/DashboardPage'));
const CardsPage = lazyPage(() => import('./pages/Cards/CardsPage'));
const AddCard = lazyPage(() => import('./pages/Cards/AddCard'));
const EditCard = lazyPage(() => import('./pages/Cards/EditCard'));
const DiscoverCards = lazyPage(() => import('./pages/Cards/DiscoverCards'));
const PopularCards = lazyPage(() => import('./pages/Cards/PopularCards'));
const RecentCards = lazyPage(() => import('./pages/Cards/RecentCards'));
const SearchPage = lazyPage(() => import('./pages/SearchPage'));
const LibraryPage = lazyPage(() => import('./pages/Library/LibraryPage'));
const ProfilePage = lazyPage(() => import('./pages/Profile/ProfilePage'));
const AdminDashboard = lazyPage(() => import('./pages/Admin/AdminDashboard'));
const TemplateManagement = lazyPage(() => import('./pages/Admin/TemplateManagement'));
const AnalyticsDashboard = lazyPage(() => import('./pages/Admin/AnalyticsDashboard'));
const TemplateBuilder = lazyPage(() => import('./pages/Admin/TemplateBuilder'));
const UserManagement = lazyPage(() => import('./pages/Admin/UserManagement'));
const CardManagement = lazyPage(() => import('./pages/Admin/CardManagement'));
const AccessRequests = lazyPage(() => import('./pages/Admin/AccessRequests'));
const Settings = lazyPage(() => import('./pages/Admin/Settings'));
const PolicyManagement = lazyPage(() => import('./pages/Admin/PolicyManagement'));
const CRMPage = lazyPage(() => import('./pages/Admin/CRMPage'));
const AuditLogPage = lazyPage(() => import('./pages/Admin/AuditLogPage'));
const CategoryManagement = lazyPage(() => import('./pages/Admin/CategoryManagement'));
const UserAccessRequests = lazyPage(() => import('./pages/User/AccessRequests'));
const Notifications = lazyPage(() => import('./pages/User/Notifications'));
const BroadcastManagement = lazyPage(() => import('./pages/Admin/BroadcastManagement'));
const NotificationTemplateManagement = lazyPage(() => import('./pages/Admin/NotificationTemplateManagement'));
const AdminProfile = lazyPage(() => import('./pages/Admin/AdminProfile'));
const AdminNotifications = lazyPage(() => import('./pages/Admin/AdminNotifications'));

const withSuspense = (element) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>{element}</Suspense>
  </ErrorBoundary>
);

function App() {
  return (
    <AuthInitializer>
      <MaintenanceGuard>
        <div className="App">
          <Routes>
            <Route index element={<LandingPage />} />
            <Route path="/" element={<Layout />}>
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<Contact />} />
              <Route path="privacy" element={<PolicyPage slug="privacy-policy" />} />
              <Route path="terms" element={<PolicyPage slug="terms-of-service" />} />
              <Route path="cookie-policy" element={<PolicyPage slug="cookie-policy" />} />
              <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="verify-email" element={<VerifyEmail />} />
            <Route path="view/:cardId" element={<ViewCard />} />
            <Route path="c/:shortLink" element={<ViewCard />} />
            <Route path="discover" element={withSuspense(<DiscoverCards />)} />
            <Route path="discover/popular" element={withSuspense(<PopularCards />)} />
            <Route path="discover/recent" element={withSuspense(<RecentCards />)} />

            <Route path="dashboard" element={<ProtectedRoute>{withSuspense(<DashboardPage />)}</ProtectedRoute>} />
            <Route path="cards" element={<ProtectedRoute>{withSuspense(<CardsPage />)}</ProtectedRoute>} />
            <Route path="cards/add" element={<ProtectedRoute>{withSuspense(<AddCard />)}</ProtectedRoute>} />
            <Route path="create" element={<ProtectedRoute>{withSuspense(<AddCard />)}</ProtectedRoute>} />
            <Route path="cards/edit/:cardId" element={<ProtectedRoute>{withSuspense(<EditCard />)}</ProtectedRoute>} />
            <Route path="search" element={withSuspense(<SearchPage />)} />
            <Route path="library" element={<ProtectedRoute>{withSuspense(<LibraryPage />)}</ProtectedRoute>} />
            <Route path="access-requests" element={<ProtectedRoute>{withSuspense(<UserAccessRequests />)}</ProtectedRoute>} />
            <Route path="notifications" element={<ProtectedRoute>{withSuspense(<Notifications />)}</ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute>{withSuspense(<ProfilePage />)}</ProtectedRoute>} />
          </Route>

          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin" element={<AdminRoute>{withSuspense(<AdminDashboard />)}</AdminRoute>} />
          <Route path="admin/dashboard" element={<AdminRoute>{withSuspense(<AdminDashboard />)}</AdminRoute>} />
          <Route path="admin/templates" element={<AdminRoute>{withSuspense(<TemplateManagement />)}</AdminRoute>} />
          <Route path="admin/templates/builder" element={<AdminRoute>{withSuspense(<TemplateBuilder />)}</AdminRoute>} />
          <Route path="admin/cards" element={<AdminRoute>{withSuspense(<CardManagement />)}</AdminRoute>} />
          <Route path="admin/access-requests" element={<AdminRoute>{withSuspense(<AccessRequests />)}</AdminRoute>} />
          <Route path="admin/analytics" element={<AdminRoute>{withSuspense(<AnalyticsDashboard />)}</AdminRoute>} />
          <Route path="admin/users" element={<AdminRoute>{withSuspense(<UserManagement />)}</AdminRoute>} />
          <Route path="admin/settings" element={<AdminRoute>{withSuspense(<Settings />)}</AdminRoute>} />
          <Route path="admin/policies" element={<AdminRoute>{withSuspense(<PolicyManagement />)}</AdminRoute>} />
          <Route path="admin/crm" element={<AdminRoute>{withSuspense(<CRMPage />)}</AdminRoute>} />
          <Route path="admin/audit" element={<AdminRoute>{withSuspense(<AuditLogPage />)}</AdminRoute>} />
          <Route path="admin/categories" element={<AdminRoute>{withSuspense(<CategoryManagement />)}</AdminRoute>} />
          <Route path="admin/broadcasts" element={<AdminRoute>{withSuspense(<BroadcastManagement />)}</AdminRoute>} />
          <Route path="admin/notification-templates" element={<AdminRoute>{withSuspense(<NotificationTemplateManagement />)}</AdminRoute>} />
          <Route path="admin/notifications" element={<AdminRoute>{withSuspense(<AdminNotifications />)}</AdminRoute>} />
          <Route path="admin/profile" element={<AdminRoute>{withSuspense(<AdminProfile />)}</AdminRoute>} />

          <Route path="blocked" element={<AccountBlocked />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <CookieConsent />
        <PolicyAgreement />
      </div>
      </MaintenanceGuard>
    </AuthInitializer>
  );
}

export default App;
