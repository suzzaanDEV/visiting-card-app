import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus } from '../../features/auth/authThunks';
import { setInitialized } from '../../features/auth/authSlice';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { isLoading, isAuthenticated, isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if there's a token in localStorage
    const token = localStorage.getItem('token');
    
    if (token && !isAuthenticated) {
      // If token exists and user is not authenticated, validate it with the backend
      dispatch(checkAuthStatus());
    } else if (!token && !isInitialized) {
      // If no token and not initialized, mark as initialized
      dispatch(setInitialized());
    }
  }, [dispatch, isAuthenticated, isInitialized]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthInitializer; 