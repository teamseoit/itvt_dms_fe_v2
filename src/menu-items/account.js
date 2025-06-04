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
          id: 'user',
          title: 'Tài khoản',
          type: 'item',
          url: '/trang-chu/danh-sach-tai-khoan',
          breadcrumbs: true
        },
        {
          id: 'role',
          title: 'Nhóm quyền', 
          type: 'item',
          url: '/trang-chu/danh-sach-nhom-quyen',
          breadcrumbs: true
        }
      ]
    }
  ]
};

export default account;
