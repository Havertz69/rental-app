import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import LoadingSpinner from '../LoadingSpinner';
import { motion } from 'framer-motion';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner text="Verifying authentication..." />;
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0) {
    // Prefer backend-computed user_type if available
    const rawRole = user?.user_type;
    let userRole = null;

    if (rawRole === 'super_admin' || rawRole === 'admin') {
      userRole = 'admin';
    } else if (rawRole === 'tenant' || rawRole === 'user') {
      userRole = 'tenant';
    } else if (user?.is_staff) {
      // Fallback to staff flag if user_type is missing
      userRole = 'admin';
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  // Render children with smooth transition
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default ProtectedRoute;
