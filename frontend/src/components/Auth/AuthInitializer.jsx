import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus } from '../../features/auth/authThunks';
import { hydrateFromStorage, setInitialized } from '../../features/auth/authSlice';
import { getToken } from '../../utils/authStorage';
import BrandLoader from '../ui/BrandLoader';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((state) => state.auth);
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

  // Gate only on the one-time boot flag. auth.isLoading is also flipped by
  // background thunks (avatar upload, stats…), and blanking the whole app for
  // those made every profile-picture change show a full-screen spinner.
  if (!isInitialized) {
    return <BrandLoader full />;
  }

  return children;
};

export default AuthInitializer;