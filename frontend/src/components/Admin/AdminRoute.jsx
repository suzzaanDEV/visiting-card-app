import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  // Bypass auth in development mode
  if (import.meta.env.DEV) {
    return children;
  }

  // Get admin user from localStorage
  const adminUser = localStorage.getItem('adminUser');
  const adminToken = localStorage.getItem('adminToken');
  
  // Check if admin is authenticated
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // Check if user is admin
  let parsedAdminUser = null;
  try {
    parsedAdminUser = adminUser ? JSON.parse(adminUser) : null;
  } catch {
    return <Navigate to="/admin/login" replace />;
  }

  const isAdmin = parsedAdminUser && (parsedAdminUser.role === 'admin' || parsedAdminUser.role === 'super_admin');
  
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
    
  return children;
};

export default AdminRoute; 