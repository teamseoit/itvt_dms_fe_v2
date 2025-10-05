import { IconServerBolt } from '@tabler/icons-react';
import { IconPlaylistAdd } from '@tabler/icons-react';

const icons = { IconServerBolt, IconPlaylistAdd };

const service = {
  id: 'service',
  title: 'Quản lý dịch vụ',
  type: 'group',
  children: [
    {
      id: 'plan-service-collapse',
      title: 'Gói dịch vụ',
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
          url: '/goi-dich-vu/viet-bai-content',
          breadcrumbs: true
        },
        {
          id: 'toplist',
          title: 'Toplist Vũng Tàu',
          type: 'item',
          url: '/goi-dich-vu/toplist-vung-tau',
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
    },
    {
      id: 'service-collapse',
      title: 'Dịch vụ',
      type: 'collapse',
      icon: icons.IconServerBolt,
      children: [
        {
          id: 'domain',
          title: 'Tên miền',
          type: 'item',
          url: '/dich-vu/ten-mien',
          breadcrumbs: true
        },
        {
          id: 'hosting',
          title: 'Hosting', 
          type: 'item',
          url: '/dich-vu/hosting',
          breadcrumbs: true
        },
        {
          id: 'email',
          title: 'Email',
          type: 'item',
          url: '/dich-vu/email',
          breadcrumbs: true
        },
        {
          id: 'ssl',
          title: 'SSL',
          type: 'item',
          url: '/dich-vu/ssl',
          breadcrumbs: true
        },
        {
          id: 'website',
          title: 'Thiết kế website',
          type: 'item',
          url: '/dich-vu/thiet-ke-website',
          breadcrumbs: true
        },
        // {
        //   id: 'content',
        //   title: 'Viết bài Content & PR',
        //   type: 'item',
        //   url: '/dich-vu/viet-bai-content',
        //   breadcrumbs: true
        // },
        // {
        //   id: 'toplist',
        //   title: 'Toplist Vũng Tàu',
        //   type: 'item',
        //   url: '/dich-vu/toplist-vung-tau',
        //   breadcrumbs: true
        // },
        // {
        //   id: 'maintenance',
        //   title: 'Bảo trì',
        //   type: 'item',
        //   url: '/dich-vu/bao-tri',
        //   breadcrumbs: true
        // },
        // {
        //   id: 'server',
        //   title: 'Server',
        //   type: 'item',
        //   url: '/dich-vu/server',
        //   breadcrumbs: true
        // },
        // {
        //   id: 'network',
        //   title: 'Nhà mạng',
        //   type: 'item',
        //   url: '/dich-vu/nha-mang',
        //   breadcrumbs: true
        // }
      ]
    }
  ]
};

export default service;
