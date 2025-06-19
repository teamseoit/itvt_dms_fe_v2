import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import {
  Box, Button, Typography, Paper, TextField,
  FormControl, InputLabel, Select, MenuItem
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
    extension: '',
    nameAction: '',
    purchasePrice: '',
    retailPrice: '',
    vat: '',
    supplierId: ''
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
          extension: domainPlanData.extension || '',
          nameAction: domainPlanData.nameAction || '',
          purchasePrice: formatCurrencyInput(domainPlanData.purchasePrice?.toString() || '0'),
          retailPrice: formatCurrencyInput(domainPlanData.retailPrice?.toString() || '0'),
          vat: domainPlanData.vat || 0,
          supplierId: domainPlanData.supplierId?._id || ''
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
    if (!formData.extension.trim()) {
      toast.error('Vui lòng nhập đuôi tên miền');
      return false;
    }

    if (!formData.nameAction) {
      toast.error('Vui lòng chọn hành động');
      return false;
    }

    if (!formData.purchasePrice) {
      toast.error('Vui lòng nhập giá vốn');
      return false;
    }

    if (!formData.retailPrice) {
      toast.error('Vui lòng nhập giá bán');
      return false;
    }

    if (!formData.supplierId) {
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
        extension: formData.extension,
        nameAction: formData.nameAction,
        purchasePrice: parseCurrency(formData.purchasePrice),
        retailPrice: parseCurrency(formData.retailPrice),
        vat: Number(formData.vat),
        supplierId: formData.supplierId
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
            label="Đuôi tên miền (ví dụ: .com) (*)"
            name="extension"
            value={formData.extension}
            onChange={handleChange}
            disabled={isEdit}
            sx={{ mb: 3 }}
          />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="group-label">Hành động (*)</InputLabel>
            <Select
              labelId="group-label"
              name="nameAction"
              value={formData.nameAction}
              onChange={handleChange}
              disabled={isEdit}
              label="Hành động (*)"
            >
              <MenuItem key="0" value="0">Đăng ký mới</MenuItem>
              <MenuItem key="1" value="1">Duy trì</MenuItem>
              <MenuItem key="2" value="2">Chuyển nhà đăng ký</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Giá vốn (*)"
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
            label="VAT (%)"
            name="vat"
            value={formData.vat}
            onChange={handleChange}
            sx={{ mb: 3 }}
            inputProps={{ inputMode: 'numeric' }}
          />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="group-label">Nhà cung cấp (*)</InputLabel>
            <Select
              labelId="group-label"
              name="supplierId"
              value={formData.supplierId}
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
