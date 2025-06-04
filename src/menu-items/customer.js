import { IconUsers } from '@tabler/icons-react';

const icons = { IconUsers };

const customer = {
  id: 'customer',
  type: 'group',
  children: [
    {
      id: 'default',
      title: 'Khách hàng',
      type: 'item',
      url: '/khach-hang',
      icon: icons.IconUsers,
      breadcrumbs: true
    }
  ]
};

export default customer;
