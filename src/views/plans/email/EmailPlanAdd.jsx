import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import {
  Box, Button, Typography, Paper, TextField,
  FormControl, InputLabel, Select, MenuItem, Switch
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';

import EMAIL_PLAN_API from '../../../services/plans/emailPlanService';
import SERVICE_SUPPLIER_API from '../../../services/serviceSupplierService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';

import { formatCurrencyInput, parseCurrency } from '../../../utils/formatConstants';

export default function EmailPlanAdd() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [serviceSupplier, setServiceSupplier] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    purchasePrice: '',
    retailPrice: '',
    renewalPrice: '',
    accountCount: '',
    storagePerAccountGB: '',
    emailFeatures: '',
    supplier: '',
    isActive: true
  });

  const { hasPermission } = usePermissions();

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = formatCurrencyInput(value);
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const fetchServiceSupplier = async () => {
    try {
      const response = await SERVICE_SUPPLIER_API.getAll({ limit: 1000 });
      if (response.data.success) {
        setServiceSupplier(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách nhà cung cấp');
    }
  };

  const fetchEmailPlan = async () => {
    try {
      const response = await EMAIL_PLAN_API.getById(id);
      if (response.data.success) {
        const emailPlanData = response.data.data;
        setFormData({
          name: emailPlanData.name || '',
          purchasePrice: formatCurrencyInput(emailPlanData.purchasePrice?.toString() || '0'),
          retailPrice: formatCurrencyInput(emailPlanData.retailPrice?.toString() || '0'),
          renewalPrice: formatCurrencyInput(emailPlanData.renewalPrice?.toString() || '0'),
          accountCount: emailPlanData.accountCount || '',
          storagePerAccountGB: emailPlanData.storagePerAccountGB || '',
          emailFeatures: emailPlanData.emailFeatures || '',
          supplier: emailPlanData.supplier?._id || emailPlanData.supplier || '',
          isActive: emailPlanData.isActive ?? true
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin gói dịch vụ email');
      navigate('/goi-dich-vu/email');
    }
  };

  useEffect(() => {
    fetchServiceSupplier();
    if (isEdit) {
      fetchEmailPlan();
    }
  }, [id]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên gói');
      return false;
    }

    if (!formData.purchasePrice) {
      toast.error('Vui lòng nhập giá nhập');
      return false;
    }

    if (!formData.retailPrice) {
      toast.error('Vui lòng nhập giá bán');
      return false;
    }

    if (!formData.renewalPrice) {
      toast.error('Vui lòng nhập giá gia hạn');
      return false;
    }

    if (!formData.accountCount) {
      toast.error('Vui lòng nhập số tài khoản');
      return false;
    }

    if (!formData.storagePerAccountGB || formData.storagePerAccountGB < 1) {
      toast.error('Vui lòng nhập dung lượng lưu trữ');
      return false;
    }

    if (!formData.supplier) {
      toast.error('Vui lòng chọn nhà cung cấp');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEdit && !hasPermission(PERMISSIONS.EMAIL_PLAN.UPDATE)) {
      toast.error('Bạn không có quyền cập nhật gói dịch vụ email');
      return;
    }

    if (!isEdit && !hasPermission(PERMISSIONS.EMAIL_PLAN.ADD)) {
      toast.error('Bạn không có quyền thêm gói dịch vụ email mới');
      return;
    }

    try {
      setLoading(true);
      const emailPlanData = {
        name: formData.name,
        purchasePrice: parseCurrency(formData.purchasePrice),
        retailPrice: parseCurrency(formData.retailPrice),
        renewalPrice: parseCurrency(formData.renewalPrice),
        accountCount: Number(formData.accountCount),
        storagePerAccountGB: Number(formData.storagePerAccountGB),
        emailFeatures: formData.emailFeatures,
        supplier: formData.supplier,
        isActive: formData.isActive
      };

      const response = isEdit
        ? await EMAIL_PLAN_API.update(id, emailPlanData)
        : await EMAIL_PLAN_API.create(emailPlanData);

      if (response?.data?.success) {
        toast.success(isEdit ? 'Cập nhật gói dịch vụ email thành công' : 'Thêm gói dịch vụ email thành công');
        navigate('/goi-dich-vu/email');
      } else {
        toast.error(response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} gói dịch vụ email`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} gói dịch vụ email`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/goi-dich-vu/email');
  };

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
          <Typography variant="h3">{isEdit ? 'Cập nhật gói dịch vụ email' : 'Thêm gói dịch vụ email mới'}</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tên gói (*)"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isEdit}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Giá nhập (*)"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handlePriceChange}
            sx={{ mb: 3 }}
            inputProps={{ inputMode: 'numeric' }}
          />
          <TextField
            fullWidth
            label="Giá bán (*)"
            name="retailPrice"
            value={formData.retailPrice}
            onChange={handlePriceChange}
            sx={{ mb: 3 }}
            inputProps={{ inputMode: 'numeric' }}
          />
          <TextField
            fullWidth
            label="Giá gia hạn hàng năm (*)"
            name="renewalPrice"
            value={formData.renewalPrice}
            onChange={handlePriceChange}
            sx={{ mb: 3 }}
            inputProps={{ inputMode: 'numeric' }}
          />
          <TextField
            fullWidth
            label="Số tài khoản (*)"
            name="accountCount"
            type="number"
            value={formData.accountCount}
            onChange={handleChange}
            sx={{ mb: 3 }}
            inputProps={{ min: 1 }}
          />
          <TextField
            fullWidth
            label="Dung lượng (GB) (*)"
            name="storagePerAccountGB"
            type="number"
            value={formData.storagePerAccountGB}
            onChange={handleChange}
            sx={{ mb: 3 }}
            inputProps={{ min: 1 }}
          />
          <TextField
            fullWidth
            label="Tính năng email"
            name="emailFeatures"
            value={formData.emailFeatures}
            onChange={handleChange}
            multiline
            rows={4}
            sx={{ mb: 3 }}
            placeholder="Nhập các tính năng của gói email..."
          />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="group-label">Nhà cung cấp (*)</InputLabel>
            <Select
              labelId="group-label"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              disabled={isEdit}
              label="Nhà cung cấp (*)"
            >
              {serviceSupplier.map((supplier) => (
                <MenuItem key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mb: 3 }}>
            <Typography component="span" sx={{ mr: 2 }}>
              Hiển thị gói dịch vụ
            </Typography>
            <Switch
              name="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  isActive: e.target.checked
                }))
              }
          />
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {isEdit ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
