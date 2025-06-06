import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from 'contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - localStorage token:', localStorage.getItem('token'));
  console.log('ProtectedRoute - localStorage userInfo:', localStorage.getItem('userInfo'));

  if (!isAuthenticated) {
    console.log('ProtectedRoute - Redirecting to login because not authenticated');
    return <Navigate to="/" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node
};

export default ProtectedRoute; 