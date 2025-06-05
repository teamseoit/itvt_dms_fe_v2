import { lazy } from 'react';

import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';

const LoginPage = Loadable(lazy(() => import('views/auth/authentication/Login')));
const VerifyPage = Loadable(lazy(() => import('views/verify/Verify')));

const AuthenticationRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: '/dang-nhap',
      element: <LoginPage />
    },
    {
      path: '/xac-thuc-otp',
      element: <VerifyPage />
    }
  ]
};

export default AuthenticationRoutes;
