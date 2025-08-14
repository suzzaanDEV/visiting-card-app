import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized, user } = useSelector((state) => state.auth);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);



  // Check if user is blocked
  useEffect(() => {
    const checkUserStatus = async () => {
      if (isAuthenticated && user) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('/api/auth/check-status', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.status === 403) {
            const data = await response.json();
            if (data.code === 'ACCOUNT_DEACTIVATED') {
              setIsBlocked(true);
              // Clear user data
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          }
        } catch (error) {
          console.error('Error checking user status:', error);
        }
      }
      setIsChecking(false);
    };

    checkUserStatus();
  }, [isAuthenticated, user]);

  // Show loading or spinner while checking authentication status
  if (isLoading || !isInitialized || isChecking) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to blocked page if user is blocked
  if (isBlocked) {
    
    return <Navigate to="/blocked" />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    
    return <Navigate to="/login" />;
  }

  // Render children if authenticated and not blocked
  return children;
};

export default ProtectedRoute;
