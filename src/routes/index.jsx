import { createBrowserRouter } from 'react-router-dom';

import AuthenticationRoutes from './AuthenticationRoutes';
import MainRoutes from './MainRoutes';

const router = createBrowserRouter([MainRoutes, AuthenticationRoutes], {
  basename: import.meta.env.VITE_APP_BASE_NAME
});

export default router;
