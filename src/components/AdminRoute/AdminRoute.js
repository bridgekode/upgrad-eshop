import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function AdminRoute({ user, children }) {
  if (!user?.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/products" replace />;
  }

  return children;
}

AdminRoute.propTypes = {
  user: PropTypes.shape({
    isLoggedIn: PropTypes.bool,
    role: PropTypes.string,
  }),
  children: PropTypes.node.isRequired,
};

export default AdminRoute; 