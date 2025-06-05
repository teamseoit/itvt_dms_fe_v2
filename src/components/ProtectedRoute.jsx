import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from 'contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node
};

export default ProtectedRoute; 