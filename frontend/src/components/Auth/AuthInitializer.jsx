import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus } from '../../features/auth/authThunks';
import { hydrateFromStorage, setInitialized } from '../../features/auth/authSlice';
import { getToken } from '../../utils/authStorage';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { isLoading, isInitialized } = useSelector((state) => state.auth);
  const hasBootstrapped = useRef(false);

  useEffect(() => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    dispatch(hydrateFromStorage());

    const token = getToken();
    if (token) {
      dispatch(checkAuthStatus());
    } else {
      dispatch(setInitialized());
    }
  }, [dispatch]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-green-900 flex items-center justify-center">
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
