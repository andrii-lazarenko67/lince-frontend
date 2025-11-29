import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../hooks';

interface PrivateRouteProps {
  allowedRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const { token, user } = useAppSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
