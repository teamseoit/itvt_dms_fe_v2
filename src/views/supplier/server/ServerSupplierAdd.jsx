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

import SERVER_SUPPLIER_API from '../../../services/serverSupplierService';

export default function ServerSupplierAdd() {
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

  const fetchServerSupplier = async () => {
    try {
      const res = await SERVER_SUPPLIER_API.getById(id);
      if (res?.data?.success) {
        const serverSupplier = res.data.data;
        setFormData({
          name: serverSupplier.name || '',
          company: serverSupplier.company || '',
          taxCode: serverSupplier.taxCode || '',
          phone: serverSupplier.phone || '',
          email: serverSupplier.email || '',
          website: serverSupplier.website || '',
          supportName: serverSupplier.supportName || '',
          supportPhone: serverSupplier.supportPhone || '',
          address: serverSupplier.address || ''
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tải thông tin nhà cung cấp');
      navigate('/ncc/server');
    }
  };

  useEffect(() => {
    if (isEdit) fetchServerSupplier();
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

    try {
      setLoading(true);
      const res = isEdit
        ? await SERVER_SUPPLIER_API.update(id, formData)
        : await SERVER_SUPPLIER_API.create(formData);

      if (res?.data?.success) {
        toast.success(isEdit ? 'Cập nhật thành công' : 'Thêm mới thành công');
        navigate('/ncc/server');
      } else {
        toast.error(res?.data?.message || 'Đã có lỗi xảy ra');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate('/ncc/server');

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="text"
          color="primary"
          onClick={handleBack}
          startIcon={<IconArrowLeft />}
        >
          Quay lại
        </Button>
        <Typography variant="h4" sx={{ ml: 2 }}>
          {isEdit ? 'Cập nhật nhà cung cấp server' : 'Thêm nhà cung cấp server'}
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
