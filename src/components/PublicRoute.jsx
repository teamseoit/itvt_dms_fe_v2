import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from 'contexts/AuthContext';

const PublicRoute = ({ children }) => {
  const { userId, isVerifying } = useAuth();

  if (userId) {
    if (isVerifying) {
      return <Navigate to="/xac-thuc-otp" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

PublicRoute.propTypes = {
  children: PropTypes.node
};

export default PublicRoute; 