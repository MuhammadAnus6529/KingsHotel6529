import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isAdminRoute }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Agar user logged in nahi hai
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Agar admin page access karne ki koshish ho rahi hai lekin user customer hai
  if (isAdminRoute && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;