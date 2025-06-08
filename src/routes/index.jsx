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
const GroupUserAdd = Loadable(lazy(() => import('views/group-user/GroupUserAdd')));
const GroupUserDetail = Loadable(lazy(() => import('views/group-user/GroupUserDetail')));

// User Management
const UserList = Loadable(lazy(() => import('views/user/UserList')));
const UserAdd = Loadable(lazy(() => import('views/user/UserAdd')));

// Customer Management
const CustomerList = Loadable(lazy(() => import('views/customer/CustomerList')));
const CustomerAdd = Loadable(lazy(() => import('views/customer/CustomerAdd')));

function RootLayout() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <MainLayout /> : <MinimalLayout />;
}

function HomePage() {
  const { isAuthenticated, isVerifying, isLoading } = useAuth();
  
  if (isLoading) {
    return null;
  }
  
  if (isVerifying) {
    return <Navigate to="/xac-thuc-otp" />;
  }
  
  return isAuthenticated ? <Dashboard /> : <LoginPage />;
}

function VerifyPageWrapper() {
  const { isVerifying, isLoading } = useAuth();
  
  if (isLoading) {
    return null;
  }
  
  if (!isVerifying) {
    return <Navigate to="/" />;
  }
  
  return <VerifyPage />;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isVerifying, isLoading } = useAuth();
  
  if (isLoading) {
    return null;
  }
  
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
            path: 'nhom-quyen',
            children: [
              {
                index: true,
                element: <GroupUserList />
              },
              {
                path: 'them-moi',
                element: <GroupUserAdd />
              },
              {
                path: ':id',
                element: <GroupUserDetail />
              }
            ]
          },
          {
            path: 'tai-khoan',
            children: [
              {
                index: true,
                element: <UserList />
              },
              {
                path: 'them-moi',
                element: <UserAdd />
              },
              {
                path: ':id',
                element: <UserAdd />
              }
            ]
          },
          {
            path: 'khach-hang',
            children: [
              {
                index: true,
                element: <CustomerList />
              },
              {
                path: 'them-moi',
                element: <CustomerAdd />
              },
              {
                path: ':id',
                element: <CustomerAdd />
              }
            ]
          }
        ]
      }
    ]
  }
], {
  basename: import.meta.env.VITE_APP_BASE_NAME
});

export default router;
