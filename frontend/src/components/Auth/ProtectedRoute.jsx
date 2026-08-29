import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../services/apiService';
import { clearAuth, getToken } from '../../utils/authStorage';
import BrandLoader from '../ui/BrandLoader';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized, user } = useSelector((state) => state.auth);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isAuthenticated || !user) {
        setIsChecking(false);
        return;
      }

      try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/auth/check-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 403) {
          const data = await response.json();
          if (data.code === 'ACCOUNT_DEACTIVATED') {
            setIsBlocked(true);
            clearAuth();
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      } finally {
        setIsChecking(false);
      }
    };

    if (isInitialized) {
      checkUserStatus();
    }
  }, [isAuthenticated, user, isInitialized]);

  // Only blank while boot/login is deciding an *unauthenticated* redirect.
  // Once a user is authenticated, isLoading (avatar upload, stats refresh…) must
  // never swap the whole protected page for a spinner.
  if (!isInitialized || (!isAuthenticated && isLoading) || isChecking) {
    return <BrandLoader />;
  }

  if (isBlocked) {
    return <Navigate to="/blocked" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
