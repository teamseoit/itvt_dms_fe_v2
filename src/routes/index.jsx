import { createBrowserRouter, Outlet, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { AuthProvider } from 'contexts/AuthContext';
import NavigationScroll from 'layout/NavigationScroll';
import Loadable from 'ui-component/Loadable';
import MainLayout from 'layout/MainLayout';
import MinimalLayout from 'layout/MinimalLayout';
import { useAuth } from 'contexts/AuthContext';

const LoginPage = Loadable(lazy(() => import('views/auth/authentication/Login')));
const VerifyPage = Loadable(lazy(() => import('views/verify/Verify')));
const Dashboard = Loadable(lazy(() => import('views/dashboard')));

// Group User
const GroupUserList = Loadable(lazy(() => import('views/group-user/GroupUserList')));

function RootLayout() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <MainLayout /> : <MinimalLayout />;
}

function HomePage() {
  const { isAuthenticated, isVerifying } = useAuth();
  
  if (isVerifying) {
    return <Navigate to="/xac-thuc-otp" />;
  }
  
  return isAuthenticated ? <Dashboard /> : <LoginPage />;
}

function VerifyPageWrapper() {
  const { isVerifying } = useAuth();
  
  if (!isVerifying) {
    return <Navigate to="/" />;
  }
  
  return <VerifyPage />;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isVerifying } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  if (isVerifying) {
    return <Navigate to="/xac-thuc-otp" />;
  }
  
  return children;
}

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <NavigationScroll>
          <RootLayout>
            <Outlet />
          </RootLayout>
        </NavigationScroll>
      </AuthProvider>
    ),
    children: [
      {
        path: '/',
        element: <HomePage />
      },
      {
        path: '/xac-thuc-otp',
        element: <VerifyPageWrapper />
      },
      {
        path: '*',
        element: (
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'nhom-quyen/*',
            element: <GroupUserList />
          }
        ]
      }
    ]
  }
], {
  basename: import.meta.env.VITE_APP_BASE_NAME
});

export default router;
