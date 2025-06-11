import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';

import NETWORK_SUPPLIER_API from '../../../services/networkSupplierService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';

export default function NetworkSupplierAdd() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    taxCode: '',
    phone: '',
    email: '',
    website: '',
    supportName: '',
    supportPhone: '',
    address: ''
  });

  const { hasPermission } = usePermissions();

  const fetchNetworkSupplier = async () => {
    try {
      const res = await NETWORK_SUPPLIER_API.getById(id);
      if (res?.data?.success) {
        const networkSupplier = res.data.data;
        setFormData({
          name: networkSupplier.name || '',
          company: networkSupplier.company || '',
          taxCode: networkSupplier.taxCode || '',
          phone: networkSupplier.phone || '',
          email: networkSupplier.email || '',
          website: networkSupplier.website || '',
          supportName: networkSupplier.supportName || '',
          supportPhone: networkSupplier.supportPhone || '',
          address: networkSupplier.address || ''
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tải thông tin nhà cung cấp');
      navigate('/ncc/mang');
    }
  };

  useEffect(() => {
    if (isEdit) fetchNetworkSupplier();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return toast.error('Vui lòng nhập tên nhà cung cấp');
    if (!formData.company.trim()) return toast.error('Vui lòng nhập tên công ty');
    if (!formData.phone) return toast.error('Vui lòng nhập số điện thoại');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEdit && !hasPermission(PERMISSIONS.NETWORK_SUPPLIER.UPDATE)) {
      toast.error('Bạn không có quyền cập nhật nhà cung cấp mạng');
      return;
    }

    if (!isEdit && !hasPermission(PERMISSIONS.NETWORK_SUPPLIER.ADD)) {
      toast.error('Bạn không có quyền thêm nhà cung cấp mạng mới');
      return;
    }

    try {
      setLoading(true);
      const res = isEdit
        ? await NETWORK_SUPPLIER_API.update(id, formData)
        : await NETWORK_SUPPLIER_API.create(formData);

      if (res?.data?.success) {
        toast.success(isEdit ? 'Cập nhật thành công' : 'Thêm mới thành công');
        navigate('/ncc/mang');
      } else {
        toast.error(res?.data?.message || 'Đã có lỗi xảy ra');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate('/ncc/mang');

  const canAdd = !isEdit && hasPermission(PERMISSIONS.NETWORK_SUPPLIER.ADD);
  const canUpdate = isEdit && hasPermission(PERMISSIONS.NETWORK_SUPPLIER.UPDATE);

  if (!canAdd && !canUpdate) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="text"
            color="primary"
            onClick={handleBack}
            startIcon={<IconArrowLeft />}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h3">{isEdit ? 'Cập nhật nhà cung cấp mạng' : 'Thêm nhà cung cấp mạng'}</Typography>
        </Box>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" color="error">
            {isEdit 
              ? 'Bạn không có quyền cập nhật nhà cung cấp mạng!' 
              : 'Bạn không có quyền thêm nhà cung cấp mạng mới!'
            }
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="text"
          color="primary"
          onClick={handleBack}
          startIcon={<IconArrowLeft />}
          sx={{ mr: 2 }}
        >
          Quay lại
        </Button>
        <Typography variant="h3">
          {isEdit ? 'Cập nhật nhà cung cấp mạng' : 'Thêm nhà cung cấp mạng'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {[
            { label: 'Tên nhà cung cấp (*)', name: 'name' },
            { label: 'Công ty (*)', name: 'company' },
            { label: 'Mã số thuế', name: 'taxCode', type: 'number' },
            { label: 'Số điện thoại (*)', name: 'phone', type: 'number' },
            { label: 'Email', name: 'email', type: 'email' },
            { label: 'Website', name: 'website' },
            { label: 'Người hỗ trợ', name: 'supportName' },
            { label: 'SĐT người hỗ trợ', name: 'supportPhone', type: 'number' },
            { label: 'Địa chỉ', name: 'address' }
          ].map(({ label, name, type = 'text' }) => (
            <TextField
              key={name}
              fullWidth
              label={label}
              name={name}
              type={type}
              value={formData[name]}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {isEdit ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
