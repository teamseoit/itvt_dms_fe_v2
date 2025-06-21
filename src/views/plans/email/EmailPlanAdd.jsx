import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import {
  Box, Button, Typography, Paper, TextField,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';

import EMAIL_PLAN_API from '../../../services/plans/emailPlanService';
import SERVICE_SUPPLIER_API from '../../../services/serviceSupplierService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';
import { formatCurrencyInput, parseCurrency } from '../../../utils/formatConstants';

const EMAIL_ACTIONS = [
  { key: '0', label: 'Đăng ký mới' },
  { key: '1', label: 'Duy trì' },
  { key: '2', label: 'Chuyển nhà đăng ký' }
];

const INITIAL_FORM_STATE = {
  name: '',
  nameAction: '',
  description: '',
  purchasePrice: '',
  retailPrice: '',
  vat: 0,
  supplierId: ''
};

export default function EmailPlanAdd() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const { hasPermission } = usePermissions();

  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [serviceSuppliers, setServiceSuppliers] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const handleInputChange = ({ target: { name, value } }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = ({ target: { name, value } }) => {
    setFormData(prev => ({ ...prev, [name]: formatCurrencyInput(value) }));
  };

  const validateForm = () => {
    const rules = [
      { invalid: !formData.name.trim(), message: 'Vui lòng nhập tên gói' },
      { invalid: !formData.nameAction, message: 'Vui lòng chọn hành động' },
      { invalid: !formData.description, message: 'Vui lòng nhập mô tả' },
      { invalid: !formData.purchasePrice, message: 'Vui lòng nhập giá vốn' },
      { invalid: !formData.retailPrice, message: 'Vui lòng nhập giá bán' },
      { invalid: !formData.supplierId, message: 'Vui lòng chọn nhà cung cấp' }
    ];

    const error = rules.find(rule => rule.invalid);
    if (error) {
      toast.error(error.message);
      return false;
    }
    return true;
  };

  const checkPermissions = () => {
    if (isEdit && !hasPermission(PERMISSIONS.EMAIL_PLAN.UPDATE)) {
      toast.error('Bạn không có quyền cập nhật gói dịch vụ email');
      return false;
    }
    if (!isEdit && !hasPermission(PERMISSIONS.EMAIL_PLAN.ADD)) {
      toast.error('Bạn không có quyền thêm gói dịch vụ email mới');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !checkPermissions()) return;

    const payload = {
      ...formData,
      purchasePrice: parseCurrency(formData.purchasePrice),
      retailPrice: parseCurrency(formData.retailPrice)
    };

    try {
      setLoading(true);
      const res = isEdit
        ? await EMAIL_PLAN_API.update(id, payload)
        : await EMAIL_PLAN_API.create(payload);

      if (res?.data?.success) {
        toast.success(`${isEdit ? 'Cập nhật' : 'Thêm'} gói dịch vụ email thành công`);
        navigate('/goi-dich-vu/email');
      } else {
        throw new Error(res?.data?.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} gói dịch vụ email`);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceSuppliers = async () => {
    try {
      const res = await SERVICE_SUPPLIER_API.getAll({ limit: 1000 });
      if (res.data.success) {
        setServiceSuppliers(res.data.data || []);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Lỗi khi tải danh sách nhà cung cấp');
    }
  };

  const fetchEmailPlan = async () => {
    try {
      const res = await EMAIL_PLAN_API.getById(id);
      if (res.data.success) {
        const {
          name, nameAction, description,
          purchasePrice, retailPrice, vat, supplierId
        } = res.data.data;

        setFormData({
          name: name || '',
          nameAction: nameAction?.toString() || '',
          description: description || '',
          purchasePrice: formatCurrencyInput(purchasePrice?.toString() || '0'),
          retailPrice: formatCurrencyInput(retailPrice?.toString() || '0'),
          vat: vat || 0,
          supplierId: supplierId?._id || supplierId || ''
        });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không thể tải gói dịch vụ email');
      navigate('/goi-dich-vu/email');
    }
  };

  useEffect(() => {
    fetchServiceSuppliers();
    if (isEdit) fetchEmailPlan();
  }, [id]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button onClick={() => navigate('/goi-dich-vu/email')} startIcon={<IconArrowLeft />}>
          Quay lại
        </Button>
        <Typography variant="h3" sx={{ ml: 2 }}>
          {isEdit ? 'Cập nhật gói dịch vụ email' : 'Thêm gói dịch vụ email mới'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tên gói (*)"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={isEdit}
            sx={{ mb: 3 }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Hành động (*)</InputLabel>
            <Select
              name="nameAction"
              value={formData.nameAction}
              onChange={handleInputChange}
              disabled={isEdit}
              label="Hành động (*)"
            >
              {EMAIL_ACTIONS.map(({ key, label }) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Mô tả (*)"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={4}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Giá vốn (*)"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handlePriceChange}
            inputProps={{ inputMode: 'numeric' }}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Giá bán (*)"
            name="retailPrice"
            value={formData.retailPrice}
            onChange={handlePriceChange}
            inputProps={{ inputMode: 'numeric' }}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="VAT (%)"
            name="vat"
            value={formData.vat}
            onChange={handleInputChange}
            inputProps={{ inputMode: 'numeric' }}
            sx={{ mb: 3 }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Nhà cung cấp (*)</InputLabel>
            <Select
              name="supplierId"
              value={formData.supplierId}
              onChange={handleInputChange}
              disabled={isEdit}
              label="Nhà cung cấp (*)"
            >
              {serviceSuppliers.map(({ _id, name }) => (
                <MenuItem key={_id} value={_id}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {isEdit ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
