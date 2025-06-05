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
          title: 'Cung cấp dịch vụ',
          type: 'item',
          url: '/ncc/cung-cap-dich-vu',
          breadcrumbs: true
        },
        {
          id: 'server',
          title: 'Cung cấp Server',
          type: 'item',
          url: '/ncc/cung-cap-server',
          breadcrumbs: true
        },
        {
          id: 'network',
          title: 'Cung cấp mạng', 
          type: 'item',
          url: '/ncc/cung-cap-mang',
          breadcrumbs: true
        }
      ]
    }
  ]
};

export default supplier;
