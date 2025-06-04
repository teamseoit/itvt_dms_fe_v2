import { IconContract } from '@tabler/icons-react';

const icons = { IconContract };

const contract = {
  id: 'contract',
  type: 'group',
  children: [
    {
      id: 'default',
      title: 'Hợp đồng',
      type: 'item',
      url: '/hop-dong',
      icon: icons.IconContract,
      breadcrumbs: true
    }
  ]
};

export default contract;
