import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from 'contexts/AuthContext';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isVerifying } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isVerifying) {
    return <Navigate to="/xac-thuc-otp" replace />;
  }

  return children;
};

PublicRoute.propTypes = {
  children: PropTypes.node
};

export default PublicRoute; 