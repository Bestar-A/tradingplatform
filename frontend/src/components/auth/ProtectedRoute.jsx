import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Check for token in localStorage
  const token = localStorage.getItem('token');

  if (!isAuthenticated && !token) {
    // Redirect to login but save the attempted URL
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If we have a token but aren't authenticated, let the auth process complete
  // if (!isAuthenticated && token) {
  //   // You might want to add a loading state here
  //   return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  // }

  return children;
};

export default ProtectedRoute;