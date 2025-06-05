import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from 'contexts/AuthContext';

const VerifyRoute = ({ children }) => {
  const { isVerifying } = useAuth();

  if (!isVerifying) {
    return <Navigate to="/dang-nhap" replace />;
  }

  return children;
};

VerifyRoute.propTypes = {
  children: PropTypes.node
};

export default VerifyRoute; 