import { IconWorldUp } from '@tabler/icons-react';

const icons = { IconWorldUp };

const ipWhitelist = {
  id: 'ip-whitelist',
  type: 'group',
  children: [
    {
      id: 'default',
      title: 'Danh sách IP',
      type: 'item',
      url: '/danh-sach-ip',
      icon: icons.IconWorldUp,
      breadcrumbs: true
    }
  ]
};

export default ipWhitelist;
