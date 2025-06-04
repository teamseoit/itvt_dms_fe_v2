import { IconDashboard } from '@tabler/icons-react';

const icons = { IconDashboard };

const dashboard = {
  id: 'dashboard',
  type: 'group',
  children: [
    {
      id: 'default',
      title: 'Tổng quát',
      type: 'item',
      url: '/',
      icon: icons.IconDashboard,
      breadcrumbs: true
    }
  ]
};

export default dashboard;
