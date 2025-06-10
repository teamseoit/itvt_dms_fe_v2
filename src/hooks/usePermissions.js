import { useState, useEffect } from 'react';

import ROLE_API from '../services/roleService';

export default function usePermissions() {
  const [permissions, setPermissions] = useState([]);

  const fetchPermissions = async () => {
    try {
      const response = await ROLE_API.getRoles();
      if (response.data.success) {
        setPermissions(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách quyền');
    }
  };

  const hasPermission = (permissionId) => {
    return permissions.some(permission => permission.permission_id === permissionId);
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return {
    hasPermission
  };
} 