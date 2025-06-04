import { IconPlaylistAdd } from '@tabler/icons-react';

const icons = { IconPlaylistAdd };

const planService = {
  id: 'plan-service',
  type: 'group',
  children: [
    {
      id: 'plan-service-collapse',
      title: 'Quản lý gói dịch vụ',
      type: 'collapse',
      icon: icons.IconPlaylistAdd,
      children: [
        {
          id: 'domain',
          title: 'Tên miền',
          type: 'item',
          url: '/goi-dich-vu/ten-mien',
          breadcrumbs: true
        },
        {
          id: 'hosting',
          title: 'Hosting', 
          type: 'item',
          url: '/goi-dich-vu/hosting',
          breadcrumbs: true
        },
        {
          id: 'email',
          title: 'Email',
          type: 'item',
          url: '/goi-dich-vu/email',
          breadcrumbs: true
        },
        {
          id: 'ssl',
          title: 'SSL',
          type: 'item',
          url: '/goi-dich-vu/ssl',
          breadcrumbs: true
        }, 
        {
          id: 'content',
          title: 'Viết bài Content & PR',
          type: 'item',
          url: '/goi-dich-vu/viet-bai-content-pr',
          breadcrumbs: true
        },
        {
          id: 'maintenance',
          title: 'Bảo trì',
          type: 'item',
          url: '/goi-dich-vu/bao-tri',
          breadcrumbs: true
        },
        {
          id: 'server',
          title: 'Server',
          type: 'item',
          url: '/goi-dich-vu/server',
          breadcrumbs: true
        },
        {
          id: 'network',
          title: 'Nhà mạng',
          type: 'item',
          url: '/goi-dich-vu/nha-mang',
          breadcrumbs: true
        }
      ]
    }
  ]
};

export default planService;
