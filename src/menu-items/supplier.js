import { IconBrandSuperhuman } from '@tabler/icons-react';

const icons = { IconBrandSuperhuman };

const supplier = {
  id: 'supplier',
  type: 'group',
  children: [
    {
      id: 'supplier-collapse',
      title: 'Nhà cung cấp',
      type: 'collapse',
      icon: icons.IconBrandSuperhuman,
      children: [
        {
          id: 'service',
          title: 'Dịch vụ',
          type: 'item',
          url: '/ncc/dich-vu',
          breadcrumbs: true
        },
        {
          id: 'server',
          title: 'Server',
          type: 'item',
          url: '/ncc/server',
          breadcrumbs: true
        },
        {
          id: 'network',
          title: 'Mạng', 
          type: 'item',
          url: '/ncc/mang',
          breadcrumbs: true
        }
      ]
    }
  ]
};

export default supplier;
