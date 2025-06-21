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
  const [serviceSuppliers, setServiceSuppliers] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: formatCurrencyInput(value) }));
  };

  const loadServiceSuppliers = async () => {
    try {
      const response = await SERVICE_SUPPLIER_API.getAll({ limit: 1000 });
      if (response.data.success) {
        setServiceSuppliers(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải nhà cung cấp');
    }
  };

  const loadDomainPlan = async () => {
    try {
      const response = await DOMAIN_PLAN_API.getById(id);
      if (response.data.success) {
        const { extension, nameAction, purchasePrice, retailPrice, vat, supplierId } = response.data.data;
        setFormData({
          extension: extension || '',
          nameAction: nameAction?.toString() || '',
          purchasePrice: formatCurrencyInput(purchasePrice?.toString() || '0'),
          retailPrice: formatCurrencyInput(retailPrice?.toString() || '0'),
          vat: vat?.toString() || '',
          supplierId: supplierId?._id || ''
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải gói tên miền');
      navigate('/goi-dich-vu/ten-mien');
    }
  };

  useEffect(() => {
    loadServiceSuppliers();
    if (isEdit) loadDomainPlan();
  }, [id]);

  const validateForm = () => {
    const requiredFields = [
      { field: 'extension', label: 'đuôi tên miền' },
      { field: 'nameAction', label: 'hành động' },
      { field: 'purchasePrice', label: 'giá vốn' },
      { field: 'retailPrice', label: 'giá bán' },
      { field: 'supplierId', label: 'nhà cung cấp' }
    ];
    const missing = requiredFields.find(({ field }) => !formData[field]?.toString().trim());
    if (missing) {
      toast.error(`Vui lòng nhập ${missing.label}`);
      return false;
    }
    return true;
  };

  const checkPermissions = () => {
    const canProceed = isEdit
      ? hasPermission(PERMISSIONS.DOMAIN_PLAN.UPDATE)
      : hasPermission(PERMISSIONS.DOMAIN_PLAN.ADD);

    if (!canProceed) {
      toast.error(`Bạn không có quyền ${isEdit ? 'cập nhật' : 'thêm'} gói tên miền`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !checkPermissions()) return;

    try {
      setLoading(true);
      const payload = {
        ...formData,
        nameAction: Number(formData.nameAction),
        purchasePrice: parseCurrency(formData.purchasePrice),
        retailPrice: parseCurrency(formData.retailPrice),
        vat: Number(formData.vat)
      };

      const response = isEdit
        ? await DOMAIN_PLAN_API.update(id, payload)
        : await DOMAIN_PLAN_API.create(payload);

      if (response?.data?.success) {
        toast.success(`${isEdit ? 'Cập nhật' : 'Thêm'} thành công`);
        navigate('/goi-dich-vu/ten-mien');
      } else {
        throw new Error(response?.data?.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Lỗi khi ${isEdit ? 'cập nhật' : 'thêm'} gói`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button variant="text" onClick={() => navigate('/goi-dich-vu/ten-mien')} startIcon={<IconArrowLeft />} sx={{ mr: 2 }}>
          Quay lại
        </Button>
        <Typography variant="h3">{isEdit ? 'Cập nhật gói dịch tên miền' : 'Thêm gói dịch vụ tên miền mới'}</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Đuôi tên miền (*)" name="extension" value={formData.extension} onChange={handleInputChange} disabled={isEdit} sx={{ mb: 3 }} />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Hành động (*)</InputLabel>
            <Select name="nameAction" value={formData.nameAction} onChange={handleInputChange} disabled={isEdit} label="Hành động (*)">
              {DOMAIN_ACTIONS.map(({ key, label }) => (
                <MenuItem key={key} value={key}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField fullWidth label="Giá vốn (*)" name="purchasePrice" value={formData.purchasePrice} onChange={handlePriceChange} sx={{ mb: 3 }} inputProps={{ inputMode: 'numeric' }} />
          <TextField fullWidth label="Giá bán (*)" name="retailPrice" value={formData.retailPrice} onChange={handlePriceChange} sx={{ mb: 3 }} inputProps={{ inputMode: 'numeric' }} />
          <TextField fullWidth label="VAT (%)" name="vat" value={formData.vat} onChange={handleInputChange} sx={{ mb: 3 }} inputProps={{ inputMode: 'numeric' }} />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Nhà cung cấp (*)</InputLabel>
            <Select name="supplierId" value={formData.supplierId} onChange={handleInputChange} disabled={isEdit} label="Nhà cung cấp (*)">
              {serviceSuppliers.map(({ _id, name }) => (
                <MenuItem key={_id} value={_id}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" disabled={loading}>{isEdit ? 'Cập nhật' : 'Thêm mới'}</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
