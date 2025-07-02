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

// IP Whitelist Management
const IpWhitelistList = Loadable(lazy(() => import('views/ip-whitelist/IpWhitelistList')));

// Supplier Management
const ServiceSupplierList = Loadable(lazy(() => import('views/supplier/service/ServiceSupplierList')));
const ServiceSupplierAdd = Loadable(lazy(() => import('views/supplier/service/ServiceSupplierAdd')));
const ServerSupplierList = Loadable(lazy(() => import('views/supplier/server/ServerSupplierList')));
const ServerSupplierAdd = Loadable(lazy(() => import('views/supplier/server/ServerSupplierAdd')));
const NetworkSupplierList = Loadable(lazy(() => import('views/supplier/network/NetworkSupplierList')));
const NetworkSupplierAdd = Loadable(lazy(() => import('views/supplier/network/NetworkSupplierAdd')));

// Plan Service Management
const DomainPlanList = Loadable(lazy(() => import('views/plans/domain/DomainPlanList.jsx')));
const DomainPlanAdd = Loadable(lazy(() => import('views/plans/domain/DomainPlanAdd.jsx')));
const HostingPlanList = Loadable(lazy(() => import('views/plans/hosting/HostingPlanList.jsx')));
const HostingPlanAdd = Loadable(lazy(() => import('views/plans/hosting/HostingPlanAdd.jsx')));
const EmailPlanList = Loadable(lazy(() => import('views/plans/email/EmailPlanList.jsx')));
const EmailPlanAdd = Loadable(lazy(() => import('views/plans/email/EmailPlanAdd.jsx')));
const SSLPlanList = Loadable(lazy(() => import('views/plans/ssl/SSLPlanList.jsx')));
const SSLPlanAdd = Loadable(lazy(() => import('views/plans/ssl/SSLPlanAdd.jsx')));
const ContentPlanList = Loadable(lazy(() => import('views/plans/content/ContentPlanList.jsx')));
const ContentPlanAdd = Loadable(lazy(() => import('views/plans/content/ContentPlanAdd.jsx')));
const ToplistPlanList = Loadable(lazy(() => import('views/plans/toplist/ToplistPlanList.jsx')));
const ToplistPlanAdd = Loadable(lazy(() => import('views/plans/toplist/ToplistPlanAdd.jsx')));
const MaintenancePlanList = Loadable(lazy(() => import('views/plans/maintenance/MaintenancePlanList.jsx')));
const MaintenancePlanAdd = Loadable(lazy(() => import('views/plans/maintenance/MaintenancePlanAdd.jsx')));
const NetworkPlanList = Loadable(lazy(() => import('views/plans/network/NetworkPlanList.jsx')));
const NetworkPlanAdd = Loadable(lazy(() => import('views/plans/network/NetworkPlanAdd.jsx')));
const ServerPlanList = Loadable(lazy(() => import('views/plans/server/ServerPlanList.jsx')));
const ServerPlanAdd = Loadable(lazy(() => import('views/plans/server/ServerPlanAdd.jsx')));

// Service Management
const DomainServiceList = Loadable(lazy(() => import('views/services/domain/DomainServiceList.jsx')));
const DomainServiceAdd = Loadable(lazy(() => import('views/services/domain/DomainServiceAdd.jsx')));
const HostingServiceList = Loadable(lazy(() => import('views/services/hosting/HostingServiceList.jsx')));
const HostingServiceAdd = Loadable(lazy(() => import('views/services/hosting/HostingServiceAdd.jsx')));
const EmailServiceList = Loadable(lazy(() => import('views/services/email/EmailServiceList.jsx')));
const EmailServiceAdd = Loadable(lazy(() => import('views/services/email/EmailServiceAdd.jsx')));
const SslServiceList = Loadable(lazy(() => import('views/services/ssl/SslServiceList.jsx')));
const SslServiceAdd = Loadable(lazy(() => import('views/services/ssl/SslServiceAdd.jsx')));

