import { IconUserCircle } from '@tabler/icons-react';

const icons = { IconUserCircle };

const account = {
  id: 'user-management',
  type: 'group',
  children: [
    {
      id: 'user-collapse',
      title: 'Quản lý tài khoản',
      type: 'collapse',
      icon: icons.IconUserCircle,
      children: [
        {
          id: 'role',
          title: 'Nhóm quyền', 
          type: 'item',
          url: '/nhom-quyen',
          breadcrumbs: true
        },
        {
          id: 'user',
          title: 'Tài khoản',
          type: 'item',
          url: '/tai-khoan',
          breadcrumbs: true
        }
      ]
    }
  ]
};

export default account;
