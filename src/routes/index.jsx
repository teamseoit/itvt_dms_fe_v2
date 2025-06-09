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

// Action Log Management
const ActionLogList = Loadable(lazy(() => import('views/action-log/ActionLogList')));

// Supplier Management
const ServiceSupplierList = Loadable(lazy(() => import('views/supplier/service/ServiceSupplierList')));
const ServiceSupplierAdd = Loadable(lazy(() => import('views/supplier/service/ServiceSupplierAdd')));
const ServerSupplierList = Loadable(lazy(() => import('views/supplier/server/ServerSupplierList')));
const ServerSupplierAdd = Loadable(lazy(() => import('views/supplier/server/ServerSupplierAdd')));
const NetworkSupplierList = Loadable(lazy(() => import('views/supplier/network/NetworkSupplierList')));
const NetworkSupplierAdd = Loadable(lazy(() => import('views/supplier/network/NetworkSupplierAdd')));

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
            path: 'lich-su-thao-tac',
            element: <ActionLogList />
          },
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
          },
          {
            path: 'ncc',
            children: [
              {
                path: 'dich-vu',
                element: <ServiceSupplierList />
              },
              {
                path: 'dich-vu/them-moi',
                element: <ServiceSupplierAdd />
              },
              {
                path: 'dich-vu/:id',
                element: <ServiceSupplierAdd />
              },
              {
                path: 'server',
                element: <ServerSupplierList />
              },
              {
                path: 'server/them-moi',
                element: <ServerSupplierAdd />
              },
              {
                path: 'server/:id',
                element: <ServerSupplierAdd />
              },
              {
                path: 'mang',
                element: <NetworkSupplierList />
              },
              {
                path: 'mang/them-moi',
                element: <NetworkSupplierAdd />
              },
              {
                path: 'mang/:id',
                element: <NetworkSupplierAdd />
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
