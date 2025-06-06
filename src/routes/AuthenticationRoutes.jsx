import { lazy } from 'react';

import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';
import VerifyRoute from 'components/VerifyRoute';
import PublicRoute from 'components/PublicRoute';

const LoginPage = Loadable(lazy(() => import('views/auth/authentication/Login')));
const VerifyPage = Loadable(lazy(() => import('views/verify/Verify')));

const AuthenticationRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: '/',
      element: (
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      )
    },
    {
      path: '/xac-thuc-otp',
      element: (
        <VerifyRoute>
          <VerifyPage />
        </VerifyRoute>
      )
    }
  ]
};

export default AuthenticationRoutes;
