import { IconBrandSketch } from '@tabler/icons-react';

const icons = { IconBrandSketch };

const itvt = {
  id: 'itvt-service',
  title: 'Quản lý dịch vụ ITVT',
  type: 'group',
  children: [
    {
      id: 'itvt-service-collapse',
      title: 'Dịch vụ ITVT',
      type: 'collapse',
      icon: icons.IconBrandSketch,
      children: [
        {
          id: 'domain',
          title: 'Tên miền',
          type: 'item',
          url: '/itvt-dich-vu/ten-mien',
          breadcrumbs: true
        },
        {
          id: 'hosting',
          title: 'Hosting', 
          type: 'item',
          url: '/itvt-dich-vu/hosting',
          breadcrumbs: true
        },
        {
          id: 'email',
          title: 'Email',
          type: 'item',
          url: '/itvt-dich-vu/email',
          breadcrumbs: true
        },
        {
          id: 'ssl',
          title: 'SSL',
          type: 'item',
          url: '/itvt-dich-vu/ssl',
          breadcrumbs: true
        }
      ]
    }
  ]
};

export default itvt;
