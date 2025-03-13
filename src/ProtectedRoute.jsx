import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const user = useSelector(state => state.user);
  
  if (!user.isLoggedIn) {
    return <Navigate to="/auth" replace state={{ from: window.location.pathname }} />;
  }
  
  return children;
};

export default ProtectedRoute;