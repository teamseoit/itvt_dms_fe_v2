import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [userId, setUserId] = useState(null);

  const startVerification = () => {
    setIsVerifying(true);
  };

  const completeVerification = () => {
    setIsVerifying(false);
    setIsAuthenticated(true);
  };

  const login = (id) => {
    setUserId(id);
    startVerification();
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsVerifying(false);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isVerifying, userId, login, logout, completeVerification }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 