// Contract Management
const ContractList = Loadable(lazy(() => import('views/contract/ContractList.jsx')));
const ContractUpdate = Loadable(lazy(() => import('views/contract/ContractUpdate.jsx')));

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
            path: 'danh-sach-ip',
            element: <IpWhitelistList />
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
          },
          {
            path: 'goi-dich-vu',
            children: [
              {
                path: 'ten-mien',
                element: <DomainPlanList />
              },
              {
                path: 'ten-mien/them-moi',
                element: <DomainPlanAdd />
              },
              {
                path: 'ten-mien/:id',
                element: <DomainPlanAdd />
              },
              {
                path: 'hosting',
                element: <HostingPlanList />
              },
              {
                path: 'hosting/them-moi',
                element: <HostingPlanAdd />
              },
              {
                path: 'hosting/:id',
                element: <HostingPlanAdd />
              },
              {
                path: 'email',
                element: <EmailPlanList />
              },
              {
                path: 'email/them-moi',
                element: <EmailPlanAdd />
              },
              {
                path: 'email/:id',
                element: <EmailPlanAdd />
              },
              {
                path: 'ssl',
                element: <SSLPlanList />
              },
              {
                path: 'ssl/them-moi',
                element: <SSLPlanAdd />
              },
              {
                path: 'ssl/:id',
                element: <SSLPlanAdd />
              },
              {
                path: 'viet-bai-content',
                element: <ContentPlanList />
              },
              {
                path: 'viet-bai-content/them-moi',
                element: <ContentPlanAdd />
              },
              {
                path: 'viet-bai-content/:id',
                element: <ContentPlanAdd />
              },
              {
                path: 'toplist-vung-tau',
                element: <ToplistPlanList />
              },
              {
                path: 'toplist-vung-tau/them-moi',
                element: <ToplistPlanAdd />
              },
              {
                path: 'toplist-vung-tau/:id',
                element: <ToplistPlanAdd />
              },
              {
                path: 'bao-tri',
                element: <MaintenancePlanList />
              },
              {
                path: 'bao-tri/them-moi',
                element: <MaintenancePlanAdd />
              },
              {
                path: 'bao-tri/:id',
                element: <MaintenancePlanAdd />
              },
              {
                path: 'nha-mang',
                element: <NetworkPlanList />
              },
              {
                path: 'nha-mang/them-moi',
                element: <NetworkPlanAdd />
              },
              {
                path: 'nha-mang/:id',
                element: <NetworkPlanAdd />
              },
              {
                path: 'server',
                element: <ServerPlanList />
              },
              {
                path: 'server/them-moi',
                element: <ServerPlanAdd />
              },
              {
                path: 'server/:id',
                element: <ServerPlanAdd />
              },
            ]
          },
          {
            path: 'dich-vu',
            children: [
              {
                path: 'ten-mien',
                element: <DomainServiceList />
              },
              {
                path: 'ten-mien/them-moi',
                element: <DomainServiceAdd />
              },
              {
                path: 'ten-mien/:id',
                element: <DomainServiceAdd />
              },
              {
                path: 'hosting',
                element: <HostingServiceList />
              },
              {
                path: 'hosting/them-moi',
                element: <HostingServiceAdd />
              },
              {
                path: 'hosting/:id',
                element: <HostingServiceAdd />
              },
              {
                path: 'email',
                element: <EmailServiceList />
              },
              {
                path: 'email/them-moi',
                element: <EmailServiceAdd />
              },
              {
                path: 'email/:id',
                element: <EmailServiceAdd />
              },
              {
                path: 'ssl',
                element: <SslServiceList />
              },
              {
                path: 'ssl/them-moi',
                element: <SslServiceAdd />
              },
              {
                path: 'ssl/:id',
                element: <SslServiceAdd />
              }
            ]
          },
          {
            path: 'hop-dong',
            element: <ContractList />
          },
          {
            path: 'hop-dong/:id',
            element: <ContractUpdate />
          }
        ]
      }
    ]
  }
], {
  basename: import.meta.env.VITE_APP_BASE_NAME
});

export default router;
