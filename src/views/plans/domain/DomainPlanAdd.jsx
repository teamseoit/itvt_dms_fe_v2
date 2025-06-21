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

const INITIAL_FORM_STATE = {
  extension: '',
  nameAction: '',
  purchasePrice: '',
  retailPrice: '',
  vat: '',
  supplierId: ''
};

const DOMAIN_ACTIONS = [
  { key: '0', label: 'Đăng ký mới' },
  { key: '1', label: 'Duy trì' },
  { key: '2', label: 'Chuyển nhà đăng ký' }
];

export default function DomainPlanAdd() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const { hasPermission } = usePermissions();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [serviceSupplier, setServiceSupplier] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: formatCurrencyInput(value)
    }));
  };

  const loadServiceSuppliers = async () => {
    try {
      const response = await SERVICE_SUPPLIER_API.getAll({ limit: 1000 });
      if (response.data.success) {
        setServiceSupplier(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách nhà cung cấp');
    }
  };

  const loadDomainPlan = async () => {
    try {
      const response = await DOMAIN_PLAN_API.getById(id);
      if (response.data.success) {
        const { extension, nameAction, purchasePrice, retailPrice, vat, supplierId } = response.data.data;
        setFormData({
          extension: extension || '',
          nameAction: nameAction || '',
          purchasePrice: formatCurrencyInput(purchasePrice?.toString() || '0'),
          retailPrice: formatCurrencyInput(retailPrice?.toString() || '0'),
          vat: vat || 0,
          supplierId: supplierId?._id || ''
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin gói dịch vụ tên miền');
      navigate('/goi-dich-vu/ten-mien');
    }
  };

  useEffect(() => {
    loadServiceSuppliers();
    if (isEdit) {
      loadDomainPlan();
    }
  }, [id]);

  const validateForm = () => {
    const validations = [
      { condition: !formData.extension.trim(), message: 'Vui lòng nhập đuôi tên miền' },
      { condition: !formData.nameAction && !isEdit, message: 'Vui lòng chọn hành động' },
      { condition: !formData.purchasePrice, message: 'Vui lòng nhập giá vốn' },
      { condition: !formData.retailPrice, message: 'Vui lòng nhập giá bán' },
      { condition: !formData.supplierId, message: 'Vui lòng chọn nhà cung cấp' }
    ];

    const error = validations.find(v => v.condition);
    if (error) {
      toast.error(error.message);
      return false;
    }
    return true;
  };

  const checkPermissions = () => {
    if (isEdit && !hasPermission(PERMISSIONS.DOMAIN_PLAN.UPDATE)) {
      toast.error('Bạn không có quyền cập nhật gói dịch vụ tên miền');
      return false;
    }
    if (!isEdit && !hasPermission(PERMISSIONS.DOMAIN_PLAN.ADD)) {
      toast.error('Bạn không có quyền thêm gói dịch vụ tên miền mới');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !checkPermissions()) return;

    try {
      setLoading(true);
      const domainPlanData = {
        ...formData,
        purchasePrice: parseCurrency(formData.purchasePrice),
        retailPrice: parseCurrency(formData.retailPrice),
        vat: Number(formData.vat)
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

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="text"
          color="primary"
          onClick={() => navigate('/goi-dich-vu/ten-mien')}
          startIcon={<IconArrowLeft />}
          sx={{ mr: 2 }}
        >
          Quay lại
        </Button>
        <Typography variant="h3">
          {isEdit ? 'Cập nhật gói dịch tên miền' : 'Thêm gói dịch vụ tên miền mới'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Đuôi tên miền (ví dụ: .com) (*)"
            name="extension"
            value={formData.extension}
            onChange={handleInputChange}
            disabled={isEdit}
            sx={{ mb: 3 }}
          />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="group-label">Hành động (*)</InputLabel>
            <Select
              labelId="group-label"
              name="nameAction"
              value={formData.nameAction || "0"}
              onChange={handleInputChange}
              disabled={isEdit}
              label="Hành động (*)"
            >
              {DOMAIN_ACTIONS.map(action => (
                <MenuItem key={action.key} value={action.key}>
                  {action.label}
                </MenuItem>
              ))}
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
            onChange={handleInputChange}
            sx={{ mb: 3 }}
            inputProps={{ inputMode: 'numeric' }}
          />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="group-label">Nhà cung cấp (*)</InputLabel>
            <Select
              labelId="group-label"
              name="supplierId"
              value={formData.supplierId}
              onChange={handleInputChange}
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
