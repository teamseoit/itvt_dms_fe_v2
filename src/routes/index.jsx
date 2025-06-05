import { createBrowserRouter, Outlet } from 'react-router-dom';
import { AuthProvider } from 'contexts/AuthContext';
import NavigationScroll from 'layout/NavigationScroll';

import AuthenticationRoutes from './AuthenticationRoutes';
import MainRoutes from './MainRoutes';

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <NavigationScroll>
          <Outlet />
        </NavigationScroll>
      </AuthProvider>
    ),
    children: [MainRoutes, AuthenticationRoutes]
  }
], {
  basename: import.meta.env.VITE_APP_BASE_NAME
});

export default router;
