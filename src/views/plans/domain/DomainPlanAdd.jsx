import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import {
  Box, Button, Typography, Paper, TextField,
  FormControl, InputLabel, Select, MenuItem, Switch
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';

import DOMAIN_PLAN_API from '../../../services/plans/domainPlanService';
import SERVICE_SUPPLIER_API from '../../../services/serviceSupplierService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';

import { formatCurrencyInput, parseCurrency } from '../../../utils/formatConstants';

export default function DomainPlanAdd() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [serviceSupplier, setServiceSupplier] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    extension: '',
    purchasePrice: '',
    retailPrice: '',
    renewalPrice: '',
    registrationYears: 1,
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

  const fetchDomainPlan = async () => {
    try {
      const response = await DOMAIN_PLAN_API.getById(id);
      if (response.data.success) {
        const domainPlanData = response.data.data;
        setFormData({
          name: domainPlanData.name || '',
          extension: domainPlanData.extension || '',
          purchasePrice: formatCurrencyInput(domainPlanData.purchasePrice?.toString() || '0'),
          retailPrice: formatCurrencyInput(domainPlanData.retailPrice?.toString() || '0'),
          renewalPrice: formatCurrencyInput(domainPlanData.renewalPrice?.toString() || '0'),
          registrationYears: domainPlanData.registrationYears || 1,
          supplier: domainPlanData.supplier?._id || domainPlanData.supplier || '',
          isActive: domainPlanData.isActive ?? true
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin gói dịch vụ tên miền');
      navigate('/goi-dich-vu/ten-mien');
    }
  };

  useEffect(() => {
    fetchServiceSupplier();
    if (isEdit) {
      fetchDomainPlan();
    }
  }, [id]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên gói');
      return false;
    }

    if (!formData.extension.trim()) {
      toast.error('Vui lòng nhập đuôi tên miền');
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

    if (!formData.supplier) {
      toast.error('Vui lòng chọn nhà cung cấp');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEdit && !hasPermission(PERMISSIONS.DOMAIN_PLAN.UPDATE)) {
      toast.error('Bạn không có quyền cập nhật gói dịch vụ tên miền');
      return;
    }

    if (!isEdit && !hasPermission(PERMISSIONS.DOMAIN_PLAN.ADD)) {
      toast.error('Bạn không có quyền thêm gói dịch vụ tên miền mới');
      return;
    }

    try {
      setLoading(true);
      const domainPlanData = {
        name: formData.name,
        extension: formData.extension,
        purchasePrice: parseCurrency(formData.purchasePrice),
        retailPrice: parseCurrency(formData.retailPrice),
        renewalPrice: parseCurrency(formData.renewalPrice),
        registrationYears: Number(formData.registrationYears) || 1,
        supplier: formData.supplier,
        isActive: formData.isActive
      };

      const response = isEdit
        ? await DOMAIN_PLAN_API.update(id, domainPlanData)
        : await DOMAIN_PLAN_API.create(domainPlanData);

      if (response?.data?.success) {
        toast.success(isEdit ? 'Cập nhật gói dịch vụ tên miền thành công' : 'Thêm gói dịch vụ tên miền thành công');
        navigate('/goi-dich-vu/ten-mien');
      } else {
        toast.error(response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} gói dịch vụ tên miền`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} gói dịch vụ tên miền`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/goi-dich-vu/ten-mien');
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
        <Typography variant="h3">{isEdit ? 'Cập nhật gói dịch tên miền' : 'Thêm gói dịch vụ tên miền mới'}</Typography>
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
            label="Đuôi tên miền (ví dụ: .com) (*)"
            name="extension"
            value={formData.extension}
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
            label="Số năm đăng ký mặc định"
            name="registrationYears"
            type="number"
            value={formData.registrationYears}
            onChange={handleChange}
            sx={{ mb: 3 }}
            inputProps={{ min: 1 }}
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
