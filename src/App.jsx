import { RouterProvider } from 'react-router-dom';

import router from 'routes';

import NavigationScroll from 'layout/NavigationScroll';

import ThemeCustomization from 'themes';

export default function App() {
  return (
    <ThemeCustomization>
      <NavigationScroll>
        <>
          <RouterProvider router={router} />
        </>
      </NavigationScroll>
    </ThemeCustomization>
  );
}
