import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import ROLE_API from '../services/roleService';

export default function usePermissions() {
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      const response = await ROLE_API.getRoles();
      if (response.data.success) {
        setPermissions(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách quyền');
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permissionId) => {
    if (isLoading) return true;
    return permissions.some(permission => permission.permission_id === permissionId);
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return {
    hasPermission
  };
} 