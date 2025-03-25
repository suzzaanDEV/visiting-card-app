import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  // Get admin user from localStorage
  const adminUser = localStorage.getItem('adminUser');
  const adminToken = localStorage.getItem('adminToken');
  
  // Check if admin is authenticated
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // Check if user is admin
  const isAdmin = adminUser && JSON.parse(adminUser).role === 'admin';
  
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
    
  return children;
};

export default AdminRoute; 