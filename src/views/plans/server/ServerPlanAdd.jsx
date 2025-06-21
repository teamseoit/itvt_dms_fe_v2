import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import {
  Box, Button, Typography, Paper, TextField,
  FormControl, InputLabel, Select, MenuItem, Switch, Stack, Chip
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';

import SERVER_PLAN_API from '../../../services/plans/serverPlanService';
import SERVER_SUPPLIER_API from '../../../services/serverSupplierService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';

import { formatCurrencyInput, parseCurrency } from '../../../utils/formatConstants';

export default function ServerPlanAdd() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [serverSupplier, setServerSupplier] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    cpu: '',
    ramInGB: '',
    storageInGB: '',
    bandwidthInTB: '',
    purchasePrice: '',
    retailPrice: '',
    durationInMonths: 1,
    ipAddress: [],
    description: '',
    supplier: ''
  });

  const [ipAddressInput, setIpAddressInput] = useState('');

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

  const handleIpAddressInputChange = (e) => {
    setIpAddressInput(e.target.value);
  };

  const handleAddIpAddress = () => {
    const trimmedInput = ipAddressInput.trim();
    if (trimmedInput) {
      if (formData.ipAddress.includes(trimmedInput)) {
        toast.error('Địa chỉ IP này đã tồn tại');
      } else {
        setFormData(prev => ({
          ...prev,
          ipAddress: [...prev.ipAddress, trimmedInput]
        }));
        setIpAddressInput('');
      }
    }
  };

  const handleRemoveIpAddress = (index) => {
    setFormData(prev => ({
      ...prev,
      ipAddress: prev.ipAddress.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIpAddress();
    }
  };

  const fetchServerSupplier = async () => {
    try {
      const response = await SERVER_SUPPLIER_API.getAll({ limit: 1000 });
      if (response.data.success) {
        setServerSupplier(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách nhà cung cấp server');
    }
  };

  const fetchServerPlan = async () => {
    try {
      const response = await SERVER_PLAN_API.getById(id);
      if (response.data.success) {
        const serverPlanData = response.data.data;
        setFormData({
          name: serverPlanData.name || '',
          cpu: serverPlanData.cpu || '',
          ramInGB: serverPlanData.ramInGB?.toString() || '',
          storageInGB: serverPlanData.storageInGB?.toString() || '',
          bandwidthInTB: serverPlanData.bandwidthInTB?.toString() || '',
          purchasePrice: formatCurrencyInput(serverPlanData.purchasePrice?.toString() || '0'),
          retailPrice: formatCurrencyInput(serverPlanData.retailPrice?.toString() || '0'),
          durationInMonths: serverPlanData.durationInMonths || 1,
          ipAddress: serverPlanData.ipAddress || [],
          description: serverPlanData.description || '',
          supplier: serverPlanData.supplier?._id || serverPlanData.supplier || ''
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin gói dịch vụ server');
      navigate('/goi-dich-vu/server');
    }
  };

  useEffect(() => {
    fetchServerSupplier();
    if (isEdit) {
      fetchServerPlan();
    }
  }, [id]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên gói');
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

    if (!formData.supplier) {
      toast.error('Vui lòng chọn nhà cung cấp');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEdit && !hasPermission(PERMISSIONS.SERVER_PLAN?.UPDATE)) {
      toast.error('Bạn không có quyền cập nhật gói dịch vụ server');
      return;
    }

    if (!isEdit && !hasPermission(PERMISSIONS.SERVER_PLAN?.ADD)) {
      toast.error('Bạn không có quyền thêm gói dịch vụ server mới');
      return;
    }

    try {
      setLoading(true);
      const serverPlanData = {
        name: formData.name,
        cpu: formData.cpu,
        ramInGB: parseInt(formData.ramInGB),
        storageInGB: parseInt(formData.storageInGB),
        bandwidthInTB: parseInt(formData.bandwidthInTB),
        purchasePrice: parseCurrency(formData.purchasePrice),
        retailPrice: parseCurrency(formData.retailPrice),
        durationInMonths: parseInt(formData.durationInMonths),
        ipAddress: formData.ipAddress,
        description: formData.description,
        supplier: formData.supplier
      };

      const response = isEdit
        ? await SERVER_PLAN_API.update(id, serverPlanData)
        : await SERVER_PLAN_API.create(serverPlanData);

      if (response?.data?.success) {
        toast.success(isEdit ? 'Cập nhật gói dịch vụ server thành công' : 'Thêm gói dịch vụ server thành công');
        navigate('/goi-dich-vu/server');
      } else {
        toast.error(response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} gói dịch vụ server`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} gói dịch vụ server`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/goi-dich-vu/server');
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
        <Typography variant="h3">{isEdit ? 'Cập nhật gói dịch vụ server' : 'Thêm gói dịch vụ server mới'}</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tên gói (*)"
            name="name"
            value={formData.name}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="CPU"
            name="cpu"
            value={formData.cpu}
            onChange={handleChange}
            placeholder="VD: Intel Xeon E5-2680 v4"
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="RAM (GB)"
            name="ramInGB"
            type="number"
            value={formData.ramInGB}
            onChange={handleChange}
            inputProps={{ min: 1 }}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Lưu trữ (GB)"
            name="storageInGB"
            type="number"
            value={formData.storageInGB}
            onChange={handleChange}
            inputProps={{ min: 1 }}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Băng thông (TB)"
            name="bandwidthInTB"
            type="number"
            value={formData.bandwidthInTB}
            onChange={handleChange}
            inputProps={{ min: 1 }}
            sx={{ mb: 3 }}
          />
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
            label="Thời hạn (tháng)"
            name="durationInMonths"
            type="number"
            value={formData.durationInMonths}
            onChange={handleChange}
            inputProps={{ min: 1 }}
            sx={{ mb: 3 }}
          />
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Địa chỉ IP
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="Thêm địa chỉ IP"
                value={ipAddressInput}
                onChange={handleIpAddressInputChange}
                onKeyPress={handleKeyPress}
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleAddIpAddress}
                disabled={!ipAddressInput.trim()}
              >
                Thêm
              </Button>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {formData.ipAddress.map((ipAddress, index) => (
                <Chip
                  key={index}
                  label={ipAddress}
                  onDelete={() => handleRemoveIpAddress(index)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
          <TextField
            fullWidth
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            sx={{ mb: 3 }}
          />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="supplier-label">Nhà cung cấp (*)</InputLabel>
            <Select
              labelId="supplier-label"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              label="Nhà cung cấp (*)"
            >
              {serverSupplier.map((supplier) => (
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