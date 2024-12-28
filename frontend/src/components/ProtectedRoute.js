import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';

const ProtectedRoute = ({ isAuthenticated, user, loading, children }) => {
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/user" state={{ from: location.pathname }} replace />;
  }

  return children;
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  user: state.auth.user,
  loading: state.auth.loading
});

export default connect(mapStateToProps)(ProtectedRoute);