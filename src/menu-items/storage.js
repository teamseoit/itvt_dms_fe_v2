import { IconDatabaseCog } from '@tabler/icons-react';

const icons = { IconDatabaseCog };

const storage = {
  id: 'storage',
  type: 'group',
  children: [
    {
      id: 'storage-collapse',
      title: 'Lưu trữ dữ liệu',
      type: 'collapse',
      icon: icons.IconDatabaseCog,
      children: [
        {
          id: 'backup-data',
          title: 'Backup dữ liệu',
          type: 'item',
          url: '/backup-du-lieu',
          breadcrumbs: true
        },
        {
          id: 'action-history',
          title: 'Lịch sử thao tác', 
          type: 'item',
          url: '/lich-su-thao-tac',
          breadcrumbs: true
        }
      ]
    }
  ]
};

export default storage;
