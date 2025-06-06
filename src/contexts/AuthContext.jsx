import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from 'api/axios';

const AuthContext = createContext(null);

const TOKEN_EXPIRY_DAYS = 7;

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userInfoStr = localStorage.getItem('userInfo');
    
    if (token && userInfoStr) {
      const tokenExpiry = localStorage.getItem('tokenExpiry');
      
      if (tokenExpiry && new Date().getTime() < parseInt(tokenExpiry)) {
        setIsAuthenticated(true);
        setUserInfo(JSON.parse(userInfoStr));
      } else {
        handleLogout();
      }
    }
  }, []);

  const startVerification = (user_info) => {
    setIsVerifying(true);
    setUserInfo(user_info);
    navigate('/xac-thuc-otp');
  };

  const completeVerification = (authData) => {
    const { token, refresh_token, role, user_info } = authData;
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + TOKEN_EXPIRY_DAYS);
    
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpiry', expiryDate.getTime().toString());
    localStorage.setItem('userInfo', JSON.stringify(user_info));
    
    setIsVerifying(false);
    setIsAuthenticated(true);
    setUserInfo(user_info);
    
    navigate('/');
  };

  const login = (user_info) => {
    startVerification(user_info);
  };

  const handleLogout = async () => {
    const confirmLogout = () => {
      toast.warn(
        <div>
          <p>Bạn có chắc chắn muốn đăng xuất?</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button 
              onClick={() => toast.dismiss()} 
              style={{ 
                padding: '6px 12px', 
                background: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Hủy
            </button>
            <button 
              onClick={async () => {
                try {
                  await axiosInstance.post('/auth/logout', {
                    user_id: userInfo._id
                  });
                  
                  localStorage.removeItem('token');
                  localStorage.removeItem('refreshToken'); 
                  localStorage.removeItem('tokenExpiry');
                  localStorage.removeItem('userInfo');
                  setIsAuthenticated(false);
                  setIsVerifying(false);
                  setUserInfo(null);
                  toast.dismiss();
                  navigate('/');
                  toast.success('Đăng xuất thành công!');
                } catch (error) {
                  toast.error(error.response?.data?.message || 'Lỗi khi đăng xuất');
                }
              }}
              style={{ 
                padding: '6px 12px', 
                background: '#dc3545', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          closeButton: false
        }
      );
    };

    confirmLogout();
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        isVerifying, 
        userInfo, 
        login, 
        logout: handleLogout, 
        completeVerification,
        startVerification 
      }}
    >
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
    throw new Error('useAuth phải được sử dụng trong phạm vi của AuthProvider');
  }
  return context;
}; 